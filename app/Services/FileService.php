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
        return ProjectFile::where('project_id', $projectId)->get();
    }

    public function find(int $projectId, string $path): ?ProjectFile
    {
        return ProjectFile::where('project_id', $projectId)
            ->where('path', $path)
            ->first();
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
