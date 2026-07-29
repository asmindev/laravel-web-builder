<?php

namespace App\Services;

use App\Models\ProjectFile;

class FileService
{
    public function upsert(int $projectId, string $path, string $content, ?string $mimeType = null): ProjectFile
    {
        return ProjectFile::updateOrCreate(
            ['project_id' => $projectId, 'path' => $path],
            [
                'content' => $content,
                'mime_type' => $mimeType ?? $this->guessMimeType($path),
            ]
        );
    }

    public function delete(int $projectId, string $path): bool
    {
        return ProjectFile::where('project_id', $projectId)
            ->where('path', $path)
            ->delete() > 0;
    }

    public function forProject(int $projectId)
    {
        return ProjectFile::where('project_id', $projectId)
            ->orderBy('sort_order')
            ->orderBy('path')
            ->get();
    }

    public function find(int $projectId, string $path): ?ProjectFile
    {
        return ProjectFile::where('project_id', $projectId)
            ->where('path', $path)
            ->first();
    }

    public function reorder(int $projectId, array $files): void
    {
        foreach ($files as $item) {
            ProjectFile::where('project_id', $projectId)
                ->where('path', $item['path'])
                ->update(['sort_order' => $item['sort_order']]);
        }
    }

    private function guessMimeType(string $path): string
    {
        return match (pathinfo($path, PATHINFO_EXTENSION)) {
            'ejs', 'html' => 'text/html',
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            default => 'text/plain',
        };
    }
}
