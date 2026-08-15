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

        const contentHash = files.map(f => `${f.path}:${f.content.length}:${f.updated_at || ''}`).join(';');
        const cachedInstance = global.__appInstances?.get(slug);
        
        let subApp;
        if (cachedInstance && cachedInstance.hash === contentHash) {
            subApp = cachedInstance.subApp;
        } else {
            subApp = express();

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
                    const smartJsonParser = () => (req, res, next) => {
                        if (req.body && typeof req.body === 'object') return next();
                        if (Buffer.isBuffer(req.body)) {
                            try { req.body = JSON.parse(req.body.toString('utf-8')); } catch {}
                        } else if (typeof req.body === 'string') {
                            try { req.body = JSON.parse(req.body); } catch {}
                        }
                        next();
                    };
                    const smartUrlencodedParser = () => (req, res, next) => {
                        if (req.body && typeof req.body === 'object') return next();
                        if (typeof req.body === 'string') {
                            try {
                                const qs = require('querystring');
                                req.body = qs.parse(req.body);
                            } catch {}
                        }
                        next();
                    };

                    if (name === 'express') {
                        const fn = () => subApp;
                        fn.json = smartJsonParser;
                        fn.urlencoded = smartUrlencodedParser;
                        fn.static = express.static;
                        fn.Router = express.Router;
                        fn.raw = express.raw;
                        fn.text = express.text;
                        return fn;
                    }
                    if (name === 'body-parser' || name === 'bodyParser') {
                        return {
                            json: smartJsonParser,
                            urlencoded: smartUrlencodedParser,
                            raw: () => (req, res, next) => next(),
                            text: () => (req, res, next) => next(),
                        };
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
                        if (!global.__sessionStores) global.__sessionStores = new Map();
                        if (!global.__sessionStores.has(slug)) {
                            global.__sessionStores.set(slug, new sessionMod.MemoryStore());
                        }
                        const store = global.__sessionStores.get(slug);
                        return (opts = {}) => sessionMod({
                            resave: false,
                            saveUninitialized: true,
                            secret: envVars.SESSION_SECRET || 'secret-key-slug-' + slug,
                            ...opts,
                            store,
                        });
                    }
                    if (name === 'bcrypt' || name === 'bcryptjs') {
                        let realBcrypt = null;
                        try { realBcrypt = require('bcryptjs'); } catch {
                            try { realBcrypt = require('bcrypt'); } catch {}
                        }
                        return {
                            genSalt: async (rounds) => realBcrypt ? realBcrypt.genSalt(rounds || 10) : '$2b$10$abcdefghijklmnopqrstuu',
                            genSaltSync: (rounds) => realBcrypt ? realBcrypt.genSaltSync(rounds || 10) : '$2b$10$abcdefghijklmnopqrstuu',
                            hash: async (pwd, saltOrRounds) => realBcrypt ? realBcrypt.hash(pwd, saltOrRounds || 10) : pwd,
                            hashSync: (pwd, saltOrRounds) => realBcrypt ? realBcrypt.hashSync(pwd, saltOrRounds || 10) : pwd,
                            compare: async (pwd, hash) => {
                                if (!hash || !pwd) return false;
                                if (pwd === hash) return true;
                                if (realBcrypt && (hash.startsWith('$2a$') || hash.startsWith('$2b$'))) {
                                    try { return await realBcrypt.compare(pwd, hash); } catch {}
                                }
                                return false;
                            },
                            compareSync: (pwd, hash) => {
                                if (!hash || !pwd) return false;
                                if (pwd === hash) return true;
                                if (realBcrypt && (hash.startsWith('$2a$') || hash.startsWith('$2b$'))) {
                                    try { return realBcrypt.compareSync(pwd, hash); } catch {}
                                }
                                return false;
                            },
                        };
                    }
                    if (name === 'cookie-parser' || name === 'cookieParser') {
                        try {
                            const cp = require('cookie-parser');
                            if (typeof cp === 'function') return cp;
                        } catch {}
                        return (secret) => (req, res, next) => {
                            req.cookies = req.cookies || {};
                            const cookieHeader = req.headers?.cookie || req.headers?.Cookie;
                            if (cookieHeader) {
                                cookieHeader.split(';').forEach(c => {
                                    const parts = c.split('=');
                                    if (parts[0]) req.cookies[parts[0].trim()] = decodeURIComponent((parts[1] || '').trim());
                                });
                            }
                            next();
                        };
                    }
                    if (name === 'cors') {
                        try {
                            const c = require('cors');
                            if (typeof c === 'function') return c;
                        } catch {}
                        return () => (req, res, next) => next();
                    }
                    if (name === 'crypto') {
                        return require('crypto');
                    }
                    if (name === 'jsonwebtoken' || name === 'jwt') {
                        try {
                            const jwt = require('jsonwebtoken');
                            if (jwt) return jwt;
                        } catch {}
                        return {
                            sign: (payload) => Buffer.from(JSON.stringify(payload)).toString('base64'),
                            verify: (token, _secret, cb) => {
                                try {
                                    const data = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
                                    if (typeof cb === 'function') cb(null, data);
                                    return data;
                                } catch (e) {
                                    if (typeof cb === 'function') cb(e);
                                    throw e;
                                }
                            },
                            decode: (token) => {
                                try { return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')); } catch { return null; }
                            }
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
                    let script;
                    try {
                        script = new vm.Script(localFile.content, { timeout: 5000 });
                    } catch (compileErr) {
                        if (compileErr instanceof SyntaxError && (compileErr.message.includes('await') || compileErr.message.includes('Unexpected identifier'))) {
                            script = new vm.Script(`(async () => {\n${localFile.content}\n})()`, { timeout: 5000 });
                        } else {
                            throw compileErr;
                        }
                    }
                    script.runInContext(localContext, { timeout: 5000 });
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
                let script;
                try {
                    script = new vm.Script(code, { timeout: 5000 });
                } catch (compileErr) {
                    if (compileErr instanceof SyntaxError && (compileErr.message.includes('await') || compileErr.message.includes('Unexpected identifier'))) {
                        script = new vm.Script(`(async () => {\n${code}\n})()`, { timeout: 5000 });
                    } else {
                        throw compileErr;
                    }
                }
                const result = script.runInContext(context, { timeout: 5000 });
                if (result && typeof result.then === 'function') {
                    await Promise.race([
                        result,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('App initialization timeout')), 5000))
                    ]).catch(err => {
                        console.error('[project] Async initialization warning/error:', err);
                    });
                }
                // Yield to event loop to allow nextTick callbacks (such as initDB) to finish
                await new Promise(r => setImmediate(r));
                if (!global.__appInstances) global.__appInstances = new Map();
                global.__appInstances.set(slug, { subApp, hash: contentHash });
            } catch (err) {
                console.error('[project] App script execution error:', err);
                return false;
            }
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
