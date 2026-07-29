<?php

namespace App\Services;

use App\Models\ProjectAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssetService
{
    public function upload(int $projectId, UploadedFile $file): ProjectAsset
    {
        $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("projects/{$projectId}", $filename, 'local');

        return ProjectAsset::create([
            'project_id' => $projectId,
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'disk' => 'local',
        ]);
    }

    public function delete(ProjectAsset $asset): bool
    {
        Storage::disk($asset->disk)->delete($asset->path);
        return $asset->delete();
    }

    public function forProject(int $projectId)
    {
        return ProjectAsset::where('project_id', $projectId)->latest()->get();
    }
}
