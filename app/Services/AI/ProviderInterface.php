<?php

namespace App\Services\AI;

/**
 * Contract for all AI generation providers.
 *
 * Each provider must accept a prompt string and return a GenerationResult DTO.
 */
interface ProviderInterface
{
    /**
     * Generate project files from the given prompt.
     *
     * @param string $prompt   The master prompt describing what to build.
     * @param string $appType  Either 'nodejs' or 'landing' — determines the system instruction used.
     *
     * @throws \Throwable If the API call or response parsing fails.
     */
    public function generate(string $prompt, string $appType = 'nodejs'): GenerationResult;

    /**
     * Return the unique name of this provider (e.g. 'gemini', 'openai').
     */
    public function name(): string;
}
