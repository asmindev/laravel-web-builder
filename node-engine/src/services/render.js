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
        const entry = files.find((f) => f.path.endsWith('/index.html') || f.path === 'index.html' || f.path === 'index.ejs' || f.path === 'views/index.ejs');
        if (!entry) {
            const firstHtml = files.find((f) => f.path.endsWith('.html') || f.path.endsWith('.ejs'));
            if (!firstHtml) throw new Error('NO_ENTRY_FILE');
            this.cache.set(`project:${slug}`, firstHtml.content);
            return firstHtml.content;
        }

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

        // Skip Express sandbox for projects that require local modules
        // (except relative view paths)
        // if (/require\(['"]\.\//.test(appFile.content)) return false;

        // Strip slug prefix from URL so project's Express routes work
        // e.g. /simple-app/api/info → /api/info
        const prefix = '/' + slug;
        if (req.url.startsWith(prefix + '/') || req.url === prefix) {
            req.url = req.url.slice(prefix.length) || '/';
        }

        const subApp = express();

        // Configure EJS view engine for subApp using project's files
        const ejs = require('ejs');
        subApp.engine('ejs', (viewPath, options, callback) => {
            const relPath = viewPath.replace(/^\//, '');
            const targetFile = files.find(f => f.path === relPath || f.path === `views/${relPath}` || f.path === `${relPath}.ejs` || f.path === `views/${relPath}.ejs` || f.path.endsWith('/' + relPath) || f.path.endsWith('/' + relPath + '.ejs'));
            if (!targetFile) {
                return callback(new Error(`View ${viewPath} not found`));
            }
            try {
                const html = ejs.render(targetFile.content, options, { filename: relPath });
                callback(null, html);
            } catch (err) {
                callback(err);
            }
        });
        subApp.set('view engine', 'ejs');

        // Parse .env file if present in project files
        const envFile = files.find(f => f.path === '.env');
        const envVars = { PORT: '3000' };
        if (envFile && envFile.content) {
            envFile.content.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                    const [k, ...v] = trimmed.split('=');
                    envVars[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
                }
            });
        }

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
                if (name === 'dotenv') {
                    return { config: () => ({ parsed: envVars }) };
                }
                if (name === 'path') {
                    const pathMod = require('path');
                    return {
                        ...pathMod,
                        join: (...args) => args.filter(Boolean).join('/').replace(/\/+/g, '/'),
                        resolve: (...args) => args.filter(Boolean).join('/').replace(/\/+/g, '/'),
                    };
                }
                if (name === 'mysql' || name === 'mysql2' || name === 'mysql2/promise') {
                    const { getShimForSlug } = require('./mysql-shim');
                    const shim = getShimForSlug(slug);
                    return name.endsWith('/promise') ? shim.promise : shim;
                }
                if (name === 'express-session') {
                    const sessionMod = require('express-session');
                    // Shared session store per project slug
                    if (!global.__sessionStores) global.__sessionStores = new Map();
                    if (!global.__sessionStores.has(slug)) {
                        global.__sessionStores.set(slug, new sessionMod.MemoryStore());
                    }
                    const store = global.__sessionStores.get(slug);
                    return (opts = {}) => sessionMod({
                        resave: false,
                        saveUninitialized: false,
                        secret: envVars.SESSION_SECRET || 'secret-key-slug-' + slug,
                        ...opts,
                        store,
                    });
                }
                if (name === 'bcrypt' || name === 'bcryptjs') {
                    return {
                        hash: async (pwd) => pwd,
                        compare: async (pwd, hash) => pwd === hash || hash === pwd,
                        hashSync: (pwd) => pwd,
                        compareSync: (pwd, hash) => pwd === hash || hash === pwd,
                    };
                }
                if (name === 'better-sqlite3' || name === 'sqlite3') {
                    try { return require(name); } catch { return undefined; }
                }
                try { return require(name); } catch { return undefined; }
            },
            console: { log: (...args) => console.log('[project]', ...args), error: (...args) => console.error('[project]', ...args) },
            Buffer,
            URL,
            module: { exports: {} },
            exports: {},
            __dirname: '/',
            __filename: '/app.js',
            process: { env: envVars, exit: () => {}, uptime: () => process.uptime() },
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
            new vm.Script(code, { timeout: 3000 }).runInContext(context, { timeout: 3000 });
        } catch (err) {
            console.error('[project] App script execution error:', err);
            return false;
        }

        return new Promise((resolve) => {
            let done = false;
            const finish = () => { if (!done) { done = true; resolve(true); } };
            const fallback = () => { if (!done) { done = true; resolve(false); } };
            const timeout = setTimeout(fallback, TIMEOUT_MS);

            res.on('finish', finish);
            if (Buffer.isBuffer(req.body)) {
                try {
                    req.body = JSON.parse(req.body.toString('utf-8'));
                } catch {
                    req.body = req.body.toString('utf-8');
                }
            }

            subApp(req, res, () => {
                clearTimeout(timeout);
                res.off('finish', finish);
                fallback();
            });
        });
    }
}

module.exports = { RenderService };
