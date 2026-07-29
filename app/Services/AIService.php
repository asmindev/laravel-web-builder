<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    public function generateTemplate(array $prompt, string $provider = 'openai'): array
    {
        return match ($provider) {
            'openai' => $this->viaOpenAI($prompt),
            'gemini' => $this->viaGemini($prompt),
            default => throw new \InvalidArgumentException("Unsupported AI provider: {$provider}"),
        };
    }

    public function improveTemplate(string $existingCode, string $feedback, string $provider = 'openai'): array
    {
        return match ($provider) {
            'openai' => $this->viaOpenAI([
                'instruction' => 'Improve this template',
                'existing_code' => $existingCode,
                'feedback' => $feedback,
            ]),
            'gemini' => $this->viaGemini([
                'instruction' => 'Improve this template',
                'existing_code' => $existingCode,
                'feedback' => $feedback,
            ]),
            default => throw new \InvalidArgumentException("Unsupported AI provider: {$provider}"),
        };
    }

    private function viaOpenAI(array $prompt): array
    {
        $system = 'You are a web developer generating EJS templates. Return ONLY valid JSON with "files" as an object of {filename: content} and "config" as an object with title/description.';

        try {
            $response = Http::withToken(config('services.openai.key'))
                ->timeout(60)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => json_encode($prompt)],
                    ],
                    'response_format' => ['type' => 'json_object'],
                ])->throw()->json();

            $content = json_decode($response['choices'][0]['message']['content'] ?? '{}', true);

            return [
                'files' => $content['files'] ?? [],
                'config' => $content['config'] ?? ['title' => 'New Project'],
                'provider' => 'openai',
            ];
        } catch (\Throwable $e) {
            Log::error('OpenAI generation failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    private function viaGemini(array $prompt): array
    {
        $system = 'You are a web developer generating EJS templates. Return ONLY valid JSON with "files" as an object of {filename: content} and "config" as an object with title/description.';

        try {
            $response = Http::withToken(config('services.gemini.key'))
                ->timeout(60)
                ->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', [
                    'contents' => [
                        ['role' => 'user', 'parts' => [['text' => $system . "\n\n" . json_encode($prompt)]]],
                    ],
                    'generationConfig' => ['responseMimeType' => 'application/json'],
                ])->throw()->json();

            $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            $content = json_decode($text, true);

            return [
                'files' => $content['files'] ?? [],
                'config' => $content['config'] ?? ['title' => 'New Project'],
                'provider' => 'gemini',
            ];
        } catch (\Throwable $e) {
            Log::error('Gemini generation failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
