<?php

namespace App\Services\AI;

/**
 * Immutable Data Transfer Object representing the result of an AI generation.
 */
final readonly class GenerationResult
{
    /**
     * @param array<string, string> $files    Map of filename => content.
     * @param array<string, string> $config   Project metadata (title, description, etc.).
     * @param string                $provider The provider name that produced this result.
     */
    public function __construct(
        public array  $files,
        public array  $config,
        public string $provider,
    ) {}

    /**
     * Create a GenerationResult from raw decoded JSON content.
     *
     * @param array<string, mixed> $decoded  Raw decoded JSON from the AI response.
     * @param string               $provider The provider name.
     */
    public static function fromDecodedJson(array $decoded, string $provider): self
    {
        return new self(
            files:    $decoded['files']  ?? [],
            config:   $decoded['config'] ?? ['title' => 'New Project'],
            provider: $provider,
        );
    }

    /**
     * Convert to the legacy array format expected by existing controllers.
     *
     * @return array{files: array<string, string>, config: array<string, string>, provider: string}
     */
    public function toArray(): array
    {
        return [
            'files'    => $this->files,
            'config'   => $this->config,
            'provider' => $this->provider,
        ];
    }
}
