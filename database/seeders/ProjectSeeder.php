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

        // 2. Blog project
        $blog = Project::create([
            'user_id' => $user->id,
            'name' => 'My Blog',
            'slug' => 'my-blog',
            'description' => 'A personal blog template with posts and sidebar.',
            'template' => 'blog',
            'config' => [
                'title' => 'My Blog',
                'author' => 'John Doe',
                'posts' => [
                    ['title' => 'Getting Started with EJS', 'date' => '2026-07-01', 'excerpt' => 'Learn how to use EJS templates effectively.'],
                    ['title' => 'Building Modern Websites', 'date' => '2026-07-15', 'excerpt' => 'Tips and tricks for modern web development.'],
                ],
            ],
            'published' => true,
            'published_at' => now(),
        ]);

        $blog->files()->createMany([
            [
                'path' => 'index.ejs',
                'content' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= config.title %> — <%= config.author %></title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1><%= config.title %></h1>
            <p class="subtitle">by <%= config.author %></p>
        </div>
    </header>

    <main class="container blog-layout">
        <section class="posts">
            <% config.posts.forEach(function(post) { %>
            <article class="post">
                <h2><%= post.title %></h2>
                <time datetime="<%= post.date %>"><%= post.date %></time>
                <p><%= post.excerpt %></p>
                <a href="#" class="read-more">Read more →</a>
            </article>
            <% }) %>
        </section>

        <aside class="sidebar">
            <div class="widget">
                <h3>About</h3>
                <p>Welcome to my blog. I write about web development, design, and technology.</p>
            </div>
            <div class="widget">
                <h3>Recent Posts</h3>
                <ul>
                    <% config.posts.slice(0, 3).forEach(function(post) { %>
                    <li><a href="#"><%= post.title %></a></li>
                    <% }) %>
                </ul>
            </div>
        </aside>
    </main>

    <footer>
        <div class="container">
            <p>&copy; <span id="year"></span> <%= config.author %></p>
        </div>
    </footer>

    <script>
        document.getElementById("year").textContent = new Date().getFullYear();
    </script>
</body>
</html>',
                'mime_type' => 'text/html',
            ],
            [
                'path' => 'style.css',
                'content' => "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Georgia', serif;\n  line-height: 1.8;\n  color: #334155;\n  background: #f8fafc;\n}\n\n.container {\n  max-width: 960px;\n  margin: 0 auto;\n  padding: 0 1.5rem;\n}\n\nheader {\n  background: linear-gradient(135deg, #1e293b, #334155);\n  color: #fff;\n  padding: 3rem 0;\n  text-align: center;\n}\n\nheader h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }\n.subtitle { color: #94a3b8; font-style: italic; }\n\n.blog-layout {\n  display: grid;\n  grid-template-columns: 2fr 1fr;\n  gap: 3rem;\n  padding: 3rem 0;\n}\n\n.post {\n  background: #fff;\n  padding: 2rem;\n  border-radius: 12px;\n  margin-bottom: 1.5rem;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.08);\n}\n\n.post h2 { margin-bottom: 0.5rem; }\n.post time { color: #94a3b8; font-size: 0.875rem; }\n.post p { margin: 1rem 0; }\n.read-more { color: #3b82f6; text-decoration: none; font-weight: 600; }\n\n.sidebar { position: sticky; top: 2rem; }\n.widget {\n  background: #fff;\n  padding: 1.5rem;\n  border-radius: 12px;\n  margin-bottom: 1.5rem;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.08);\n}\n.widget h3 { margin-bottom: 0.75rem; font-size: 1rem; }\n.widget ul { list-style: none; }\n.widget li { margin-bottom: 0.5rem; }\n.widget a { color: #3b82f6; text-decoration: none; }\n\nfooter {\n  background: #1e293b;\n  color: #94a3b8;\n  text-align: center;\n  padding: 2rem 0;\n}\n\n@media (max-width: 768px) {\n  .blog-layout { grid-template-columns: 1fr; }\n}",
                'mime_type' => 'text/css',
            ],
        ]);

        // 3. Portfolio project (draft)
        $portfolio = Project::create([
            'user_id' => $user->id,
            'name' => 'Portfolio',
            'slug' => 'portfolio-demo',
            'description' => 'A creative portfolio template for showcasing work.',
            'template' => 'portfolio',
            'config' => [
                'title' => 'Jane Designer',
                'role' => 'UI/UX Designer & Developer',
                'projects' => [
                    ['name' => 'Project Alpha', 'desc' => 'A redesign of a SaaS platform.'],
                    ['name' => 'Project Beta', 'desc' => 'Mobile app for task management.'],
                    ['name' => 'Project Gamma', 'desc' => 'E-commerce storefront.'],
                ],
            ],
            'published' => false,
        ]);

        $portfolio->files()->createMany([
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
    <section class="hero">
        <div class="container">
            <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Jane" alt="Avatar" class="avatar">
            <h1><%= config.title %></h1>
            <p class="role"><%= config.role %></p>
            <p class="bio">I craft digital experiences that blend aesthetics with usability.</p>
            <div class="social-links">
                <a href="#">GitHub</a>
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
            </div>
        </div>
    </section>

    <section class="work">
        <div class="container">
            <h2>Selected Work</h2>
            <div class="grid">
                <% config.projects.forEach(function(project) { %>
                <div class="project-card">
                    <div class="card-image"><%= project.name[0] %></div>
                    <h3><%= project.name %></h3>
                    <p><%= project.desc %></p>
                </div>
                <% }) %>
            </div>
        </div>
    </section>
</body>
</html>',
                'mime_type' => 'text/html',
            ],
            [
                'path' => 'style.css',
                'content' => "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  background: #0f0f23;\n  color: #e2e8f0;\n}\n\n.container { max-width: 1000px; margin: 0 auto; padding: 0 2rem; }\n\n.hero {\n  min-height: 70vh;\n  display: flex;\n  align-items: center;\n  text-align: center;\n  padding: 4rem 0;\n}\n\n.avatar {\n  width: 100px;\n  height: 100px;\n  border-radius: 50%;\n  margin-bottom: 1.5rem;\n  background: #1e293b;\n}\n\n.hero h1 { font-size: 3rem; margin-bottom: 0.5rem; }\n.role { color: #60a5fa; font-size: 1.2rem; margin-bottom: 1rem; }\n.bio { color: #94a3b8; max-width: 500px; margin: 0 auto 2rem; }\n\n.social-links { display: flex; gap: 1rem; justify-content: center; }\n.social-links a {\n  color: #94a3b8;\n  text-decoration: none;\n  border: 1px solid #334155;\n  padding: 0.5rem 1.5rem;\n  border-radius: 999px;\n  transition: all 0.2s;\n}\n.social-links a:hover { border-color: #60a5fa; color: #60a5fa; }\n\n.work { padding: 4rem 0; }\n.work h2 { font-size: 2rem; margin-bottom: 3rem; }\n\n.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }\n.project-card {\n  background: #1a1a3e;\n  border-radius: 16px;\n  padding: 2rem;\n  transition: transform 0.2s;\n}\n.project-card:hover { transform: translateY(-4px); }\n.card-image {\n  width: 48px;\n  height: 48px;\n  background: #60a5fa20;\n  border-radius: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: #60a5fa;\n  margin-bottom: 1rem;\n}\n.project-card h3 { margin-bottom: 0.5rem; }\n.project-card p { color: #94a3b8; font-size: 0.9rem; }\n\n@media (max-width: 768px) {\n  .grid { grid-template-columns: 1fr; }\n  .hero h1 { font-size: 2rem; }\n}",
                'mime_type' => 'text/css',
            ],
            [
                'path' => 'script.js',
                'content' => "// Intersection observer for animation
const cards = document.querySelectorAll('.project-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease-out';
    observer.observe(card);
});",
                'mime_type' => 'application/javascript',
            ],
        ]);

        // 4. Node.js Backend project
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

        echo "\nProjects seeded: {$landing->name}, {$blog->name}, {$portfolio->name}, {$nodeBackend->name}\n";
    }
}
