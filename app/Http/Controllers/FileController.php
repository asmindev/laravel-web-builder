<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function __construct(private readonly FileService $fileService) {}

    public function index(Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        return response()->json($this->fileService->forProject($project->id));
    }

    public function show(Project $project, string $path): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $file = $this->fileService->find($project->id, $path);

        if (!$file) {
            abort(404);
        }

        return response()->json($file);
    }

    public function store(Request $request, Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'path' => 'required|string|max:500',
            'content' => 'nullable|string',
            'mime_type' => 'nullable|string|max:100',
        ]);

        $this->fileService->upsert(
            $project->id,
            $validated['path'],
            $validated['content'] ?? '',
            $validated['mime_type'] ?? null,
        );

        return redirect()->back();
    }

    public function destroy(Project $project, string $path): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $this->fileService->delete($project->id, $path);

        return redirect()->back();
    }
}
