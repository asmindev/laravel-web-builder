<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        if (Project::where('slug', 'landing-page')->exists()) {
            return;
        }

        $user = \App\Models\User::where('email', 'demo@example.com')->first() ?? \App\Models\User::first();

        if (!$user) {
            $user = \App\Models\User::factory()->create([
                'name' => 'Demo User',
                'email' => 'demo@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // 1. Landing page project
        $landing = Project::create([
            'user_id' => $user->id,
            'name' => 'Landing Page',
            'slug' => 'landing-page',
            'description' => 'A modern landing page with hero, features, and contact section.',
            'template' => 'landing',
            'config' => [
                'title' => 'Landing Page',
                'tagline' => 'Build something amazing today',
                'primary_color' => '#2563eb',
                'show_features' => true,
                'show_contact' => true,
            ],
            'published' => true,
            'published_at' => now(),
        ]);

        $landing->files()->createMany([
            [
                'path' => 'index.ejs',
                'content' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= config.title %></title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo"><%= config.title %></div>
            <div class="nav-links">
                <a href="#features">Features</a>
                <a href="#contact">Contact</a>
            </div>
        </div>
    </nav>

    <header class="hero">
        <div class="container">
            <h1><%= config.tagline %></h1>
            <p>Start building your next project with ease. Clean, fast, and fully customizable.</p>
            <a href="#features" class="btn btn-primary">Get Started</a>
        </div>
    </header>

    <% if (config.show_features) { %>
    <section id="features" class="features">
        <div class="container">
            <h2>Features</h2>
            <div class="grid">
                <div class="card">
                    <h3>Fast</h3>
                    <p>Lightning-fast performance out of the box.</p>
                </div>
                <div class="card">
                    <h3>Flexible</h3>
                    <p>Customize everything to your needs.</p>
                </div>
                <div class="card">
                    <h3>Reliable</h3>
                    <p>Built to scale with your business.</p>
                </div>
            </div>
        </div>
    </section>
    <% } %>

    <% if (config.show_contact) { %>
    <section id="contact" class="contact">
        <div class="container">
            <h2>Get in Touch</h2>
            <form>
                <input type="email" placeholder="Your email" required>
                <textarea placeholder="Your message" rows="4"></textarea>
                <button type="submit" class="btn btn-primary">Send</button>
            </form>
        </div>
    </section>
    <% } %>

    <footer>
        <div class="container">
            <p>&copy; <%= new Date().getFullYear() %> <%= config.title %>. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>',
                'mime_type' => 'text/html',
            ],
            [
                'path' => 'style.css',
                'content' => "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: system-ui, -apple-system, sans-serif;\n  line-height: 1.6;\n  color: #1a1a2e;\n}\n\n.container {\n  max-width: 1100px;\n  margin: 0 auto;\n  padding: 0 2rem;\n}\n\n.navbar {\n  background: #fff;\n  border-bottom: 1px solid #e5e7eb;\n  padding: 1rem 0;\n  position: sticky;\n  top: 0;\n  z-index: 100;\n}\n\n.navbar .container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.logo {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: <%= config.primary_color %>;\n}\n\n.nav-links { display: flex; gap: 2rem; }\n.nav-links a {\n  text-decoration: none;\n  color: #6b7280;\n  font-weight: 500;\n}\n.nav-links a:hover { color: <%= config.primary_color %>; }\n\n.hero {\n  background: linear-gradient(135deg, <%= config.primary_color %>15, #fff);\n  padding: 6rem 0;\n  text-align: center;\n}\n\n.hero h1 {\n  font-size: 3.5rem;\n  margin-bottom: 1rem;\n}\n\n.hero p {\n  font-size: 1.2rem;\n  color: #6b7280;\n  max-width: 600px;\n  margin: 0 auto 2rem;\n}\n\n.btn {\n  display: inline-block;\n  padding: 0.75rem 2rem;\n  border-radius: 8px;\n  text-decoration: none;\n  font-weight: 600;\n  transition: all 0.2s;\n}\n\n.btn-primary {\n  background: <%= config.primary_color %>;\n  color: #fff;\n}\n.btn-primary:hover { opacity: 0.9; }\n\n.features { padding: 4rem 0; }\n.features h2 { text-align: center; margin-bottom: 3rem; font-size: 2rem; }\n.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }\n.card {\n  background: #f9fafb;\n  padding: 2rem;\n  border-radius: 12px;\n}\n.card h3 { margin-bottom: 0.5rem; }\n.card p { color: #6b7280; }\n\n.contact {\n  background: #f3f4f6;\n  padding: 4rem 0;\n}\n.contact h2 { text-align: center; margin-bottom: 2rem; font-size: 2rem; }\n.contact form {\n  max-width: 500px;\n  margin: 0 auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.contact input, .contact textarea {\n  padding: 0.75rem;\n  border: 1px solid #d1d5db;\n  border-radius: 8px;\n  font-family: inherit;\n}\n\nfooter {\n  background: #1a1a2e;\n  color: #fff;\n  text-align: center;\n  padding: 2rem 0;\n}\n\n@media (max-width: 768px) {\n  .grid { grid-template-columns: 1fr; }\n  .hero h1 { font-size: 2.5rem; }\n}",
                'mime_type' => 'text/css',
            ],
            [
                'path' => 'script.js',
                'content' => "// Smooth scroll for nav links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});",
                'mime_type' => 'application/javascript',
            ],
        ]);

        // 2. Node.js Backend project
        $nodeBackend = Project::create([
            'user_id' => $user->id,
            'name' => 'Node.js Backend',
            'slug' => 'node-backend',
            'description' => 'A Node.js Express backend template with API routes and middleware.',
            'template' => 'node-backend',
            'config' => [
                'title' => 'My API',
                'port' => 3000,
                'version' => '1.0.0',
            ],
            'published' => true,
            'published_at' => now(),
        ]);

        $nodeBackend->files()->createMany([
            [
                'path' => 'app.js',
                'content' => "const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/hello', (_req, res) => {
    res.json({ message: 'Hello from Express!' });
});

app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:\${PORT}`);
});

module.exports = app;",
                'mime_type' => 'application/javascript',
            ],
            [
                'path' => 'package.json',
                'content' => '{
    "name": "my-api",
    "version": "1.0.0",
    "main": "app.js",
    "scripts": {
        "start": "node app.js",
        "dev": "node --watch app.js"
    },
    "dependencies": {
        "express": "^4.21.0"
    }
}',
                'mime_type' => 'application/json',
            ],
            [
                'path' => 'README.md',
                'content' => '# My API\n\nA Node.js Express backend.\n\n## Setup\n\n```bash\nnpm install\nnpm start\n```\n\nServer runs on http://127.0.0.1:3000',
                'mime_type' => 'text/markdown',
            ],
        ]);

        echo "\nProjects seeded: {$landing->name}, {$nodeBackend->name}\n";
    }
}
