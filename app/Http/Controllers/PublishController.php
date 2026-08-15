<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ExportService;
use App\Services\PublishService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
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

    public function preview(Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        if ($project->is_suspended) {
            return response()->view('errors.suspended', ['project' => $project], 403);
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
        $timestamp = now()->format('YmdHis');
        $filename = "{$safeName}_{$timestamp}.zip";

        return response()->download($path, $filename)->deleteFileAfterSend();
    }

    public function exportDb(Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $project->loadMissing(['files', 'assets']);
        $sqliteDbPath = base_path("node-engine/storage/{$project->slug}.db");
        $converter = app(\App\Services\SQLiteToMySQLConverter::class);
        $mysqlDumpSql = $converter->convertToMySQLDump($sqliteDbPath, $project);

        $safeName = \Illuminate\Support\Str::slug($project->name, '_') ?: 'database';
        $timestamp = now()->format('YmdHis');
        $filename = "{$safeName}_database_{$timestamp}.sql";

        return response($mysqlDumpSql, 200, [
            'Content-Type' => 'application/sql',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function exportFile(Project $project, Request $request)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $type = $request->query('type', 'nodejs');
        $project->load('files');
        $safeName = \Illuminate\Support\Str::slug($project->name, '_') ?: 'project';

        if ($type === 'nodejs') {
            $file = $project->files->first(fn ($f) => in_array(basename($f->path), ['index.js', 'server.js', 'app.js', 'main.js']));
            if (! $file) {
                $file = $project->files->first(fn ($f) => str_ends_with($f->path, '.js'));
            }
            $ext = $file ? pathinfo($file->path, PATHINFO_EXTENSION) : 'js';
            $filename = "{$safeName}_index.{$ext}";
            $content = $file ? $file->content : "// File Node.js tidak ditemukan\n";

            return response($content, 200, [
                'Content-Type' => 'text/plain',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]);
        } else {
            $file = $project->files->first(fn ($f) => in_array(basename($f->path), ['index.ejs', 'index.html', 'home.ejs', 'index.hbs']));
            if (! $file) {
                $file = $project->files->first(fn ($f) => str_ends_with($f->path, '.ejs') || str_ends_with($f->path, '.html'));
            }
            $ext = $file ? pathinfo($file->path, PATHINFO_EXTENSION) : 'html';
            $filename = "{$safeName}_index.{$ext}";
            $content = $file ? $file->content : "<!-- File Index tidak ditemukan -->\n";
            $mime = $ext === 'ejs' ? 'text/plain' : 'text/html';

            return response($content, 200, [
                'Content-Type' => $mime,
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]);
        }
    }

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'json' => 'required|file|max:2048|mimes:json',
        ]);

        $data = json_decode(file_get_contents($validated['json']->getRealPath()), true);

        if (! is_array($data)) {
            return redirect()->back()->with('error', 'Invalid JSON file.');
        }

        $project = $this->exportService->importFromJson($data, auth()->id());

        return redirect()->route('projects.show', $project->slug)
            ->with('success', 'Project imported!');
    }
}
