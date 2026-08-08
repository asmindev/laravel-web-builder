<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class ExportService
{
    public function __construct(
        private readonly SQLiteToMySQLConverter $sqliteToMySQLConverter
    ) {}

    public function exportAsJson(Project $project): array
    {
        $project->load('files', 'assets');

        return [
            'name' => $project->name,
            'slug' => $project->slug,
            'description' => $project->description,
            'template' => $project->template,
            'config' => $project->config,
            'files' => $project->files->map(fn ($f) => [
                'path' => $f->path,
                'content' => $f->content,
                'mime_type' => $f->mime_type,
            ]),
            'exported_at' => now()->toIso8601String(),
        ];
    }

    public function importFromJson(array $data, int $userId): Project
    {
        $project = Project::create([
            'user_id' => $userId,
            'name' => $data['name'] ?? 'Imported Project',
            'slug' => $data['slug'] ?? null,
            'description' => $data['description'] ?? null,
            'template' => $data['template'] ?? 'blank',
            'config' => $data['config'] ?? ['title' => $data['name'] ?? 'Imported'],
        ]);

        foreach ($data['files'] ?? [] as $file) {
            $project->files()->create([
                'path' => $file['path'],
                'content' => $file['content'],
                'mime_type' => $file['mime_type'] ?? 'text/plain',
            ]);
        }

        return $project->fresh();
    }

    public function exportAsZip(Project $project): string
    {
        $project->load('files');

        $zip = new ZipArchive();
        $filename = storage_path("app/exports/{$project->slug}.zip");

        if (!is_dir(storage_path('app/exports'))) {
            mkdir(storage_path('app/exports'), 0755, true);
        }

        if ($zip->open($filename, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Failed to create ZIP archive');
        }

        // Add all project source files
        foreach ($project->files as $file) {
            $zip->addFromString($file->path, $file->content ?? '');
        }

        // Generate MySQL database dump from SQLite runtime DB
        $sqliteDbPath = base_path("node-engine/storage/{$project->slug}.db");
        $mysqlDumpSql = $this->sqliteToMySQLConverter->convertToMySQLDump($sqliteDbPath);

        $zip->addFromString('database.sql', $mysqlDumpSql);

        // Add .env.example with MySQL configuration
        $zip->addFromString('.env.example', implode("\n", [
            'PORT=3000',
            'DB_HOST=127.0.0.1',
            'DB_PORT=3306',
            'DB_DATABASE=' . ($project->slug ? str_replace('-', '_', $project->slug) : 'app_db'),
            'DB_USERNAME=root',
            'DB_PASSWORD=secret',
            'SESSION_SECRET=' . bin2hex(random_bytes(16)),
        ]));

        // Add README.md with deployment instructions
        $zip->addFromString('README.md', implode("\n", [
            "# {$project->name}",
            "",
            "Aplikasi Node.js + Express.js + EJS ini siap dideploy ke server produksi (MySQL).",
            "",
            "## 🚀 Langkah Instalasi & Deployment",
            "",
            "1. **Ekstrak & Install Dependencies**:",
            "   ```bash",
            "   npm install",
            "   ```",
            "",
            "2. **Impor Database MySQL**:",
            "   - Buat database baru di server MySQL Anda (contoh: `" . ($project->slug ? str_replace('-', '_', $project->slug) : 'app_db') . "`).",
            "   - Impor berkas `database.sql` ke database MySQL Anda:",
            "     ```bash",
            "     mysql -u root -p " . ($project->slug ? str_replace('-', '_', $project->slug) : 'app_db') . " < database.sql",
            "     ```",
            "",
            "3. **Konfigurasi Environment**:",
            "   - Salin `.env.example` menjadi `.env`:",
            "     ```bash",
            "     cp .env.example .env",
            "     ```",
            "   - Sesuaikan kredensial `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, dan `DB_DATABASE` di `.env`.",
            "",
            "4. **Jalankan Aplikasi**:",
            "   ```bash",
            "   npm start",
            "   ```",
            "",
            "Disusun secara otomatis oleh **Nusantara Engine**.",
        ]));

        $zip->addFromString('project.json', json_encode([
            'name' => $project->name,
            'slug' => $project->slug,
            'config' => $project->config,
        ], JSON_PRETTY_PRINT));

        $zip->close();

        return $filename;
    }
}
