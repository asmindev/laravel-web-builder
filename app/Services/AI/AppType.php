<?php

namespace App\Services\AI;

/**
 * Enum of supported application types for prompt enhancement.
 */
enum AppType: string
{
    case NodeJs  = 'nodejs';
    case Landing = 'landing';
}
