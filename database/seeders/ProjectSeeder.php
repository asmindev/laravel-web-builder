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

        // 1. Landing page project (Pure Single-File HTML)
        $landing = Project::create([
            'user_id' => $user->id,
            'name' => 'Landing Page Single-File HTML',
            'slug' => 'landing-page',
            'description' => 'A modern, fully responsive pure single-file HTML landing page template.',
            'template' => 'landing',
            'config' => [
                'title' => 'Nusantara SaaS',
                'tagline' => 'Solusi Digital Terbaik untuk Bisnis Anda',
            ],
            'published' => true,
            'published_at' => now(),
        ]);

        $landing->files()->createMany([
            [
                'path' => 'index.html',
                'content' => '<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nusantara SaaS — Landing Page</title>
    <!-- Tailwind CSS v4 CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <!-- FontAwesome v6 Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        .gradient-text {
            background: linear-gradient(135deg, #2cb1bc 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-[#2cb1bc]/30 selection:text-[#2cb1bc]">

    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="#" class="flex items-center gap-2 text-lg font-bold tracking-tight">
                <i class="fa-solid fa-cube text-[#2cb1bc]"></i>
                <span>Nusantara<span class="text-[#2cb1bc]">SaaS</span></span>
            </a>
            <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                <a href="#features" class="hover:text-white transition-colors">Fitur</a>
                <a href="#about" class="hover:text-white transition-colors">Tentang Kami</a>
                <a href="#pricing" class="hover:text-white transition-colors">Harga</a>
                <a href="#contact" class="hover:text-white transition-colors">Kontak</a>
            </div>
            <div class="hidden md:flex items-center gap-3">
                <a href="#contact" class="bg-[#2cb1bc] hover:bg-[#2597a1] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-[#2cb1bc]/20">Mulai Sekarang</a>
            </div>
            <!-- Mobile Drawer Button -->
            <button id="menu-btn" class="md:hidden text-slate-300 hover:text-white p-2">
                <i class="fa-solid fa-bars text-lg"></i>
            </button>
        </div>
        <!-- Mobile Navigation Menu -->
        <div id="mobile-menu" class="hidden md:hidden border-b border-slate-800 bg-slate-900 px-4 py-4 space-y-3">
            <a href="#features" class="block text-sm font-medium text-slate-300 hover:text-white">Fitur</a>
            <a href="#about" class="block text-sm font-medium text-slate-300 hover:text-white">Tentang Kami</a>
            <a href="#pricing" class="block text-sm font-medium text-slate-300 hover:text-white">Harga</a>
            <a href="#contact" class="block text-sm font-medium text-slate-300 hover:text-white">Kontak</a>
            <a href="#contact" class="inline-block w-full text-center bg-[#2cb1bc] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs">Mulai Sekarang</a>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span class="inline-flex items-center gap-2 bg-[#2cb1bc]/10 border border-[#2cb1bc]/30 text-[#2cb1bc] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
                <i class="fa-solid fa-sparkles"></i> Platform AI Generasi Ke-3
            </span>
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-6">
                Ketik Idenya, <span class="gradient-text">Website Jadi</span> Seketika.
            </h1>
            <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
                Solusi terlengkap untuk membangun landing page HTML murni dan aplikasi web Node.js yang cepat, indah, dan siap pakai tanpa coding rumit.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#contact" class="w-full sm:w-auto bg-[#2cb1bc] hover:bg-[#2597a1] text-slate-950 font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-[#2cb1bc]/25 flex items-center justify-center gap-2">
                    <span>Coba Gratis Sekarang</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
                <a href="#features" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold px-7 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-[#2cb1bc] fa-circle-play"></i>
                    <span>Pelajari Fitur</span>
                </a>
            </div>
        </div>
    </section>

    <!-- Feature Cards Section -->
    <section id="features" class="py-20 bg-slate-900/50 border-t border-slate-800/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-16">
                <h2 class="text-3xl font-bold tracking-tight mb-4">Fitur Unggulan Terbaik</h2>
                <p class="text-slate-400 text-sm md:text-base">Dirancang khusus untuk mendukung performa maksimal dan kemudahan pengelolaan.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-[#2cb1bc]/50 transition-all duration-300 group">
                    <div class="size-12 rounded-xl bg-[#2cb1bc]/10 text-[#2cb1bc] flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                        <i class="fa-solid fa-bolt"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Super Cepat</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">Performa loading maksimal tanpa beban script berlebih, memastikan kenyamanan pengguna.</p>
                </div>
                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-[#2cb1bc]/50 transition-all duration-300 group">
                    <div class="size-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                        <i class="fa-solid fa-mobile-screen"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">100% Responsif</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">Tampilan luar biasa indah di semua perangkat, baik smartphone, tablet, maupun desktop.</p>
                </div>
                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-[#2cb1bc]/50 transition-all duration-300 group">
                    <div class="size-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                        <i class="fa-solid fa-[#2cb1bc] fa-shield-halved"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Aman &amp; Terpercaya</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">Dibangun dengan standar keamanan modern untuk perlindungan data pelanggan Anda.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Form Section -->
    <section id="contact" class="py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div class="text-center mb-8">
                    <h2 class="text-2xl md:text-3xl font-bold mb-3">Hubungi Tim Kami</h2>
                    <p class="text-slate-400 text-sm">Kirimkan pesan Anda dan kami akan merespons dalam hitungan menit.</p>
                </div>
                <form id="contact-form" class="space-y-5">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-slate-400 mb-2">Nama Lengkap</label>
                        <input type="text" required placeholder="John Doe" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2cb1bc] transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-slate-400 mb-2">Alamat Email</label>
                        <input type="email" required placeholder="john@example.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2cb1bc] transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-slate-400 mb-2">Pesan Anda</label>
                        <textarea rows="4" required placeholder="Tuliskan kebutuhan Anda..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2cb1bc] transition-colors"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-[#2cb1bc] hover:bg-[#2597a1] text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#2cb1bc]/20">
                        Kirim Pesan SEKARANG
                    </button>
                    <div id="form-alert" class="hidden p-4 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center">
                        <i class="fa-solid fa-circle-check mr-1.5"></i> Pesan Anda berhasil terkirim!
                    </div>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-10 bg-slate-950 text-slate-500 text-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <p>&copy; 2026 NusantaraSaaS. All rights reserved.</p>
        </div>
    </footer>

    <!-- Embedded JavaScript -->
    <script>
        // Mobile Drawer Toggle
        const menuBtn = document.getElementById("menu-btn");
        const mobileMenu = document.getElementById("mobile-menu");
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener("click", () => {
                mobileMenu.classList.toggle("hidden");
            });
        }

        // Contact Form Interactive Submit Simulation
        const contactForm = document.getElementById("contact-form");
        const formAlert = document.getElementById("form-alert");
        if (contactForm && formAlert) {
            contactForm.addEventListener("submit", (e) => {
                e.preventDefault();
                formAlert.classList.remove("hidden");
                contactForm.reset();
                setTimeout(() => {
                    formAlert.classList.add("hidden");
                }, 4000);
            });
        }
    </script>
</body>
</html>',
                'mime_type' => 'text/html',
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
