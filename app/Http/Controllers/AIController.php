<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function __construct(private readonly AIService $aiService) {}

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:5000',
            'provider' => 'nullable|string|in:openai,gemini',
        ]);

        try {
            $result = $this->aiService->generateTemplate(
                $validated['prompt'],
                $validated['provider'] ?? 'openai',
            );

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'AI generation failed. Please try again.',
            ], 500);
        }
    }

    public function improve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'existing_code' => 'required|string',
            'feedback' => 'required|string|max:2000',
            'provider' => 'nullable|string|in:openai,gemini',
        ]);

        try {
            $result = $this->aiService->improveTemplate(
                $validated['existing_code'],
                $validated['feedback'],
                $validated['provider'] ?? 'openai',
            );

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'AI improvement failed. Please try again.',
            ], 500);
        }
    }
}
