const express = require('express');
const { RenderService } = require('./services/render');
const { CacheService } = require('./services/cache');
const { ApiClient } = require('./services/api-client');
const { internalAuth } = require('./middleware/auth');

const PORT = process.env.PORT || 4000;
const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || 'dev-secret-key-change-in-production';

const app = express();
app.use(express.json());

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

// Purge cache (internal, called by Laravel on publish)
app.post('/internal/purge-cache', internalAuth(INTERNAL_API_SECRET), (req, res) => {
    const { slug } = req.body;
    if (slug) {
        cache.del(`project:${slug}`);
        res.json({ purged: true, slug });
    } else {
        cache.flush();
        res.json({ purged: true, all: true });
    }
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
    // Skip built-in routes
    if (slug === 'health' || slug.startsWith('_')) return next();

    // If the Laravel proxy sent project data inline, use it to avoid API callback
    let projectData = null;
    const encoded = req.headers['x-project-data'];
    if (encoded) {
        try {
            projectData = JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
        } catch {}
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
            res.status(500).send('Internal error');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Engine running on http://127.0.0.1:${PORT}`);
});

module.exports = app;
