<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\PublishService;
use App\Services\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublishController extends Controller
{
    public function __construct(
        private readonly PublishService $publishService,
        private readonly ExportService $exportService,
    ) {}

    public function publish(Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Project not found.');
        }

        $this->publishService->publish($project);

        return redirect()->back()->with('success', 'Project published!');
    }

    public function unpublish(Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Project not found.');
        }

        $this->publishService->unpublish($project);

        return redirect()->back()->with('success', 'Project unpublished.');
    }

    public function preview(Project $project): Response
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $project->load('files');

        return Inertia::render('projects/preview', [
            'project' => $project,
        ]);
    }

    public function exportJson(Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        return response()->json($this->exportService->exportAsJson($project));
    }

    public function exportZip(Project $project): BinaryFileResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $path = $this->exportService->exportAsZip($project);

        $safeName = \Illuminate\Support\Str::slug($project->name, '_') ?: 'project';
        $timestamp = now()->format('Ymd_His');
        $filename = "{$safeName}_{$project->slug}_{$timestamp}.zip";

        return response()->download($path, $filename)->deleteFileAfterSend();
    }

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'json' => 'required|file|max:2048|mimes:json',
        ]);

        $data = json_decode(file_get_contents($validated['json']->getRealPath()), true);

        if (!is_array($data)) {
            return redirect()->back()->with('error', 'Invalid JSON file.');
        }

        $project = $this->exportService->importFromJson($data, auth()->id());

        return redirect()->route('projects.show', $project->slug)
            ->with('success', 'Project imported!');
    }
}
