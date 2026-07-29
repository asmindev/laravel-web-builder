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
                    'content' => "const express = require('express');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get('/api/hello', (_req, res) => {\n    res.json({ message: 'Hello from Express!' });\n});\n\napp.listen(PORT, () => {\n    console.log(`Server running on http://127.0.0.1:\${PORT}`);\n});\n\nmodule.exports = app;",
                    'mime_type' => 'application/javascript',
                ],
                'package.json' => [
                    'content' => json_encode([
                        'name' => 'my-api',
                        'version' => '1.0.0',
                        'main' => 'app.js',
                        'scripts' => [
                            'start' => 'node app.js',
                            'dev' => 'node --watch app.js',
                        ],
                        'dependencies' => [
                            'express' => '^4.21.0',
                        ],
                    ], JSON_PRETTY_PRINT),
                    'mime_type' => 'application/json',
                ],
            ];
        } else {
            $defaults = [
                'index.html' => [
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
