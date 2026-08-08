<?php

namespace App\Services;

use App\Services\AI\ProviderInterface;
use App\Services\AI\Providers\GeminiProvider;
use App\Services\AI\Providers\OpenAIProvider;
use App\Services\AI\PromptEnhancer;
use App\Services\AI\GenerationResult;
use Illuminate\Support\Facades\Log;

class AIService
{
    /**
     * Registered AI provider instances, keyed by provider name.
     *
     * @var array<string, ProviderInterface>
     */
    private array $providers = [];

    private readonly PromptEnhancer $promptEnhancer;

    public function __construct()
    {
        $this->promptEnhancer = new PromptEnhancer();
        $this->registerDefaultProviders();
    }

    /**
     * Enhance a basic app description into a detailed master prompt
     * using the Gemini API (or fallback if unavailable).
     */
    public function enhancePrompt(string $appName, string $appDescription, string $appType = 'nodejs'): string
    {
        return $this->promptEnhancer->enhance($appName, $appDescription, $appType);
    }

    /**
     * Generate a project template from a prompt using the specified AI provider.
     *
     * @return array{files: array<string, string>, config: array<string, string>, provider: string}
     */
    public function generateTemplate(array|string $prompt, string $provider = 'gemini'): array
    {
        $promptString = is_array($prompt) ? json_encode($prompt) : $prompt;

        return $this->resolveProvider($provider)->generate($promptString)->toArray();
    }

    /**
     * Improve an existing template based on user feedback.
     *
     * @return array{files: array<string, string>, config: array<string, string>, provider: string}
     */
    public function improveTemplate(string $existingCode, string $feedback, string $provider = 'gemini'): array
    {
        $improvementPrompt = implode("\n", [
            'Instruction: Improve this template',
            'Existing Code:',
            $existingCode,
            'Feedback:',
            $feedback,
        ]);

        return $this->resolveProvider($provider)->generate($improvementPrompt)->toArray();
    }

    /**
     * Register a custom AI provider at runtime.
     */
    public function registerProvider(string $name, ProviderInterface $provider): void
    {
        $this->providers[$name] = $provider;
    }

    /**
     * Resolve a provider instance by name.
     *
     * @throws \InvalidArgumentException If the provider is not registered.
     */
    private function resolveProvider(string $name): ProviderInterface
    {
        if (!isset($this->providers[$name])) {
            throw new \InvalidArgumentException("Unsupported AI provider: {$name}");
        }

        return $this->providers[$name];
    }

    /**
     * Register the built-in AI providers (Gemini & OpenAI).
     */
    private function registerDefaultProviders(): void
    {
        $this->providers['gemini'] = new GeminiProvider(
            apiKey: (string) config('services.gemini.key'),
        );

        $this->providers['openai'] = new OpenAIProvider(
            apiKey: (string) config('services.openai.key'),
        );
    }
}
