<?php

namespace App\Services\AI\Providers;

use App\Services\AI\GenerationResult;
use App\Services\AI\ProviderInterface;
use App\Services\AI\SystemInstruction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Gemini 2.0 Flash AI provider for project generation.
 */
final class GeminiProvider implements ProviderInterface
{
    private const string API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

    private const string MODEL = 'gemini-flash-latest';

    private const int TIMEOUT_SECONDS = 120;

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

            $systemInstruction = SystemInstruction::forCodeGenerator();

            $response = Http::withHeaders(['x-goog-api-key' => $this->apiKey])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post($url, [
                    'contents' => [
                        [
                            'role'  => 'user',
                            'parts' => [['text' => $systemInstruction . "\n\n" . $prompt]],
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
