<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projectService) {}

    public function index(): Response
    {
        $projects = $this->projectService->forUser(auth()->id());

        return Inertia::render('projects/index', [
            'projects' => $projects,
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('projects.index', ['create' => 'true']);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if (!$user->canCreateProject()) {
            return redirect()->back()->with('error', "Batas maksimal proyek untuk paket {$user->plan_name} ({$user->project_limit} proyek) telah tercapai. Silakan upgrade paket Anda.");
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'template' => 'nullable|string|max:100',
        ]);

        $project = $this->projectService->create($validated, $user->id);

        return redirect()->route('projects.show', $project->slug)
            ->with('success', 'Project created successfully.');
    }

    public function show(Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            return redirect()->route('projects.index')->with('error', 'Project not found.');
        }

        if ($project->is_suspended) {
            return response()->view('errors.suspended', ['project' => $project], 403);
        }

        $project->load('files', 'assets', 'folders');

        return Inertia::render('projects/show', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            return redirect()->route('projects.index')->with('error', 'Project not found.');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'config' => 'nullable|json',
        ]);

        if (isset($validated['config'])) {
            $validated['config'] = json_decode($validated['config'], true);
        }

        $this->projectService->update($project, $validated);

        return redirect()->back()->with('success', 'Project updated.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            return redirect()->route('projects.index')->with('error', 'Project not found.');
        }

        $this->projectService->delete($project);

        return redirect()->route('projects.index')->with('success', 'Project deleted.');
    }

    public function resetDatabase(Project $project): \Illuminate\Http\JsonResponse
    {
        if ($project->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $engineUrl = config('app.node_engine_url', 'http://127.0.0.1:4000');
        $secret = config('app.internal_api_secret');

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->withHeaders([
                    'X-Internal-Api-Key' => $secret,
                ])
                ->post("$engineUrl/internal/reset-db", [
                    'slug' => $project->slug,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'success' => true,
                    'message' => $data['message'] ?? 'Database berhasil dikosongkan! Seluruh data demo telah dibersihkan dan akun admin tetap aktif.',
                ]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Reset DB error: " . $e->getMessage());
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mengosongkan database. Pastikan node engine sedang berjalan.',
        ], 500);
    }
}
