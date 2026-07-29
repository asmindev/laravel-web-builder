<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\AssetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function __construct(private readonly AssetService $assetService) {}

    public function index(Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        return response()->json($this->assetService->forProject($project->id));
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,svg,ico,webp,pdf,zip',
        ]);

        $asset = $this->assetService->upload($project->id, $validated['file']);

        return response()->json($asset, 201);
    }

    public function destroy(Project $project, string $assetId): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $asset = $project->assets()->findOrFail($assetId);
        $this->assetService->delete($asset);

        return response()->json(['message' => 'Asset deleted.']);
    }
}
