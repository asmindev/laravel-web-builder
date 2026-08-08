<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class MySQLAppSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => bcrypt('password'),
        ]);

        $project = Project::updateOrCreate(
            ['slug' => 'mysql-todo-app'],
            [
                'user_id' => $user->id,
                'name' => 'MySQL Todo App',
                'description' => 'A fullstack Express.js Todo app configured with MySQL (.env), powered transparently by SQLite in the background.',
                'template' => 'node-backend',
                'config' => [
                    'title' => 'MySQL Todo App',
                    'db_driver' => 'mysql',
                ],
                'published' => true,
                'published_at' => now(),
            ]
        );

        // Hapus file lama jika re-seeding
        $project->files()->delete();

        $envContent = <<<'ENV'
APP_NAME="MySQL Todo App"
PORT=3000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=web_builder_app
DB_USERNAME=root
DB_PASSWORD=secret_mysql_password
ENV;

        $appJsContent = <<<'JS'
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Konfigurasi koneksi MySQL standar (akan di-intercept oleh Virtual SQLite Shim di Node Engine)
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'web_builder_app',
    waitForConnections: true,
    connectionLimit: 10,
});

// Auto-create table todos saat server menyala
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('[MySQL App] Table todos created / verified successfully');
    } catch (err) {
        console.error('[MySQL App] Failed to initialize DB:', err);
    }
})();

// Endpoint GET: Mengambil daftar todos dari MySQL
app.get('/api/todos', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM todos ORDER BY id DESC');
        res.json({ status: 'success', data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint POST: Menambahkan todo baru
app.post('/api/todos', async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const [result] = await pool.query('INSERT INTO todos (title) VALUES (?)', [title]);
        res.status(201).json({
            status: 'success',
            data: { id: result.insertId, title, completed: 0 }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UI Frontend Sederhana
app.get('/', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM todos ORDER BY id DESC');
        const todoItems = rows.map(t => `<li>${t.completed ? '<s>' : ''}${t.title}${t.completed ? '</s>' : ''}</li>`).join('') || '<li><i>No todos yet</i></li>';

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>MySQL Todo App</title>
                <style>
                    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; }
                    .card { background: #1e293b; padding: 1.5rem; border-radius: 12px; border: 1px solid #334155; }
                    h1 { color: #38bdf8; font-size: 1.5rem; margin-bottom: 0.5rem; }
                    .env-badge { background: #0284c7; color: white; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; }
                    input, button { padding: 0.6rem; margin-top: 1rem; border-radius: 6px; border: 1px solid #475569; }
                    input { width: 70%; background: #0f172a; color: white; }
                    button { background: #38bdf8; color: #0f172a; font-weight: bold; cursor: pointer; border: none; }
                    ul { margin-top: 1.5rem; padding-left: 1.2rem; }
                    li { margin-bottom: 0.5rem; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>MySQL Todo App</h1>
                    <p>Connected via <span class="env-badge">DB_CONNECTION=mysql</span></p>
                    <form action="/api/todos" method="POST" onsubmit="addTodo(event)">
                        <input type="text" id="title" placeholder="New todo title..." required />
                        <button type="submit">Add Todo</button>
                    </form>
                    <ul id="list">${todoItems}</ul>
                </div>
                <script>
                    async function addTodo(e) {
                        e.preventDefault();
                        const title = document.getElementById('title').value;
                        const res = await fetch('/api/todos', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title })
                        });
                        if (res.ok) window.location.reload();
                    }
                </script>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Error loading app: ' + err.message);
    }
});

module.exports = app;
JS;

        $packageJsonContent = <<<'JSON'
{
    "name": "mysql-todo-app",
    "version": "1.0.0",
    "main": "app.js",
    "dependencies": {
        "express": "^4.21.0",
        "mysql2": "^3.9.0"
    }
}
JSON;

        $project->files()->createMany([
            [
                'path' => '.env',
                'content' => $envContent,
                'mime_type' => 'text/plain',
            ],
            [
                'path' => 'app.js',
                'content' => $appJsContent,
                'mime_type' => 'application/javascript',
            ],
            [
                'path' => 'package.json',
                'content' => $packageJsonContent,
                'mime_type' => 'application/json',
            ],
        ]);

        echo "\n[MySQLAppSeeder] Created project 'mysql-todo-app' with .env and app.js (mysql2 connection).\n";
    }
}
