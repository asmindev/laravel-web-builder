<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function __construct(private readonly AIService $aiService) {}

    public function enhancePrompt(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'app_description' => 'required|string|max:2000',
            'app_type' => 'nullable|string|in:nodejs,landing',
        ]);

        $enhancedPrompt = $this->aiService->enhancePrompt(
            $validated['app_name'],
            $validated['app_description'],
            $validated['app_type'] ?? 'nodejs'
        );

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('enhanced_prompt', $enhancedPrompt);
        }

        return response()->json([
            'enhanced_prompt' => $enhancedPrompt,
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:10000',
            'provider' => 'nullable|string|in:openai,gemini',
        ]);

        try {
            $result = $this->aiService->generateTemplate(
                $validated['prompt'],
                $validated['provider'] ?? 'gemini',
            );

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'AI generation failed: ' . $e->getMessage(),
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
                $validated['provider'] ?? 'gemini',
            );

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'AI improvement failed. Please try again.',
            ], 500);
        }
    }
}
