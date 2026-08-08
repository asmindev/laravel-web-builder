<?php

use App\Http\Controllers\AIController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PublishController;
use App\Http\Controllers\PreviewProxyController;
use Illuminate\Support\Facades\Route;

// Public preview via Node Engine proxy (also serves static files directly)
Route::any('/app/{slug}/{path?}', PreviewProxyController::class)
    ->where('path', '.*')
    ->name('app.preview');

// Public Landing Page
Route::get('/', function () {
    return \Inertia\Inertia::render('welcome');
})->name('home');

Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $projects = \App\Models\Project::where('user_id', $user->id)->get();

        return \Inertia\Inertia::render('dashboard', [
            'stats' => [
                'total_projects' => $projects->count(),
                'published' => $projects->where('published', true)->count(),
                'total_files' => (int) $projects->loadCount('files')->sum('files_count'),
                'total_assets' => (int) $projects->loadCount('assets')->sum('assets_count'),
            ],
        ]);
    })->name('dashboard');

    // Admin Routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('users/{user}/projects', [AdminUserController::class, 'userProjects'])->name('users.projects');
        Route::post('projects/{project}/toggle-suspend', [AdminUserController::class, 'toggleProjectSuspend'])->name('projects.toggle-suspend');
        Route::resource('users', AdminUserController::class);
    });

    // Projects
    Route::resource('projects', ProjectController::class)
        ->parameters(['projects' => 'project:slug']);

    // Files (AJAX)
    Route::prefix('projects/{project:slug}/files')->name('projects.files.')->group(function () {
        Route::get('/', [FileController::class, 'index'])->name('index');
        Route::get('{path}', [FileController::class, 'show'])->name('show')->where('path', '.*');
        Route::post('/', [FileController::class, 'store'])->name('store');
        Route::post('/reorder', [FileController::class, 'reorder'])->name('reorder');
        Route::delete('{path}', [FileController::class, 'destroy'])->name('destroy')->where('path', '.*');
    });

    // Folders
    Route::prefix('projects/{project:slug}/folders')->name('projects.folders.')->group(function () {
        Route::post('/', [FolderController::class, 'store'])->name('store');
        Route::put('{folder}', [FolderController::class, 'update'])->name('update');
        Route::delete('{folder}', [FolderController::class, 'destroy'])->name('destroy');
    });

    // Assets
    Route::prefix('projects/{project:slug}/assets')->name('projects.assets.')->group(function () {
        Route::get('/', [AssetController::class, 'index'])->name('index');
        Route::post('/', [AssetController::class, 'store'])->name('store');
        Route::delete('{asset}', [AssetController::class, 'destroy'])->name('destroy');
    });

    // Publishing
    Route::post('/projects/{project:slug}/publish', [PublishController::class, 'publish'])->name('projects.publish');
    Route::post('/projects/{project:slug}/unpublish', [PublishController::class, 'unpublish'])->name('projects.unpublish');
    Route::get('/projects/{project:slug}/preview', [PublishController::class, 'preview'])->name('projects.preview');

    // Export / Import
    Route::get('/projects/{project:slug}/export-json', [PublishController::class, 'exportJson'])->name('projects.export-json');
    Route::get('/projects/{project:slug}/export-zip', [PublishController::class, 'exportZip'])->name('projects.export-zip');
    Route::post('/projects/import', [PublishController::class, 'import'])->name('projects.import');

    // AI
    Route::post('/ai/enhance-prompt', [AIController::class, 'enhancePrompt'])->name('ai.enhance-prompt');
    Route::post('/ai/generate', [AIController::class, 'generate'])->name('ai.generate');
    Route::post('/ai/improve', [AIController::class, 'improve'])->name('ai.improve');
});
