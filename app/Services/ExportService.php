<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class ExportService
{
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

        if ($zip->open($filename, ZipArchive::CREATE) !== true) {
            throw new \RuntimeException('Failed to create ZIP archive');
        }

        foreach ($project->files as $file) {
            $zip->addFromString($file->path, $file->content ?? '');
        }

        $zip->addFromString('project.json', json_encode([
            'name' => $project->name,
            'slug' => $project->slug,
            'config' => $project->config,
        ], JSON_PRETTY_PRINT));

        $zip->close();

        return $filename;
    }
}
