import express from 'express';
import { RenderService } from './services/render.js';
import { CacheService } from './services/cache.js';
import { ApiClient } from './services/api-client.js';
import { internalAuth } from './middleware/auth.js';

const PORT = process.env.PORT || 4000;
const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || 'dev-secret-key-change-in-production';

const app = express();
app.use(express.json());

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

// Render a published project — wildcard route for slug-based hosting
app.use('/:slug', async (req, res, next) => {
    const slug = req.params.slug;
    if (slug === 'health' || slug.startsWith('_')) return next();

    try {
        const handled = await render.tryExpressApp(slug, req, res);
        if (handled) return;

        const html = await render.render(slug);
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

app.get('/', (_req, res) => res.send('Web Builder Engine — up and running'));

app.listen(PORT, () => {
    console.log(`Engine running on http://127.0.0.1:${PORT}`);
});
