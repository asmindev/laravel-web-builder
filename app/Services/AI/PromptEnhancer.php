<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Responsible for transforming simple app descriptions into
 * detailed, structured "Master Prompts" via the Gemini API.
 */
final class PromptEnhancer
{
    private const string API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

    private const string MODEL = 'gemini-flash-latest';

    private const int TIMEOUT_SECONDS = 60;

    /**
     * Enhance a basic app request into a detailed master prompt.
     *
     * For landing pages, returns a pre-built template prompt.
     * For Node.js apps, uses Gemini to generate a comprehensive master prompt.
     */
    public function enhance(string $appName, string $appDescription, string $appType = 'nodejs'): string
    {
        $type = AppType::tryFrom($appType) ?? AppType::NodeJs;

        if ($type === AppType::Landing) {
            return $this->buildLandingPrompt($appName, $appDescription);
        }

        return $this->enhanceViaGemini($appName, $appDescription);
    }

    /**
     * Build a static prompt for landing page generation.
     */
    private function buildLandingPrompt(string $appName, string $appDescription): string
    {
        return <<<PROMPT
Buatkan landing page HTML modern, responsif, dan interaktif untuk "{$appName}".
Deskripsi Tambahan: "{$appDescription}".

Wajib ikuti aturan berikut:
1. Buat file `index.html` dengan Tailwind CSS CDN v3 dan FontAwesome v6.
2. Sediakan Hero Section, Feature Cards, About Us, Testimonials, dan Contact Form.
3. Tambahkan efek animasi smooth scroll dan interactive state JavaScript.
PROMPT;
    }

    /**
     * Call Gemini to generate an enhanced master prompt for a fullstack Node.js app.
     * Falls back to a static template if the API key is missing or the request fails.
     */
    private function enhanceViaGemini(string $appName, string $appDescription): string
    {
        $apiKey = (string) config('services.gemini.key');

        if ($apiKey === '') {
            return SystemInstruction::forFallbackPrompt($appName, $appDescription);
        }

        try {
            $url = sprintf(
                '%s/%s:generateContent',
                self::API_BASE_URL,
                self::MODEL
            );

            $response = Http::withHeaders(['x-goog-api-key' => $apiKey])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post($url, [
                    'contents' => [
                        [
                            'role'  => 'user',
                            'parts' => [['text' => SystemInstruction::forPromptEnhancer($appName, $appDescription)]],
                        ],
                    ],
                ])
                ->throw()
                ->json();

            $output = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

            return $output !== '' ? $output : SystemInstruction::forFallbackPrompt($appName, $appDescription);
        } catch (\Throwable $e) {
            Log::error('Gemini prompt enhancement failed', [
                'error'    => $e->getMessage(),
                'app_name' => $appName,
            ]);

            return SystemInstruction::forFallbackPrompt($appName, $appDescription);
        }
    }
}
