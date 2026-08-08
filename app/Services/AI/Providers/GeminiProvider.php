<?php

namespace App\Services\AI\Providers;

use App\Services\AI\GenerationResult;
use App\Services\AI\ProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Gemini 2.0 Flash AI provider for project generation.
 */
final class GeminiProvider implements ProviderInterface
{
    // https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent
    private const string API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

    private const string MODEL = 'gemini-flash-latest';

    private const int TIMEOUT_SECONDS = 120;

    private const string SYSTEM_INSTRUCTION = <<<'PROMPT'
You are a senior fullstack web developer generating ready-to-run Node.js/HTML/EJS project templates. Return ONLY valid JSON with "files" as an object of {filename: content} and "config" as an object with title/description.
PROMPT;

    public function __construct(
        private readonly string $apiKey,
    ) {}

    /** {@inheritDoc} */
    public function generate(string $prompt): GenerationResult
    {
        try {
            $url = sprintf(
                '%s/%s:generateContent',
                self::API_BASE_URL,
                self::MODEL
            );

            $response = Http::withHeaders(['x-goog-api-key' => $this->apiKey])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post($url, [
                    'contents' => [
                        [
                            'role'  => 'user',
                            'parts' => [['text' => self::SYSTEM_INSTRUCTION . "\n\n" . $prompt]],
                        ],
                    ],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                    ],
                ])
                ->throw()
                ->json();

            $text    = $response['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            $decoded = json_decode($text, true) ?: [];

            return GenerationResult::fromDecodedJson($decoded, $this->name());
        } catch (\Throwable $e) {
            Log::error('Gemini generation failed', [
                'error' => $e->getMessage(),
                'model' => self::MODEL,
            ]);
            throw $e;
        }
    }

    /** {@inheritDoc} */
    public function name(): string
    {
        return 'gemini';
    }
}
