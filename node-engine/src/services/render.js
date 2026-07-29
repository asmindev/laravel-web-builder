const ejs = require('ejs');
const vm = require('node:vm');
const express = require('express');

const TIMEOUT_MS = 500;

/**
 * Renders published EJS projects in a sandboxed Node.js vm context.
 * Flow: Cache check → API fetch → compile EJS → sandbox → return HTML → cache.
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
        const entry = files.find((f) => f.path.endsWith('/index.ejs') || f.path === 'index.ejs')
            || files.find((f) => f.path.endsWith('/index.html') || f.path === 'index.html')
            || files[0];
        if (!entry) throw new Error('NO_ENTRY_FILE');

        const html = await this.sandboxRender(entry.content, project.config || {});

        this.cache.set(`project:${slug}`, html);
        return html;
    }

    /**
     * Try to execute the project as an Express app (via app.js or script.js).
     * Returns true if handled, false to fallback to EJS rendering.
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
            process: { env: { PORT: '3000' }, exit: () => {} },
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

        const origUrl = req.url;

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

    async sandboxRender(templateContent, config) {
        const compiled = ejs.compile(templateContent, { client: true, strict: false });

        const sandbox = {
            config,
            _: {},
            dayjs: null,
            console: { log: () => {} },
            setTimeout: undefined,
            setInterval: undefined,
            require: undefined,
            import: undefined,
            __dirname: undefined,
            __filename: undefined,
            module: undefined,
            exports: undefined,
            process: undefined,
            Buffer: undefined,
            global: undefined,
        };

        const context = vm.createContext(sandbox);
        const fnSrc = compiled.toString();

        try {
            const script = new vm.Script(
                `(function() { const __template = (${fnSrc}); return __template(config); })()`,
                { timeout: TIMEOUT_MS },
            );
            const result = script.runInContext(context, { timeout: TIMEOUT_MS });
            return String(result ?? '');
        } catch (err) {
            console.error('Sandbox render failed:', err.message);
            return '<html><body><p>Render error</p></body></html>';
        }
    }
}

module.exports = { RenderService };
