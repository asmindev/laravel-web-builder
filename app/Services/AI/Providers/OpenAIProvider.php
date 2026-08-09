<?php

namespace App\Services\AI\Providers;

use App\Services\AI\GenerationResult;
use App\Services\AI\ProviderInterface;
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

    private const string SYSTEM_INSTRUCTION = <<<'PROMPT'
You are a senior fullstack web developer generating ready-to-run Node.js/HTML/EJS project templates. EVERY generated Node.js application MUST include a Login page, session auth, and automatically seed a default admin user into DB: username/email: "admin", password: "admin123", role: "admin". Show default login credentials (admin | admin123) clearly in the UI login view. Return ONLY valid JSON with "files" as an object of {filename: content} and "config" as an object with title/description.
PROMPT;

    public function __construct(
        private readonly string $apiKey,
    ) {}

    /** {@inheritDoc} */
    public function generate(string $prompt): GenerationResult
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(self::TIMEOUT_SECONDS)
                ->post(self::API_URL, [
                    'model'    => self::MODEL,
                    'messages' => [
                        ['role' => 'system', 'content' => self::SYSTEM_INSTRUCTION],
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
