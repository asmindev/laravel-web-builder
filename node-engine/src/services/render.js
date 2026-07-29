const vm = require('node:vm');
const express = require('express');

const TIMEOUT_MS = 500;

/**
 * Renders published HTML projects in a sandboxed Node.js vm context.
 * Flow: Cache check → API fetch → return entry HTML → cache.
 *
 * Falls back to Express app sandbox for projects with app.js.
 *
 * ponytail: Replace vm with isolated-vm for stronger isolation once
 * isolated-vm becomes compatible with Node 26+.
 */
class RenderService {
    constructor(cache, api) {
        this.cache = cache;
        this.api = api;
    }

    async render(slug, projectData = null) {
        // Proxy dari Laravel selalu kirim data segar — skip cache
        if (!projectData) {
            const cached = this.cache.get(`project:${slug}`);
            if (cached) return cached;
        }

        const project = projectData || await this.api.fetchProject(slug);
        if (!project) throw new Error('NOT_FOUND');
        if (!project.published) throw new Error('NOT_PUBLISHED');

        const files = project.files || [];
        const entry = files.find((f) => f.path.endsWith('/index.html') || f.path === 'index.html')
            || files[0];
        if (!entry) throw new Error('NO_ENTRY_FILE');

        this.cache.set(`project:${slug}`, entry.content);
        return entry.content;
    }

    /**
     * Try to execute the project as an Express app (via app.js or script.js).
     * Returns true if handled, false to fallback to HTML rendering.
     */
    async tryExpressApp(slug, req, res, projectData = null) {
        const project = projectData || await this.api.fetchProject(slug);
        if (!project) return false;
        if (!project.published) return false;

        const files = project.files || [];
        const appFile = files.find((f) => f.path === 'app.js' || f.path === 'script.js');
        if (!appFile) return false;

        // Strip slug prefix from URL so project's Express routes work
        // e.g. /simple-app/api/info → /api/info
        const prefix = '/' + slug;
        if (req.url.startsWith(prefix + '/') || req.url === prefix) {
            req.url = req.url.slice(prefix.length) || '/';
        }

        const subApp = express();

        const sandbox = {
            express: () => subApp,
            require: (name) => {
                if (name === 'express') {
                    const fn = () => subApp;
                    fn.json = express.json;
                    fn.urlencoded = express.urlencoded;
                    fn.static = express.static;
                    fn.Router = express.Router;
                    fn.raw = express.raw;
                    fn.text = express.text;
                    return fn;
                }
                try { return require(name); } catch { return undefined; }
            },
            console: { log: () => {}, error: (...args) => console.error('[project]', ...args) },
            Buffer,
            URL,
            module: { exports: {} },
            exports: {},
            __dirname: '/',
            __filename: '/app.js',
            process: { env: { PORT: '3000' }, exit: () => {}, uptime: () => process.uptime() },
            setTimeout: undefined,
            setInterval: undefined,
        };

        const code = (() => {
            const idx = appFile.content.indexOf('app.listen');
            if (idx === -1) return appFile.content;
            const parenStart = appFile.content.indexOf('(', idx);
            if (parenStart === -1) return appFile.content;
            let depth = 0;
            for (let i = parenStart; i < appFile.content.length; i++) {
                if (appFile.content[i] === '(') depth++;
                else if (appFile.content[i] === ')') {
                    depth--;
                    if (depth === 0) {
                        return appFile.content.slice(0, idx) + appFile.content.slice(i + 1);
                    }
                }
            }
            return appFile.content;
        })();

        const context = vm.createContext(sandbox);
        try {
            new vm.Script(code, { timeout: TIMEOUT_MS }).runInContext(context, { timeout: TIMEOUT_MS });
        } catch (err) {
            console.error('Express sandbox exec failed:', err.message);
            return false;
        }

        return new Promise((resolve) => {
            let done = false;
            const finish = () => { if (!done) { done = true; resolve(true); } };
            const fallback = () => { if (!done) { done = true; resolve(false); } };
            const timeout = setTimeout(fallback, TIMEOUT_MS);

            res.on('finish', finish);
            subApp(req, res, () => {
                clearTimeout(timeout);
                res.off('finish', finish);
                fallback();
            });
        });
    }
}

module.exports = { RenderService };
