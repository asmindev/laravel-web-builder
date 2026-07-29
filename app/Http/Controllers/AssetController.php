<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\AssetService;
use Illuminate\Http\RedirectResponse;
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

    public function store(Request $request, Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,svg,ico,webp,pdf,zip',
        ]);

        $this->assetService->upload($project->id, $validated['file']);

        return redirect()->back();
    }
}
