<?php

namespace App\Services;

use App\Models\ProjectFile;
use App\Models\ProjectFolder;

class FolderService
{
    public function create(int $projectId, string $name): ProjectFolder
    {
        return ProjectFolder::create([
            'project_id' => $projectId,
            'name' => $name,
        ]);
    }

    public function rename(int $projectId, int $folderId, string $newName): ProjectFolder
    {
        $folder = ProjectFolder::where('project_id', $projectId)->findOrFail($folderId);
        $oldName = $folder->name;

        $folder->update(['name' => $newName]);

        // Update file paths that start with the old folder name
        ProjectFile::where('project_id', $projectId)
            ->where('path', 'LIKE', $oldName . '/%')
            ->get()
            ->each(function (ProjectFile $file) use ($oldName, $newName) {
                $newPath = preg_replace('/^' . preg_quote($oldName, '/') . '\//', $newName . '/', $file->path, 1);
                if ($newPath !== $file->path) {
                    $file->update(['path' => $newPath]);
                }
            });

        return $folder->fresh();
    }

    public function delete(int $projectId, int $folderId): void
    {
        $folder = ProjectFolder::where('project_id', $projectId)->findOrFail($folderId);
        $prefix = $folder->name . '/';

        // Delete all files in this folder
        ProjectFile::where('project_id', $projectId)
            ->where('path', 'LIKE', $prefix . '%')
            ->delete();

        $folder->delete();
    }

    public function forProject(int $projectId)
    {
        return ProjectFolder::where('project_id', $projectId)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }
}
