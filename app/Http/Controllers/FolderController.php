<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\FolderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function __construct(private readonly FolderService $folderService) {}

    public function store(Request $request, Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $this->folderService->create($project->id, $validated['name']);

        return redirect()->back();
    }

    public function update(Request $request, Project $project, int $folder): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $this->folderService->rename($project->id, $folder, $validated['name']);

        return redirect()->back();
    }

    public function destroy(Project $project, int $folder): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $this->folderService->delete($project->id, $folder);

        return redirect()->back();
    }
}
