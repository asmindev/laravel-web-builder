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
            'admin_whatsapp' => static::get('admin_whatsapp', '6281234567890'),
            
            // Hero
            'hero_badge' => static::get('hero_badge', 'Engine Generasi Ke-3 Tersedia'),
            'hero_title_1' => static::get('hero_title_1', 'Ketik Idenya,'),
            'hero_title_2' => static::get('hero_title_2', 'AI Kami Buat'),
            'hero_title_highlight' => static::get('hero_title_highlight', 'Websitenya.'),
            'hero_subtitle' => static::get('hero_subtitle', 'Lewati proses coding dan desain berbulan-bulan. Nusantartech AI merakit layout, menulis copy, dan mengatur styling hanya dari satu prompt teks.'),
            'hero_prompt_demo' => static::get('hero_prompt_demo', 'Buat landing page SaaS untuk startup finansial dengan tema modern, tabel harga dinamis, dan dominasi warna navy blue...'),

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
                    'title' => 'Buat project',
                    'description' => 'Isi nama project, deskripsi singkat, lalu pilih template awal untuk memulai.',
                ],
                [
                    'step' => '3',
                    'title' => 'Publish dan bagikan',
                    'description' => 'Uji lewat preview internal, rapikan kode, lalu publikasikan URL ke pengguna.',
                ],
            ],

            // Jasa Agensi
            'agency_badge' => static::get('agency_badge', 'Opsi Terima Beres'),
            'agency_title' => static::get('agency_title', 'Tidak Punya Waktu Membuat Sendiri?'),
            'agency_description' => static::get('agency_description', 'Selain platform AI Builder, tim studio agensi internal kami juga melayani pembuatan website kustom dengan tingkat kerumitan tinggi (Company Profile, E-commerce, hingga SaaS). Serahkan pada tim expert kami.'),

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
