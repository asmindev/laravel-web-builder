<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Str;

class ProjectService
{
    public function create(array $data, int $userId): Project
    {
        $project = Project::create([
            'user_id' => $userId,
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::random(12),
            'description' => $data['description'] ?? null,
            'template' => $data['template'] ?? 'blank',
            'config' => $data['config'] ?? ['title' => $data['name']],
        ]);

        $this->createDefaultFiles($project);

        return $project->fresh();
    }

    public function update(Project $project, array $data): Project
    {
        $project->update($data);
        return $project->fresh();
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }

    public function forUser(int $userId)
    {
        return Project::where('user_id', $userId)
            ->withCount('files', 'assets')
            ->latest()
            ->get();
    }

    public function findBySlug(string $slug): ?Project
    {
        return Project::where('slug', $slug)->first();
    }

    private function createDefaultFiles(Project $project): void
    {
        $template = $project->template;

        if ($template === 'node-backend') {
            $defaults = [
                'app.js' => [
                    'content' => "const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.get('/api/info', (_req, res) => {
    res.json({
        name: 'My API',
        version: '1.0.0',
        uptime: process.uptime(),
    });
});

// All other routes → index.html (SPA-friendly fallback)
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:\${PORT}`);
});

module.exports = app;",
                    'mime_type' => 'application/javascript',
                ],
                'public/index.html' => [
                    'content' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My API App</title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <div class="container" id="app">
        <span class="badge">Loading...</span>
        <h1>My App</h1>
        <div id="content">
            <p>Fetching data from API...</p>
        </div>
        <div class="status">Connected</div>
    </div>
    <script>
        fetch("/api/info")
            .then(function(r) { return r.json(); })
            .then(function(data) {
                document.querySelector(".badge").textContent = data.name;
                document.querySelector("#content").innerHTML = "<p>Uptime: <strong>" + Math.round(data.uptime) + "s</strong></p><p>Version: <strong>" + data.version + "</strong></p>";
            })
            .catch(function() {
                document.querySelector("#content").innerHTML = \'<p style="color:red">Failed to load API</p>\';
            });
    </script>
</body>
</html>',
                    'mime_type' => 'text/html',
                ],
                'assets/style.css' => [
                    'content' => "* {
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
",
                    'mime_type' => 'text/css',
                ],
            ];
        } else {
            $defaults = [
                'public/index.html' => [
                    'content' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Site</title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <header>
        <h1>Welcome</h1>
    </header>
    <main>
        <p>Start editing this template!</p>
    </main>
</body>
</html>',
                    'mime_type' => 'text/html',
                ],
                'assets/style.css' => [
                    'content' => "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  line-height: 1.6;\n  color: #333;\n  padding: 2rem;\n}\n\nheader h1 {\n  color: #2563eb;\n}",
                    'mime_type' => 'text/css',
                ],
                'script.js' => [
                    'content' => '// Add your JavaScript here',
                    'mime_type' => 'application/javascript',
                ],
            ];
        }

        foreach ($defaults as $path => $file) {
            $project->files()->create([
                'path' => $path,
                'content' => $file['content'],
                'mime_type' => $file['mime_type'],
            ]);
        }
    }
}
