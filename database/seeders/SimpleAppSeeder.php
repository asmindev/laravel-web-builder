<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectFolder;
use Illuminate\Database\Seeder;

class SimpleAppSeeder extends Seeder
{
    public function run(): void
    {
        $user = \App\Models\User::first();
        if (!$user) {
            $user = \App\Models\User::factory()->create([
                'name' => 'Demo User',
                'email' => 'demo@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Hapus project lama dengan slug yang sama biar bisa re-seed
        Project::where('slug', 'simple-crud')->delete();

        $project = Project::create([
            'user_id' => $user->id,
            'name' => 'Simple CRUD',
            'slug' => 'simple-crud',
            'description' => 'A simple CRUD app with Express, Knex.js, MySQL. Supports create, read, update, delete posts.',
            'template' => 'crud',
            'published' => true,
            'published_at' => now(),
        ]);

        ProjectFolder::create(['project_id' => $project->id, 'name' => 'src', 'sort_order' => 0]);
        ProjectFolder::create(['project_id' => $project->id, 'name' => 'public', 'sort_order' => 1]);
        ProjectFolder::create(['project_id' => $project->id, 'name' => 'database', 'sort_order' => 2]);

        $project->files()->createMany([
            [
                'path' => 'database/schema.sql',
                'mime_type' => 'text/plain',
                'content' => '-- Simple CRUD Database Schema
-- Jalankan perintah ini di MySQL/Hostinger untuk membuat tabel

CREATE TABLE IF NOT EXISTS `posts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
',
            ],
            [
                'path' => 'database/seed.sql',
                'mime_type' => 'text/plain',
                'content' => "-- Data contoh untuk tabel posts
-- Jalankan setelah schema.sql

INSERT INTO `posts` (`title`, `body`) VALUES
('Selamat Datang di CRUD App', 'Ini adalah postingan pertama. Aplikasi ini menggunakan Express.js, Knex.js, dan MySQL.'),
('Cara Menggunakan Knex.js', 'Knex.js adalah query builder untuk Node.js yang mendukung MySQL, PostgreSQL, SQLite, dan lainnya.'),
('Tips Deploy di Hostinger', 'Pastikan Anda sudah membuat database di hPanel, lalu isi .env dengan credential yang benar.');
",
            ],
            [
                'path' => '.env.example',
                'mime_type' => 'text/plain',
                'content' => '# Database Configuration (isi sesuai credential MySQL Hostinger)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=simple_crud

PORT=3000
',
            ],
            [
                'path' => 'src/db.js',
                'mime_type' => 'application/javascript',
                'content' => <<<'JS'
const knex = require('knex');

let db;
try {
    db = knex({
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'simple_crud',
        },
        pool: { min: 0, max: 7 },
    });
} catch (e) {
    db = null;
}

module.exports = db;
JS,
            ],
            [
                'path' => 'src/posts.js',
                'mime_type' => 'application/javascript',
                'content' => <<<'JS'
const express = require('express');
const router = express.Router();

let db;
try {
    db = require('./db');
} catch {
    db = null;
}

const MOCK_POSTS = [
    { id: 1, title: 'Selamat Datang di CRUD App', body: 'Ini adalah postingan pertama. Aplikasi ini menggunakan Express.js, Knex.js, dan MySQL.', created_at: '2026-07-01 10:00:00', updated_at: '2026-07-01 10:00:00' },
    { id: 2, title: 'Cara Menggunakan Knex.js', body: 'Knex.js adalah query builder untuk Node.js yang mendukung MySQL, PostgreSQL, SQLite, dan lainnya.', created_at: '2026-07-05 14:30:00', updated_at: '2026-07-05 14:30:00' },
    { id: 3, title: 'Tips Deploy di Hostinger', body: 'Pastikan Anda sudah membuat database di hPanel, lalu isi .env dengan credential yang benar.', created_at: '2026-07-10 09:15:00', updated_at: '2026-07-10 09:15:00' },
];

router.get('/', async (_req, res) => {
    if (!db) return res.json(MOCK_POSTS);
    const posts = await db('posts').orderBy('created_at', 'desc');
    res.json(posts);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!db) {
        const post = MOCK_POSTS.find(p => p.id === parseInt(id));
        if (!post) return res.status(404).json({ error: 'Post not found' });
        return res.json(post);
    }
    const [post] = await db('posts').where({ id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
});

router.post('/', async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
    if (!db) {
        const post = { id: MOCK_POSTS.length + 1, title, body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        MOCK_POSTS.unshift(post);
        return res.status(201).json(post);
    }
    const [id] = await db('posts').insert({ title, body });
    const [post] = await db('posts').where({ id });
    res.status(201).json(post);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
    if (!db) {
        const idx = MOCK_POSTS.findIndex(p => p.id === parseInt(id));
        if (idx === -1) return res.status(404).json({ error: 'Post not found' });
        MOCK_POSTS[idx] = { ...MOCK_POSTS[idx], title, body, updated_at: new Date().toISOString() };
        return res.json(MOCK_POSTS[idx]);
    }
    const updated = await db('posts').where({ id }).update({ title, body });
    if (!updated) return res.status(404).json({ error: 'Post not found' });
    const [post] = await db('posts').where({ id });
    res.json(post);
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!db) {
        const idx = MOCK_POSTS.findIndex(p => p.id === parseInt(id));
        if (idx === -1) return res.status(404).json({ error: 'Post not found' });
        MOCK_POSTS.splice(idx, 1);
        return res.json({ message: 'Post deleted' });
    }
    const deleted = await db('posts').where({ id }).del();
    if (!deleted) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
});

module.exports = router;
JS,
            ],
            [
                'path' => 'public/index.html',
                'mime_type' => 'text/html',
                'content' => <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRUD App — Posts</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <a href="/" class="logo">CRUD App</a>
            <button class="btn btn-primary" onclick="showForm()">+ New Post</button>
        </div>
    </nav>

    <main class="container">
        <h1>Posts</h1>
        <div id="posts-list">
            <div class="loading">Loading...</div>
        </div>
    </main>

    <div id="form-modal" class="modal hidden">
        <div class="modal-backdrop" onclick="hideForm()"></div>
        <div class="modal-content">
            <h2 id="form-title">New Post</h2>
            <form id="post-form" onsubmit="return savePost(event)">
                <input type="hidden" id="post-id">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" required placeholder="Post title">
                </div>
                <div class="form-group">
                    <label for="body">Content</label>
                    <textarea id="body" rows="8" required placeholder="Write your post content here..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" id="form-submit">Publish</button>
                    <button type="button" class="btn btn-ghost" onclick="hideForm()">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <div id="detail-modal" class="modal hidden">
        <div class="modal-backdrop" onclick="hideDetail()"></div>
        <div class="modal-content modal-lg">
            <div id="detail-content"></div>
            <div class="form-actions">
                <button class="btn btn-ghost" onclick="hideDetail()">Close</button>
            </div>
        </div>
    </div>

    <footer>
        <div class="container">
            <p>&copy; 2026 CRUD App — Generated with Laravel Web Builder</p>
        </div>
    </footer>

    <script>
        const API = '/api/posts';
        // Fallback mock data untuk sandbox preview (API endpoint gak hidup di sandbox)
        const MOCK_POSTS = [
            { id: 1, title: 'Selamat Datang di CRUD App', body: 'Ini adalah postingan pertama. Aplikasi ini menggunakan Express.js, Knex.js, dan MySQL.', created_at: '2026-07-01 10:00:00', updated_at: '2026-07-01 10:00:00' },
            { id: 2, title: 'Cara Menggunakan Knex.js', body: 'Knex.js adalah query builder untuk Node.js yang mendukung MySQL, PostgreSQL, SQLite, dan lainnya.', created_at: '2026-07-05 14:30:00', updated_at: '2026-07-05 14:30:00' },
            { id: 3, title: 'Tips Deploy di Hostinger', body: 'Pastikan Anda sudah membuat database di hPanel, lalu isi .env dengan credential yang benar.', created_at: '2026-07-10 09:15:00', updated_at: '2026-07-10 09:15:00' },
        ];
        let localPosts = [...MOCK_POSTS];
        let useLocal = false;

        async function loadPosts() {
            const el = document.getElementById('posts-list');
            try {
                const res = await fetch(API);
                if (!res.ok) throw new Error('API unavailable');
                const posts = await res.json();
                renderPosts(posts);
            } catch (e) {
                useLocal = true;
                renderPosts(localPosts);
            }
        }

        function renderPosts(posts) {
            const el = document.getElementById('posts-list');
            if (!posts.length) {
                    el.innerHTML = '<div class="empty-state"><p>Belum ada postingan.</p><button class="btn btn-primary" onclick="showForm()">Buat Postingan Pertama</button></div>';
                    return;
                }
                el.innerHTML = posts.map(p => `
                    <article class="post-card">
                        <div class="post-body" onclick="showDetail(${p.id})">
                            <h2>${esc(p.title)}</h2>
                            <p class="post-excerpt">${esc(p.body.slice(0, 150))}${p.body.length > 150 ? '...' : ''}</p>
                            <span class="post-date">${new Date(p.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div class="post-actions">
                            <button class="btn btn-sm" onclick="event.stopPropagation(); showForm(${p.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deletePost(${p.id})">Delete</button>
                        </div>
                    </article>
                `).join('');
        }

        function getPosts() { return useLocal ? localPosts : null; }

        async function showDetail(id) {
            let p;
            if (useLocal) {
                p = localPosts.find(x => x.id === id);
                if (!p) return;
            } else {
                try {
                    const res = await fetch(API + '/' + id);
                    if (!res.ok) return;
                    p = await res.json();
                } catch (e) { return; }
            }
            document.getElementById('detail-content').innerHTML = `
                <h1>${esc(p.title)}</h1>
                <p class="post-meta">${new Date(p.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}${p.updated_at !== p.created_at ? ' &middot; Edited' : ''}</p>
                <div class="post-content">${esc(p.body)}</div>
            `;
            document.getElementById('detail-modal').classList.remove('hidden');
        }
        function hideDetail() { document.getElementById('detail-modal').classList.add('hidden'); }

        async function showForm(id) {
            document.getElementById('post-id').value = '';
            document.getElementById('title').value = '';
            document.getElementById('body').value = '';
            document.getElementById('form-title').textContent = 'New Post';
            document.getElementById('form-submit').textContent = 'Publish';
            if (id) {
                let p;
                if (useLocal) {
                    p = localPosts.find(x => x.id === id);
                } else {
                    try {
                        const res = await fetch(API + '/' + id);
                        if (res.ok) p = await res.json();
                    } catch (e) {}
                }
                if (!p) return;
                document.getElementById('post-id').value = p.id;
                document.getElementById('title').value = p.title;
                document.getElementById('body').value = p.body;
                document.getElementById('form-title').textContent = 'Edit Post';
                document.getElementById('form-submit').textContent = 'Update';
            }
            document.getElementById('form-modal').classList.remove('hidden');
        }
        function hideForm() { document.getElementById('form-modal').classList.add('hidden'); }

        async function savePost(e) {
            e.preventDefault();
            const id = document.getElementById('post-id').value;
            const data = { title: document.getElementById('title').value, body: document.getElementById('body').value };
            if (useLocal) {
                if (id) {
                    const idx = localPosts.findIndex(x => x.id === parseInt(id));
                    if (idx > -1) localPosts[idx] = { ...localPosts[idx], ...data, updated_at: new Date().toISOString() };
                } else {
                    localPosts.unshift({ id: localPosts.length + 1, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                }
                hideForm(); renderPosts(localPosts); return;
            }
            try {
                const res = await fetch(API + (id ? '/' + id : ''), {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (!res.ok) { alert('Failed to save'); return; }
                hideForm(); loadPosts();
            } catch (e) { alert('Error saving post'); }
        }

        async function deletePost(id) {
            if (!confirm('Hapus postingan ini?')) return;
            if (useLocal) {
                localPosts = localPosts.filter(x => x.id !== id);
                renderPosts(localPosts); return;
            }
            try {
                await fetch(API + '/' + id, { method: 'DELETE' });
                loadPosts();
            } catch (e) { alert('Error deleting post'); }
        }

        function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

        loadPosts();
    </script>
</body>
</html>
HTML,
            ],
            [
                'path' => 'public/style.css',
                'mime_type' => 'text/css',
                'content' => <<<'CSS'
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  background: #f8fafc;
  min-height: 100vh;
}

.container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; }

.navbar { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 1rem 0; margin-bottom: 2rem; }
.navbar .container { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1.25rem; font-weight: 700; color: #1e293b; text-decoration: none; }

.btn {
  display: inline-block; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600;
  font-size: 0.875rem; border: 1px solid transparent; cursor: pointer; font-family: inherit;
}
.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }
.btn-ghost { background: transparent; color: #64748b; border-color: #e2e8f0; }
.btn-ghost:hover { background: #f1f5f9; }
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.8rem; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }

.post-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;
  margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
}
.post-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.post-body { flex: 1; cursor: pointer; }
.post-body h2 { font-size: 1.125rem; margin-bottom: 0.25rem; color: #1e293b; }
.post-excerpt { color: #64748b; font-size: 0.9rem; margin-bottom: 0.25rem; }
.post-date { color: #94a3b8; font-size: 0.8rem; }
.post-actions { display: flex; gap: 0.35rem; flex-shrink: 0; }

.post-meta { color: #94a3b8; font-size: 0.875rem; margin-bottom: 1.5rem; }
.post-content { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; line-height: 1.8; white-space: pre-wrap; }

.modal { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal.hidden { display: none; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
.modal-content {
  position: relative; background: #fff; border-radius: 12px; padding: 2rem;
  width: 90%; max-width: 560px; max-height: 85vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal-lg { max-width: 640px; }
.modal-content h2 { margin-bottom: 1.25rem; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem; }
.form-group input, .form-group textarea {
  width: 100%; padding: 0.625rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; font-size: 0.95rem;
}
.form-group input:focus, .form-group textarea:focus { outline: 2px solid #3b82f6; outline-offset: -1px; }
.form-actions { display: flex; gap: 0.5rem; margin-top: 1.5rem; }

.empty-state { text-align: center; padding: 3rem 0; color: #94a3b8; }
.empty-state p { margin-bottom: 1rem; }
.loading { text-align: center; padding: 3rem 0; color: #94a3b8; }
footer { text-align: center; padding: 2rem 0; margin-top: 3rem; color: #94a3b8; font-size: 0.8rem; }
CSS,
            ],
            [
                'path' => 'package.json',
                'mime_type' => 'application/json',
                'content' => '{
    "name": "simple-crud",
    "version": "1.0.0",
    "description": "Simple CRUD app with Express, Knex.js, and MySQL",
    "main": "app.js",
    "scripts": {
        "start": "node app.js",
        "dev": "node --watch app.js",
        "migrate": "mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/schema.sql",
        "seed": "mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/seed.sql",
        "setup": "npm run migrate && npm run seed"
    },
    "dependencies": {
        "express": "^4.21.0",
        "knex": "^3.1.0",
        "mysql2": "^3.11.0"
    }
}
',
            ],
            [
                'path' => 'app.js',
                'mime_type' => 'application/javascript',
                'content' => <<<'JS'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const postsRouter = require('./src/posts');
app.use('/api/posts', postsRouter);

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('CRUD App running on http://127.0.0.1:' + PORT);
});

module.exports = app;
JS,
            ],
        ]);

        echo "Simple CRUD seeded: {$project->name} ({$project->slug})\n";
        echo "  Files: app.js, src/db.js, src/posts.js, public/index.html, public/style.css, database/*.sql, .env.example, package.json\n";
    }
}
