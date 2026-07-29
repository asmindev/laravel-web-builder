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
    <div class="container">
        <span class="badge">Running on Express</span>
        <h1>Welcome to Simple App</h1>
        <p>This page is served by Express via Node Engine.<br>The API responds at <code>/api/info</code>.</p>
        <div class="status">&#10003; Server is online</div>
        <div class="api-link">
            <a href="/api/info" target="_blank">View API response &rarr;</a>
        </div>
    </div>
</body>
</html>',
            ],
            [
                'path' => 'app.js',
                'mime_type' => 'application/javascript',
                'content' => "const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/assets', express.static('assets'));

app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from Express!' });
});

app.get('/api/info', (_req, res) => {
    res.json({
        name: 'Simple App',
        version: '1.0.0',
        uptime: process.uptime(),
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:\${PORT}`);
});

module.exports = app;",
            ],
            [
                'path' => 'api/hello.js',
                'mime_type' => 'application/javascript',
                'content' => "module.exports = (req, res) => {\n    res.json({ message: 'Hello from API route!' });\n};",
            ],
        ]);

        echo "Simple App seeded: {$project->name} ({$project->slug})\n";
        echo "  Folders: assets, public, api\n";
        echo "  Files: assets/style.css, public/index.html, app.js, api/hello.js\n";
    }
}
