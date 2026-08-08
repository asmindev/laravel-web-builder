<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PreviewProxyController extends Controller
{
    public function __invoke(Request $request, string $slug, string $path = '')
    {
        $project = Project::where('slug', $slug)->with('files')->first();
        if (!$project) {
            abort(404, 'Project not found');
        }

        if ($project->is_suspended) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Aplikasi ini telah ditangguhkan karena melanggar Syarat & Ketentuan.'], 403);
            }
            return response()->view('errors.suspended', ['project' => $project], 403);
        }

        if (!$project->published) {
            abort(404, 'Project is not published');
        }

        // Serve static files (CSS, JS, images) langsung dari DB tanpa proxy ke Node Engine
        if (!empty($path)) {
            $file = $project->files->firstWhere('path', $path);
            // Fallback: cari by basename (e.g. /style.css → public/style.css)
            if (!$file) {
                $basename = basename($path);
                $file = $project->files->first(fn ($f) => basename($f->path) === $basename);
            }
            if ($file && $file->content) {
                return response($file->content, 200, [
                    'Content-Type' => $file->mime_type ?? 'text/plain',
                    'Cache-Control' => 'no-store, no-cache, must-revalidate',
                ]);
            }
            // File tidak ditemukan — fallthrough ke proxy (mungkin route Express)
        }

        $engineUrl = config('app.node_engine_url', 'http://127.0.0.1:4000');

        $target = rtrim("$engineUrl/$slug/$path", '/');
        if ($request->query()) {
            $target .= '?' . http_build_query($request->query());
        }

        try {
            // Two-step: preload project data via POST body (avoids 431 header overflow),
            // then dispatch the original request method
            $project->load('files', 'assets');
            Http::timeout(15)->post("$engineUrl/internal/preload", [
                'slug' => $slug,
                'projectData' => $project->toArray(),
            ]);

            $httpRequest = Http::timeout(15);
            
            // Forward raw Cookie header dari browser client (e.g. connect.sid untuk express-session)
            $rawCookieHeader = $_SERVER['HTTP_COOKIE'] ?? $request->server('HTTP_COOKIE') ?? $request->header('Cookie');
            
            // Clean up connect.sid if encrypted by Laravel EncryptCookies middleware in previous requests
            if ($rawCookieHeader && preg_match('/connect\.sid=([^;]+)/', $rawCookieHeader, $matches)) {
                $rawSid = urldecode($matches[1]);
                // If it looks like Laravel encrypted cookie (JSON base64 payload with mac), strip or use plain sid
                if (str_contains($rawSid, '{"iv":') || str_contains($rawSid, 'eyJpdiI')) {
                    // Extract plain sid if possible or clean up cookie string
                }
            }

            if ($rawCookieHeader) {
                $httpRequest = $httpRequest->withHeaders([
                    'Cookie' => $rawCookieHeader,
                ]);
            }

            if ($request->header('Content-Type')) {
                $httpRequest = $httpRequest->withHeaders([
                    'Content-Type' => $request->header('Content-Type'),
                ]);
            }
            
            $bodyContent = $request->getContent();
            if (!empty($bodyContent)) {
                $httpRequest = $httpRequest->withBody($bodyContent, $request->header('Content-Type', 'application/json'));
            }

            $response = $httpRequest->send($request->method(), $target);

            $body = $response->body();
            $contentType = $response->header('Content-Type', 'text/html; charset=utf-8');

            // Rewrite absolute paths di HTML/JS agar request sampe ke Node Engine.
            // /assets/... → /app/slug/assets/..., /api/... → /app/slug/api/...
            // Root-level files: /style.css → /app/slug/style.css
            if (str_contains($contentType, 'text/html')) {
                $prefix = '/app/' . $slug;
                // Direct replacements
                $body = str_replace(
                    ["'/api/", '"/api/', '`/api/'],
                    ["'" . $prefix . '/api/', '"' . $prefix . '/api/', '`' . $prefix . '/api/'],
                    $body
                );
                $body = str_replace(
                    ["'/assets/", '"/assets/', '`/assets/'],
                    ["'" . $prefix . '/assets/', '"' . $prefix . '/assets/', '`' . $prefix . '/assets/'],
                    $body
                );
                $body = str_replace(
                    ["'/public/", '"/public/', '`/public/'],
                    ["'" . $prefix . '/public/', '"' . $prefix . '/public/', '`' . $prefix . '/public/'],
                    $body
                );
            }

            $headers = [
                'Content-Type' => $contentType,
                'Access-Control-Allow-Origin' => '*',
            ];

            $laravelResponse = response($body, $response->status(), $headers);

            // Forward Set-Cookie header dari Node Engine (e.g. connect.sid) ke browser client
            $setCookieHeader = $response->header('Set-Cookie');
            if ($setCookieHeader) {
                // Set raw header Set-Cookie to preserve Express Session ID
                $laravelResponse->headers->set('Set-Cookie', $setCookieHeader, false);
            }

            return $laravelResponse;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('PreviewProxyController error: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            abort(502, 'Engine unavailable: ' . $e->getMessage());
        }
    }
}
