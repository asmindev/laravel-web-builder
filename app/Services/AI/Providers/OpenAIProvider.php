<?php

namespace App\Services\AI\Providers;

use App\Services\AI\GenerationResult;
use App\Services\AI\ProviderInterface;
use App\Services\AI\SystemInstruction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * OpenAI (GPT-4o-mini) provider for project generation.
 */
final class OpenAIProvider implements ProviderInterface
{
    private const string API_URL = 'https://api.openai.com/v1/chat/completions';

    private const string MODEL = 'gpt-4o-mini';

    private const int TIMEOUT_SECONDS = 120;

    public function __construct(
        private readonly string $apiKey,
    ) {}

    /** {@inheritDoc} */
    public function generate(string $prompt): GenerationResult
    {
        try {
            $systemInstruction = SystemInstruction::forCodeGenerator();

            $response = Http::withToken($this->apiKey)
                ->timeout(self::TIMEOUT_SECONDS)
                ->post(self::API_URL, [
                    'model'    => self::MODEL,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemInstruction],
                        ['role' => 'user',   'content' => $prompt],
                    ],
                    'response_format' => ['type' => 'json_object'],
                ])
                ->throw()
                ->json();

            $text    = $response['choices'][0]['message']['content'] ?? '{}';
            $decoded = json_decode($text, true) ?: [];

            return GenerationResult::fromDecodedJson($decoded, $this->name());
        } catch (\Throwable $e) {
            Log::error('OpenAI generation failed', [
                'error' => $e->getMessage(),
                'model' => self::MODEL,
            ]);
            throw $e;
        }
    }

    /** {@inheritDoc} */
    public function name(): string
    {
        return 'openai';
    }
}
