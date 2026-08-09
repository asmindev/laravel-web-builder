<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, ?string $default = null): ?string
    {
        try {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        } catch (\Throwable $e) {
            return $default;
        }
    }

    public static function set(string $key, ?string $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    public static function getLandingContent(): array
    {
        return [
            'app_name' => static::get('app_name', 'Nusantara Engine'),
            'app_version' => static::get('app_version', 'V2'),
            'admin_whatsapp' => static::get('admin_whatsapp', '6281234567890'),
            
            // Hero
            'hero_badge' => static::get('hero_badge', 'Engine Generasi Ke-3 Tersedia'),
            'hero_title_1' => static::get('hero_title_1', 'Ketik Idenya,'),
            'hero_title_2' => static::get('hero_title_2', 'AI Kami Buat'),
            'hero_title_highlight' => static::get('hero_title_highlight', 'Websitenya.'),
            'hero_subtitle' => static::get('hero_subtitle', 'Lewati proses coding dan desain berbulan-bulan. Nusantartech AI merakit layout, menulis copy, dan mengatur styling hanya dari satu prompt teks.'),
            'hero_prompt_demo' => static::get('hero_prompt_demo', 'Buat landing page SaaS untuk startup finansial dengan tema modern, tabel harga dinamis, dan dominasi warna navy blue...'),
            'hero_prompt_suggestions' => json_decode(static::get('hero_prompt_suggestions', ''), true) ?: [
                'Toko Sepatu Sneakers',
                'Klinik Gigi Premium',
            ],

            // Fitur AI
            'fitur_section_tag' => static::get('fitur_section_tag', '// fitur'),
            'fitur_title' => static::get('fitur_title', 'Yang Anda dapatkan'),
            'fitur_subtitle' => static::get('fitur_subtitle', 'Fokus pada alur kerja inti yang paling sering dipakai untuk membangun dan mengelola project berbasis Node.js.'),
            'fitur_items' => json_decode(static::get('fitur_items', ''), true) ?: [
                [
                    'tag' => 'project-builder.js',
                    'title' => 'Project builder',
                    'description' => 'Buat landing page atau aplikasi baru dengan struktur file yang langsung siap dipakai.',
                ],
                [
                    'tag' => 'browser-ide.js',
                    'title' => 'IDE browser',
                    'description' => 'Edit file utama, jalankan project, lihat log, dan simpan perubahan dari dashboard.',
                ],
                [
                    'tag' => 'publish.sh',
                    'title' => 'Preview dan publish',
                    'description' => 'Aktifkan preview internal dan URL publik saat project sudah siap diuji atau dipresentasikan.',
                ],
                [
                    'tag' => 'users.json',
                    'title' => 'Manajemen user',
                    'description' => 'Atur akun user, role, status aktif, password, dan batas project sesuai paket layanan.',
                ],
            ],

            // Cara Kerja
            'cara_kerja_tag' => static::get('cara_kerja_tag', '// cara kerja'),
            'cara_kerja_title' => static::get('cara_kerja_title', 'Tiga langkah untuk mulai'),
            'cara_kerja_subtitle' => static::get('cara_kerja_subtitle', 'Alurnya dibuat singkat supaya user awam tetap bisa mulai tanpa banyak penyesuaian teknis.'),
            'cara_kerja_steps' => json_decode(static::get('cara_kerja_steps', ''), true) ?: [
                [
                    'step' => '1',
                    'title' => 'Pilih paket',
                    'description' => 'Tentukan paket sesuai kebutuhan jumlah project dan jenis pekerjaan yang dijalankan.',
                ],
                [
                    'step' => '2',
                    'title' => 'Registrasi akun',
                    'description' => 'Isi nama lengkap, email, nomor WhatsApp, lalu lanjut ke checkout DOKU untuk menyelesaikan pembayaran.',
                ],
                [
                    'step' => '3',
                    'title' => 'Masuk dan mulai build',
                    'description' => 'Setelah akun aktif, login ke dashboard dan mulai membuat landing page atau aplikasi baru.',
                ],
            ],

            // Pricing
            'pricing_section_tag' => static::get('pricing_section_tag', '[ Akses Platform ]'),
            'pricing_title' => static::get('pricing_title', 'Pilih Paket Builder Anda'),
            'pricing_subtitle' => static::get('pricing_subtitle', 'Mulai gratis untuk bereksperimen, tingkatkan ke Pro saat Anda siap meluncurkan bisnis.'),
            'pricing_starter_title' => static::get('pricing_starter_title', 'Starter'),
            'pricing_starter_subtitle' => static::get('pricing_starter_subtitle', 'Untuk eksplorasi kekuatan AI.'),
            'pricing_starter_price' => static::get('pricing_starter_price', 'Rp 0'),
            'pricing_starter_features' => json_decode(static::get('pricing_starter_features', ''), true) ?: [
                '10x Generate AI per bulan',
                'Akses Editor Visual Dasar',
                'Domain nusantartech.site',
            ],
            'pricing_pro_title' => static::get('pricing_pro_title', 'Pro Builder'),
            'pricing_pro_subtitle' => static::get('pricing_pro_subtitle', 'Solusi lengkap untuk profesional.'),
            'pricing_pro_price' => static::get('pricing_pro_price', 'Rp 149k'),
            'pricing_pro_period' => static::get('pricing_pro_period', '/bln'),
            'pricing_pro_features' => json_decode(static::get('pricing_pro_features', ''), true) ?: [
                'Unlimited Generate AI',
                'Export Kode (HTML/React/Tailwind)',
                'Custom Domain (.com/.id)',
                'Integrasi Database',
            ],

            // Jasa Agensi
            'agency_badge' => static::get('agency_badge', 'Opsi Terima Beres'),
            'agency_title' => static::get('agency_title', 'Tidak Punya Waktu Membuat Sendiri?'),
            'agency_description' => static::get('agency_description', 'Selain platform AI Builder, Nusantartech juga memiliki Tim Studio Agensi Internal. Kami melayani pembuatan website kustom dengan tingkat kerumitan tinggi (Company Profile, E-commerce, hingga SaaS). Serahkan pada tim expert kami.'),

            // Terms
            'terms_tag' => static::get('terms_tag', '// terms & conditions'),
            'terms_title' => static::get('terms_title', 'Terms & Conditions'),
            'terms_subtitle' => static::get('terms_subtitle', 'Gunakan bagian ini untuk menaruh aturan penggunaan layanan, hak dan kewajiban pengguna, serta batas tanggung jawab.'),
            'terms_items' => json_decode(static::get('terms_items', ''), true) ?: [
                [
                    'number' => '§1',
                    'title' => 'Penggunaan layanan',
                    'description' => 'Layanan hanya digunakan untuk keperluan yang sesuai dengan ketentuan, hukum yang berlaku, dan kebijakan internal yang Anda tetapkan.',
                ],
                [
                    'number' => '§2',
                    'title' => 'Akses akun',
                    'description' => 'Pengguna wajib menjaga kerahasiaan kredensial akun dan bertanggung jawab atas aktivitas yang dilakukan melalui akun tersebut.',
                ],
                [
                    'number' => '§3',
                    'title' => 'Pembaruan ketentuan',
                    'description' => 'Anda dapat memperbarui syarat dan ketentuan sewaktu-waktu selama perubahan tersebut diumumkan dengan jelas kepada pengguna.',
                ],
            ],
        ];
    }
}
