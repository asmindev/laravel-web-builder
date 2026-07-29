<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectPublish;
use Illuminate\Support\Facades\Http;

class PublishService
{
    public function publish(Project $project): ProjectPublish
    {
        $project->load('files');

        $snapshot = [
            'slug' => $project->slug,
            'template' => $project->template,
            'config' => $project->config,
            'files' => $project->files->map(fn ($f) => [
                'path' => $f->path,
                'content' => $f->content,
                'mime_type' => $f->mime_type,
            ]),
        ];

        $publish = $project->publishes()->create([
            'version' => $this->nextVersion($project),
            'snapshot' => $snapshot,
            'published_at' => now(),
        ]);

        $project->update([
            'published' => true,
            'published_at' => now(),
        ]);

        $this->purgeNodeCache($project);

        return $publish;
    }

    public function unpublish(Project $project): void
    {
        $project->update([
            'published' => false,
            'published_at' => null,
        ]);

        $this->purgeNodeCache($project);
    }

    public function getPublishedData(string $slug): ?array
    {
        $project = Project::published()->where('slug', $slug)->first();

        if (!$project) {
            return null;
        }

        $latest = $project->publishes()->latest('published_at')->first();

        return $latest ? $latest->snapshot : $this->buildSnapshot($project);
    }

    private function buildSnapshot(Project $project): array
    {
        $project->load('files');

        return [
            'slug' => $project->slug,
            'template' => $project->template,
            'config' => $project->config,
            'files' => $project->files->map(fn ($f) => [
                'path' => $f->path,
                'content' => $f->content,
                'mime_type' => $f->mime_type,
            ])->toArray(),
        ];
    }

    private function purgeNodeCache(Project $project): void
    {
        $nodeUrl = config('app.node_engine_url');

        if (!$nodeUrl) {
            return;
        }

        try {
            Http::withHeaders([
                'X-Internal-Api-Key' => config('app.internal_api_secret'),
            ])->timeout(5)->post("{$nodeUrl}/internal/purge-cache", [
                'slug' => $project->slug,
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    public function formatForApi(string $slug): ?array
    {
        $project = Project::published()->with('files', 'assets')->where('slug', $slug)->first();

        if (!$project) {
            return null;
        }

        return [
            'slug' => $project->slug,
            'template' => $project->template,
            'config' => $project->config,
            'files' => $project->files->map(fn ($f) => [
                'path' => $f->path,
                'content' => $f->content,
                'mime_type' => $f->mime_type,
            ]),
            'assets' => $project->assets->map(fn ($a) => [
                'filename' => $a->filename,
                'original_filename' => $a->original_filename,
                'url' => $a->url(),
                'mime_type' => $a->mime_type,
            ]),
            'published' => true,
        ];
    }

    private function nextVersion(Project $project): string
    {
        $last = $project->publishes()->latest('published_at')->first();
        if (!$last) {
            return '1.0.0';
        }

        $parts = explode('.', $last->version);
        $parts[2] = (int) ($parts[2] ?? 0) + 1;

        return implode('.', $parts);
    }
}
