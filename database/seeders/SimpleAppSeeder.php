<?php

namespace Database\Seeders;

use App\Models\Project;
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

        $simpleApp = Project::create([
            'user_id' => $user->id,
            'name' => 'Simple App',
            'slug' => 'simple-app',
            'description' => 'A simple app with Express backend, CSS styling, and HTML page.',
            'template' => 'blank',
            'config' => [
                'title' => 'Simple App',
                'heading' => 'Welcome to Simple App',
            ],
            'published' => true,
            'published_at' => now(),
        ]);

        $simpleApp->files()->createMany([
            [
                'path' => 'app.js',
                'content' => "const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const html = `<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Simple App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
            background: white; padding: 3rem; border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            text-align: center; max-width: 480px; width: 90%;
        }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a2e; }
        p { color: #6b7280; margin-bottom: 1.5rem; }
        .badge {
            display: inline-block; background: #667eea; color: white;
            padding: 0.25rem 1rem; border-radius: 999px;
            font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem;
        }
        .status { font-size: 0.9rem; color: #10b981; font-weight: 600; }
    </style>
</head>
<body>
    <div class=\"container\">
        <span class=\"badge\">Running on Express</span>
        <h1>Simple App</h1>
        <p>This page is served by Express via Node Engine.<br>The API responds at <code>/api/info</code>.</p>
        <div class=\"status\">&#10003; Server is online</div>
    </div>
</body>
</html>`;

app.get('/', (_req, res) => {
    res.send(html);
});

app.get('/api/info', (_req, res) => {
    res.json({ name: 'Simple App', version: '1.0.0', engine: 'node-engine' });
});

app.listen(PORT, () => {
    console.log(`App running on http://127.0.0.1:\${PORT}`);
});",
                'mime_type' => 'application/javascript',
            ],
        ]);

        echo "Simple App seeded: {$simpleApp->name} ({$simpleApp->slug})\n";
    }
}
