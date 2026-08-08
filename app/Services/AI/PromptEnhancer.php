<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Responsible for transforming simple app descriptions into
 * detailed, structured "Master Prompts" via the Gemini API.
 */
final class PromptEnhancer
{
    private const string API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

    private const string MODEL = 'gemini-flash-latest';

    private const int TIMEOUT_SECONDS = 60;

    /**
     * Enhance a basic app request into a detailed master prompt.
     *
     * For landing pages, returns a pre-built template prompt.
     * For Node.js apps, uses Gemini to generate a comprehensive master prompt.
     */
    public function enhance(string $appName, string $appDescription, string $appType = 'nodejs'): string
    {
        $type = AppType::tryFrom($appType) ?? AppType::NodeJs;

        if ($type === AppType::Landing) {
            return $this->buildLandingPrompt($appName, $appDescription);
        }

        return $this->enhanceViaGemini($appName, $appDescription);
    }

    /**
     * Build a static prompt for landing page generation.
     */
    private function buildLandingPrompt(string $appName, string $appDescription): string
    {
        return <<<PROMPT
Buatkan landing page HTML modern, responsif, dan interaktif untuk "{$appName}".
Deskripsi Tambahan: "{$appDescription}".

Wajib ikuti aturan berikut:
1. Buat file `index.html` dengan Tailwind CSS CDN v3 dan FontAwesome v6.
2. Sediakan Hero Section, Feature Cards, About Us, Testimonials, dan Contact Form.
3. Tambahkan efek animasi smooth scroll dan interactive state JavaScript.
PROMPT;
    }

    /**
     * Call Gemini to generate an enhanced master prompt for a fullstack Node.js app.
     * Falls back to a static template if the API key is missing or the request fails.
     */
    private function enhanceViaGemini(string $appName, string $appDescription): string
    {
        $apiKey = (string) config('services.gemini.key');

        if ($apiKey === '') {
            return $this->buildFallbackPrompt($appName, $appDescription);
        }

        try {
            $url = sprintf(
                '%s/%s:generateContent',
                self::API_BASE_URL,
                self::MODEL
            );

            $response = Http::withHeaders(['x-goog-api-key' => $apiKey])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post($url, [
                    'contents' => [
                        [
                            'role'  => 'user',
                            'parts' => [['text' => $this->buildSystemInstruction($appName, $appDescription)]],
                        ],
                    ],
                ])
                ->throw()
                ->json();

            $output = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

            return $output !== '' ? $output : $this->buildFallbackPrompt($appName, $appDescription);
        } catch (\Throwable $e) {
            Log::error('Gemini prompt enhancement failed', [
                'error'    => $e->getMessage(),
                'app_name' => $appName,
            ]);

            return $this->buildFallbackPrompt($appName, $appDescription);
        }
    }

    /**
     * Build the system instruction sent to Gemini for master-prompt generation.
     */
    private function buildSystemInstruction(string $appName, string $appDescription): string
    {
        return <<<SYS
You are an elite Senior Software Architect & Lead Prompt Engineer.
Your task is to take a user's basic request for an application (Name: "{$appName}", Description: "{$appDescription}") and transform it into an EXTREMELY DETAILED, HIGHLY STRUCTURED, STEP-BY-STEP MASTER PROMPT in Indonesian.

The prompt you produce will be copied by the user and pasted into an AI Code Generator. It MUST leave ZERO room for ambiguity or generic placeholder code. The resulting code generated from your prompt MUST be a 100% functional, production-ready fullstack web application that works immediately upon execution.

YOU MUST STRUCTURE THE OUTPUT MASTER PROMPT AS FOLLOWS (USE THIS EXACT FORMAT AND SECTION TITLES IN INDONESIAN):

Berikan perintah tegas di awal prompt bahwa: "Kode harus 100% UTUH, LENGKAP TANPA PLACEHOLDER, dan LANGSUNG JALAN."

1. DESKRIPSI DAN KONTEKS BISNIS APLIKASI
   - Nama Aplikasi & Tujuan Bisnis Utama yang spesifik (sesuai dengan: {$appName} - {$appDescription}).
   - Target User & Peran Hak Akses (misal: Admin, Staff, Pelanggan). Jelaskan spesifik apa yang bisa dilakukan masing-masing role.

2. RANCANGAN SKEMA DATABASE TERSTRUKTUR (MySQL / SQLite Shim Compatible)
   - Daftarkan secara spesifik setiap nama tabel beserta kolom, tipe data, dan tujuannya yang sangat relevan dengan bisnis.
   - Wajib ada tabel `users`.
   - Rancang minimal 3-5 tabel utama yang saling berelasi untuk mendukung logika bisnis aplikasi ini.
   - Aturan Wajib: Primary key WAJIB menggunakan sintaks: `id INT AUTO_INCREMENT PRIMARY KEY`.

3. DAFTAR API ENDPOINTS EXPRESS.JS (LENGKAP DENGAN PAYLOAD & LOGIKA BISNIS)
   - Auth API (WAJIB ADA):
     * POST /api/auth/register (Register user baru dengan bcryptjs hash)
     * POST /api/auth/login (Authentikasi express-session)
     * POST /api/auth/logout (Destroy session)
     * GET /api/auth/me (Cek status session user saat ini)
   - Domain Business APIs (Spesifik untuk aplikasi ini):
     * Definisikan minimal 5-8 endpoint CRUD (GET, POST, PUT, DELETE) yang mengimplementasikan alur bisnis utama.
     * Tuliskan struktur JSON payload request dan response untuk masing-masing endpoint.
     * Tekankan bahwa semua operasi DB harus menggunakan `mysql2/promise` (async/await).

4. RANCANGAN ANTARMUKA SINGLE PAGE APPLICATION (SPA) (views/index.ejs)
   - Layout & Tema: Gunakan desain UI/UX modern, premium, dan profesional. Wajib pakai Tailwind CSS v3 (CDN) + FontAwesome v6.
   - Navigasi: Sidebar Menu / Topbar Menu menggunakan Hash URL (`#dashboard`, `#module1`, `#module2`).
   - Dashboard Interaktif: Rancang widget/card analytics yang sesuai dengan aplikasi (misal: Total Pendapatan, Jumlah Transaksi, dll).
   - Form & Data Table: Sediakan desain CRUD (Tabel dengan aksi Edit/Hapus, dan Modal Form untuk Input Data).
   - Frontend State Rules: HARUS ditekankan bahwa di JavaScript, Dilarang keras menggunakan `if (!currentUser) return;` di awal fungsi fetch data/render page.

5. ATURAN STRICT INFRASTRUKTUR ENGINE (WAJIB DIIKUTI PLEK-KETIPLEK, JANGAN DIUBAH):
   - BERKAS `.env`:
     PORT=3000
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=app_db
     DB_USERNAME=root
     DB_PASSWORD=secret
     SESSION_SECRET=super_secret_session_key_2026
   - BERKAS `package.json`: express, mysql2, express-session, bcryptjs, ejs.
   - BERKAS `app.js`: Gunakan `require('mysql2/promise')`, `express-session`, dan single DDL statement berurutan di dalam fungsi async `initDB()`.
   - PENTING (RESTRIKSI KODE): 
     1. DILARANG menggunakan `process.on('SIGINT', ...)` atau listener proses lainnya karena kode akan berjalan dalam context VM terisolasi yang tidak memilikinya.
     2. DILARANG mengeksekusi sintaks `CREATE DATABASE IF NOT EXISTS app_db`. Sistem database sudah disediakan oleh shim (SQLite), Anda hanya boleh melakukan `CREATE TABLE IF NOT EXISTS ...`.
   - PENTING (API CALL): Semua panggilan `fetch(...)` di bagian JavaScript sisi klien wajib menggunakan absolute path diawali `/api/` (contoh: `fetch('/api/users')`).

Tuliskan hasil akhir Master Prompt dalam Bahasa Indonesia yang sangat tegas, terstruktur, mendetail, dan siap di-copy-paste. JANGAN BERIKAN PEMBUKA/PENUTUP ATAU KOMENTAR TAMBAHAN, langsung berikan isi Master Prompt-nya saja. Jangan bungkus output dengan markdown backticks seperti ```markdown atau lainnya.
SYS;
    }

    /**
     * Build a static fallback prompt when Gemini is unavailable.
     */
    private function buildFallbackPrompt(string $appName, string $appDescription): string
    {
        return <<<PROMPT
# MASTER PROMPT APLIKASI WEB FULLSTACK: {$appName}

Tolong buatkan aplikasi web fullstack "{$appName}" yang utuh, fungsional, dan 100% LANGSUNG JALAN di atas Node.js Express Engine.

## 1. RINGKASAN & BISNIS LOGIK:
Aplikasi dirancang khusus untuk: "{$appDescription}".
Sediakan peran hak akses: Admin (akses penuh) dan Staff/Kasir.

## 2. SKEMA DATABASE TERSTRUKTUR (MySQL / SQLite Compatible):
Buatkan fungsi `initDB()` di app.js yang secara otomatis mengeksekusi tabel-tabel berikut:
- `users`: (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), password VARCHAR(255), role VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `items/services`: (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), category VARCHAR(100), price DECIMAL(12,2), stock_or_duration INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `transactions/orders`: (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(100), customer_name VARCHAR(255), total_amount DECIMAL(12,2), status VARCHAR(50), payment_status VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `transaction_details`: (id INT AUTO_INCREMENT PRIMARY KEY, transaction_id INT, item_id INT, qty INT, price DECIMAL(12,2), subtotal DECIMAL(12,2))

## 3. EXPRESS.JS REST API ENDPOINTS:
- Auth: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
- Analytics: GET /api/dashboard/stats
- Main Features: GET /api/items, POST /api/items, PUT /api/items/:id, DELETE /api/items/:id
- Transactions: GET /api/orders, POST /api/orders, PUT /api/orders/:id/status, DELETE /api/orders/:id

## 4. DESAIN FRONTEND SPA (views/index.ejs):
- Gunakan Tailwind CSS CDN v3 + FontAwesome v6 (Dark Mode aesthetic).
- Sidebar Navigation dengan Hash URL (#dashboard, #orders, #items, #users).
- Ringkasan statistik di Dashboard (Total Pemasukan, Pesanan Aktif, Total Pelanggan).
- Modal Form Interaktif untuk Tambah/Edit Data dan Cetak Struk/Detail Transaksi.
- Semua fetch API wajib absolute path diawali `/api/` (contoh: `fetch('/api/orders')`).

## 5. STRUKTUR INFRASTRUKTUR WAJIB:
- Berkas `.env`:
  PORT=3000
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=app_db
  DB_USERNAME=root
  DB_PASSWORD=secret
  SESSION_SECRET=super_secret_session_key_2026
- Berkas `package.json`: express, mysql2, express-session, bcryptjs, ejs.
- PENTING (RESTRIKSI KODE): 
  1. DILARANG menggunakan `process.on('SIGINT', ...)` atau listener proses sejenis.
  2. DILARANG mengeksekusi sintaks `CREATE DATABASE IF NOT EXISTS app_db`. Hanya jalankan `CREATE TABLE IF NOT EXISTS ...`.

Tuliskan seluruh kode file `.env`, `package.json`, `app.js`, dan `views/index.ejs` secara LENGKAP tanpa potongan.
PROMPT;
    }
}
