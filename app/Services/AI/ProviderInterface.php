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
     * @throws \Throwable If the API call or response parsing fails.
     */
    public function generate(string $prompt): GenerationResult;

    /**
     * Return the unique name of this provider (e.g. 'gemini', 'openai').
     */
    public function name(): string;
}
