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

    public function create(): Response
    {
        return Inertia::render('projects/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'template' => 'nullable|string|max:100',
        ]);

        $project = $this->projectService->create($validated, auth()->id());

        return redirect()->route('projects.show', $project->slug)
            ->with('success', 'Project created successfully.');
    }

    public function show(Project $project): Response|RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            return redirect()->route('projects.index')->with('error', 'Project not found.');
        }

        $project->load('files', 'assets');

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
}
