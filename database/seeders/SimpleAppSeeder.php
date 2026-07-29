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
        Project::where('slug', 'simple-app')->delete();

        $project = Project::create([
            'user_id' => $user->id,
            'name' => 'Simple App',
            'slug' => 'simple-app',
            'description' => 'A simple app with Express backend and CSS styling.',
            'template' => 'landing',
            'published' => true,
            'published_at' => now(),
        ]);

        ProjectFolder::create(['project_id' => $project->id, 'name' => 'assets', 'sort_order' => 0]);
        ProjectFolder::create(['project_id' => $project->id, 'name' => 'public', 'sort_order' => 1]);
        ProjectFolder::create(['project_id' => $project->id, 'name' => 'api', 'sort_order' => 2]);

        $project->files()->createMany([
            [
                'path' => 'assets/style.css',
                'mime_type' => 'text/css',
                'content' => '* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #1a1a2e;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 480px;
  width: 90%;
}

h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a2e; }
p { color: #6b7280; margin-bottom: 1.5rem; }

.badge {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.status { font-size: 0.9rem; color: #10b981; font-weight: 600; }

.api-link {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.api-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
}
.api-link a:hover { text-decoration: underline; }',
            ],
            [
                'path' => 'public/index.html',
                'mime_type' => 'text/html',
                'content' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple App</title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <div class="container" id="app">
        <span class="badge">Loading...</span>
        <h1>Welcome</h1>
        <div id="content">
            <p>Fetching data from API...</p>
        </div>
        <div class="status">&#10003; Connected</div>
    </div>
    <script>
        fetch(\'/api/info\')
            .then(r => r.json())
            .then(data => {
                document.querySelector(\'.badge\').textContent = data.name;
                document.querySelector(\'#content\').innerHTML = `<p>Server uptime: <strong>${Math.round(data.uptime)}s</strong></p><p>Version: <strong>${data.version}</strong></p>`;
            })
            .catch(() => {
                document.querySelector(\'#content\').innerHTML = \'<p style="color:red">Failed to load API</p>\';
            });
    </script>
</body>
</html>',
            ],
            [
                'path' => 'app.js',
                'mime_type' => 'application/javascript',
                'content' => "const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/info', (_req, res) => {
    res.json({
        name: 'Simple App',
        version: '1.0.0',
        uptime: process.uptime(),
    });
});

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:\${PORT}`);
});

module.exports = app;",
            ],
        ]);

        echo "Simple App seeded: {$project->name} ({$project->slug})\n";
        echo "  Folders: assets, public\n";
        echo "  Files: assets/style.css, public/index.html, app.js\n";
    }
}
