const vm = require('node:vm');
const express = require('express');
const path = require('path');

const TIMEOUT_MS = 5000;

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

        subApp.listen = (_port, cb) => {
            if (typeof _port === 'function') _port();
            else if (typeof cb === 'function') cb();
            return subApp;
        };

        const moduleCache = new Map();

        const resolveLocalFile = (reqPath, currentDir = '/') => {
            const clean = reqPath.replace(/^\.\//, '');
            const candidates = [
                clean,
                `${clean}.js`,
                `${clean}.json`,
                `${clean}/index.js`,
                path.join(currentDir, clean).replace(/^\//, ''),
                path.join(currentDir, `${clean}.js`).replace(/^\//, ''),
                path.join(currentDir, `${clean}/index.js`).replace(/^\//, ''),
            ];
            for (const cand of candidates) {
                const f = files.find(file => file.path === cand || file.path === '/' + cand || file.path.endsWith('/' + cand));
                if (f) return f;
            }
            return null;
        };

        const createSandboxRequire = (currentDir = '/') => {
            const customRequire = (name) => {
                if (name.startsWith('.') || name.startsWith('/')) {
                    const localFile = resolveLocalFile(name, currentDir);
                    if (localFile) {
                        return loadLocalModule(localFile);
                    }
                }
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
                    let realBcrypt = null;
                    try { realBcrypt = require('bcrypt'); } catch {}
                    return {
                        genSalt: async (rounds) => {
                            if (realBcrypt) {
                                try { return await realBcrypt.genSalt(rounds || 10); } catch {}
                            }
                            return '$2b$10$abcdefghijklmnopqrstuu';
                        },
                        genSaltSync: (rounds) => {
                            if (realBcrypt) {
                                try { return realBcrypt.genSaltSync(rounds || 10); } catch {}
                            }
                            return '$2b$10$abcdefghijklmnopqrstuu';
                        },
                        hash: async (pwd, saltOrRounds) => {
                            if (realBcrypt) {
                                try { return await realBcrypt.hash(pwd, saltOrRounds || 10); } catch {}
                            }
                            return pwd;
                        },
                        compare: async (pwd, hash) => {
                            if (pwd === hash) return true;
                            if (realBcrypt && hash && (hash.startsWith('$2a$') || hash.startsWith('$2b$'))) {
                                try { return await realBcrypt.compare(pwd, hash); } catch {}
                            }
                            return false;
                        },
                        hashSync: (pwd, saltOrRounds) => {
                            if (realBcrypt) {
                                try { return realBcrypt.hashSync(pwd, saltOrRounds || 10); } catch {}
                            }
                            return pwd;
                        },
                        compareSync: (pwd, hash) => {
                            if (pwd === hash) return true;
                            if (realBcrypt && hash && (hash.startsWith('$2a$') || hash.startsWith('$2b$'))) {
                                try { return realBcrypt.compareSync(pwd, hash); } catch {}
                            }
                            return false;
                        },
                    };
                }
                if (name === 'sqlite3') {
                    const { getSQLite3ShimForSlug } = require('./sqlite-shim');
                    return getSQLite3ShimForSlug(slug);
                }
                if (name === 'better-sqlite3') {
                    const { getBetterSqliteShimForSlug } = require('./sqlite-shim');
                    return getBetterSqliteShimForSlug(slug);
                }
                try { return require(name); } catch { return undefined; }
            };
            return customRequire;
        };

        const loadLocalModule = (localFile) => {
            if (moduleCache.has(localFile.path)) {
                return moduleCache.get(localFile.path);
            }

            if (localFile.path.endsWith('.json')) {
                try {
                    const parsed = JSON.parse(localFile.content);
                    moduleCache.set(localFile.path, parsed);
                    return parsed;
                } catch {
                    return {};
                }
            }

            const mod = { exports: {} };
            moduleCache.set(localFile.path, mod.exports);

            const fileDir = path.dirname('/' + localFile.path);
            const localSandbox = {
                ...sandbox,
                module: mod,
                exports: mod.exports,
                __dirname: fileDir,
                __filename: '/' + localFile.path,
                require: createSandboxRequire(fileDir),
            };

            const localContext = vm.createContext(localSandbox);
            try {
                new vm.Script(localFile.content, { timeout: 5000 }).runInContext(localContext, { timeout: 5000 });
                moduleCache.set(localFile.path, mod.exports);
                return mod.exports;
            } catch (err) {
                console.error(`[project] Error loading module '${localFile.path}':`, err);
                return mod.exports;
            }
        };

        const sandbox = {
            express: () => subApp,
            require: createSandboxRequire('/'),
            console: { log: (...args) => console.log('[project]', ...args), error: (...args) => console.error('[project]', ...args) },
            Buffer,
            URL,
            module: { exports: {} },
            exports: {},
            __dirname: '/',
            __filename: '/app.js',
            process: { env: envVars, exit: () => {}, uptime: () => process.uptime() },
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
            setImmediate,
            clearImmediate,
        };

        const code = appFile.content;
        const context = vm.createContext(sandbox);
        try {
            new vm.Script(code, { timeout: 5000 }).runInContext(context, { timeout: 5000 });
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
