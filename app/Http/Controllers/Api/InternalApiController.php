<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PublishService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternalApiController extends Controller
{
    public function __construct(private readonly PublishService $publishService) {}

    public function project(string $slug): JsonResponse
    {
        $data = $this->publishService->formatForApi($slug);

        if (!$data) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($data);
    }
}
