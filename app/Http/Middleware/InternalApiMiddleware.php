<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InternalApiMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-Internal-Api-Key');

        if (!$key || $key !== config('app.internal_api_secret')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
