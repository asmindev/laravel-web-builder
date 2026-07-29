<?php

use App\Http\Controllers\Api\InternalApiController;
use Illuminate\Support\Facades\Route;

// Internal API for Node Engine (protected by shared secret)
Route::middleware('internal-api')->prefix('internal')->group(function () {
    Route::get('/projects/{slug}', [InternalApiController::class, 'project']);
});
