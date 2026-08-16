const express = require('express');
const { RenderService } = require('./services/render');
const { CacheService } = require('./services/cache');
const { ApiClient } = require('./services/api-client');
const { internalAuth } = require('./middleware/auth');

const PORT = process.env.PORT || 4000;
const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || 'dev-secret-key-change-in-production';

// Filter out harmless Node experimental warnings (e.g. node:sqlite)
process.on('warning', (warning) => {
    if (warning.name === 'ExperimentalWarning') return;
    console.warn(warning);
});

const app = express();
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// CORS — allow Laravel frontend to fetch from engine
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

const cache = new CacheService();
const api = new ApiClient(LARAVEL_API_URL, INTERNAL_API_SECRET);
const render = new RenderService(cache, api);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Helper for internal JSON parsing from raw body
const parseJsonBody = (req) => {
    if (Buffer.isBuffer(req.body)) {
        try { return JSON.parse(req.body.toString('utf-8')); } catch { return {}; }
    }
    return req.body || {};
};

// Preload project data via POST body (avoids 431 header overflow)
app.post('/internal/preload', (req, res) => {
    const body = parseJsonBody(req);
    const { slug, projectData } = body;
    if (!slug || !projectData) return res.status(400).json({ error: 'Missing slug or projectData' });
    cache.set(`preload:${slug}`, projectData);
    res.json({ ok: true });
});

// Purge cache (internal, called by Laravel on publish)
app.post('/internal/purge-cache', internalAuth(INTERNAL_API_SECRET), (req, res) => {
    const body = parseJsonBody(req);
    const { slug } = body;
    if (slug) {
        cache.del(`project:${slug}`);
        cache.del(`preload:${slug}`);
        if (global.__appInstances) global.__appInstances.delete(slug);
        res.json({ purged: true, slug });
    } else {
        cache.flush();
        if (global.__appInstances) global.__appInstances.clear();
        res.json({ purged: true, all: true });
    }
});

// Reset project database seed records while keeping admin account
app.post('/internal/reset-db', internalAuth(INTERNAL_API_SECRET), (req, res) => {
    const body = parseJsonBody(req);
    const { slug } = body;
    if (!slug) return res.status(400).json({ success: false, message: 'Missing project slug' });

    const { resetDbKeepAdmin } = require('./services/sqlite-shim');
    const result = resetDbKeepAdmin(slug);

    if (global.__appInstances) global.__appInstances.delete(slug);
    if (global.__sessionStores) global.__sessionStores.delete(slug);
    cache.del(`project:${slug}`);
    cache.del(`preload:${slug}`);

    res.json(result);
});

// Export project database dump (all tables & data rows)
app.post('/internal/export-db', async (req, res) => {
    const body = parseJsonBody(req);
    const { slug, projectData } = body;
    if (!slug) return res.status(400).json({ success: false, message: 'Missing project slug' });

    const { getDbPathForSlug, exportDatabaseDump } = require('./services/sqlite-shim');
    const dbPath = getDbPathForSlug(slug);
    const fs = require('fs');

    // Auto-initialize if database does not exist on disk
    if ((!fs.existsSync(dbPath) || fs.statSync(dbPath).size <= 4096) && projectData) {
        try {
            await render.tryExpressApp(slug, { url: '/', method: 'GET', headers: {} }, { on: () => {}, off: () => {}, setHeader: () => {}, send: () => {}, end: () => {} }, projectData);
        } catch (e) {
            console.error('[export-db init error]', e);
        }
    }

    const result = exportDatabaseDump(slug);
    res.json(result);
});

// Internal render endpoint with project data inline (no API callback needed)
app.post('/api/render', async (req, res) => {
    const { slug, project, path } = req.body;
    if (!slug || !project) return res.status(400).send('Missing slug or project');
    if (!project.published) return res.status(404).send('Project is not published');

    try {
        const html = await render.render(slug, project);
        res.send(html);
    } catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).send('Project not found');
        } else {
            console.error('Render error:', err);
            res.status(500).send('Internal error');
        }
    }
});

// Static routes (must be before wildcard)
app.get('/', (_req, res) => res.send('Web Builder Engine — up and running'));
app.get('/hello', (_req, res) => res.send('Hello World'));

// Render a published project — wildcard route for slug-based hosting
app.use('/:slug', async (req, res, next) => {
    const slug = req.params.slug;
    // Skip built-in routes & non-project paths
    const reservedSlugs = ['health', 'hello', 'favicon.ico', 'robots.txt', 'login', 'register', 'api', 'internal', 'assets', 'public'];
    if (reservedSlugs.includes(slug) || slug.startsWith('_')) return next();

    // If the Laravel proxy sent project data inline, use it to avoid API callback
    let projectData = null;

    // Check preload cache (set by POST /internal/preload)
    const cached = cache.get(`preload:${slug}`);
    if (cached) {
        cache.del(`preload:${slug}`);
        projectData = cached;
    }

    // Fallback: header (legacy, smaller projects)
    if (!projectData) {
        const encoded = req.headers['x-project-data'];
        if (encoded) {
            try {
                projectData = JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
            } catch {}
        }
    }

    try {
        const handled = await render.tryExpressApp(slug, req, res, projectData);
        if (handled) return;

        const html = await render.render(slug, projectData);
        res.send(html);
    } catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).send('Project not found');
        } else if (err.message === 'NOT_PUBLISHED') {
            res.status(404).send('Project is not published');
        } else {
            console.error('Render error:', err);
            // Ensure we always send a response so the Guzzle stream is not left hanging (EOF)
            if (!res.headersSent) {
                res.status(500).send('Internal error: ' + (err.message || 'Unknown render error'));
            }
        }
    }
});

// Global Express error handler — catches synchronous errors thrown in middleware/routes.
// Without this, Express would crash the connection mid-stream causing
// "stream reading error: unexpected EOF" on the Laravel/Guzzle proxy side.
app.use((err, req, res, _next) => {
    console.error('[Engine] Unhandled Express error:', err?.message || err);
    if (!res.headersSent) {
        res.status(500).send('Engine error: ' + (err?.message || 'Unknown error'));
    }
});

app.listen(PORT, () => {
    console.log(`Engine running on http://127.0.0.1:${PORT}`);
});

// Prevent the Node.js process from crashing on unhandled async errors inside sandbox VM.
// A crash would abruptly close the TCP connection and cause Guzzle to throw
// "stream reading error: unexpected EOF" on the Laravel proxy side.
process.on('unhandledRejection', (reason) => {
    console.error('[Engine] Unhandled promise rejection (connection protected):', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
    console.error('[Engine] Uncaught exception (connection protected):', err?.message || err);
    // Do NOT call process.exit() — keep the engine alive so in-flight responses finish
});

module.exports = app;
