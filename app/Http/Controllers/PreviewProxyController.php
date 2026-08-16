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
            Http::timeout(30)->post("$engineUrl/internal/preload", [
                'slug' => $slug,
                'projectData' => $project->toArray(),
            ]);

            $httpRequest = Http::timeout(30)->withoutRedirecting();
            
            $rawCookieHeader = $_SERVER['HTTP_COOKIE'] ?? $request->server('HTTP_COOKIE') ?? $request->header('Cookie');
            
            $headersToForward = [
                'Authorization' => $request->header('Authorization'),
                'Accept' => $request->header('Accept'),
                'Content-Type' => $request->header('Content-Type'),
                'X-Requested-With' => $request->header('X-Requested-With'),
            ];

            if ($rawCookieHeader) {
                $headersToForward['Cookie'] = $rawCookieHeader;
            }

            $headersToForward = array_filter($headersToForward);
            if (!empty($headersToForward)) {
                $httpRequest = $httpRequest->withHeaders($headersToForward);
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
            if (str_contains($contentType, 'text/html')) {
                $prefix = '/app/' . $slug;

                // 1. Direct replacements for static and template strings
                $body = str_replace(
                    ["'/api", '"/api', '`/api', "'/assets", '"/assets', '`/assets', "'/public", '"/public', '`/public'],
                    ["'" . $prefix . '/api', '"' . $prefix . '/api', '`' . $prefix . '/api', "'" . $prefix . '/assets', '"' . $prefix . '/assets', '`' . $prefix . '/assets', "'" . $prefix . '/public', '"' . $prefix . '/public', '`' . $prefix . '/public'],
                    $body
                );

                // 2. Client-side Fetch & XHR Interceptor injection
                $interceptorScript = <<<HTML
<script id="__preview_proxy_interceptor__">
(function() {
    const slugPrefix = '{$prefix}';
    const shouldPrefix = (url) => {
        if (!url || typeof url !== 'string') return false;
        return url.startsWith('/api') || url.startsWith('/assets') || url.startsWith('/public') ||
               url.startsWith('/auth') || url.startsWith('/login') || url.startsWith('/logout');
    };

    const _fetch = window.fetch;
    window.fetch = function(resource, init) {
        if (typeof resource === 'string') {
            if (shouldPrefix(resource)) {
                resource = slugPrefix + resource;
            }
        } else if (resource && resource.url) {
            try {
                const u = new URL(resource.url, window.location.origin);
                if (u.origin === window.location.origin && shouldPrefix(u.pathname)) {
                    resource = new Request(slugPrefix + u.pathname + u.search, resource);
                }
            } catch(e) {}
        }
        return _fetch.call(this, resource, init);
    };

    const _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof url === 'string' && shouldPrefix(url)) {
            url = slugPrefix + url;
        }
        return _open.call(this, method, url, ...rest);
    };
})();
</script>
HTML;

                if (str_contains($body, '<head>')) {
                    $body = str_replace('<head>', "<head>\n" . $interceptorScript, $body);
                } elseif (str_contains($body, '<html>')) {
                    $body = str_replace('<html>', "<html>\n" . $interceptorScript, $body);
                } else {
                    $body = $interceptorScript . "\n" . $body;
                }
            }

            $headers = [
                'Content-Type' => $contentType,
                'Access-Control-Allow-Origin' => '*',
            ];

            $laravelResponse = response($body, $response->status(), $headers);

            // Rewrite redirect Location headers (e.g. /login → /app/10/login)
            $locationHeader = $response->header('Location');
            if ($locationHeader) {
                if (str_starts_with($locationHeader, '/')) {
                    $locationHeader = '/app/' . $slug . $locationHeader;
                } else {
                    $locationHeader = preg_replace('#^https?://[^/]+(?:/[^/]+)?(/.*)?$#', '/app/' . $slug . '$1', $locationHeader);
                }
                $laravelResponse->headers->set('Location', $locationHeader);
            }

            // Forward Set-Cookie header dari Node Engine (e.g. connect.sid) ke browser client
            $setCookieHeader = $response->header('Set-Cookie');
            if ($setCookieHeader) {
                // Set raw header Set-Cookie to preserve Express Session ID
                $laravelResponse->headers->set('Set-Cookie', $setCookieHeader, false);
            }

            return $laravelResponse;
        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            \Illuminate\Support\Facades\Log::error('PreviewProxyController error: ' . $msg, [
                'exception' => $e,
            ]);

            // Distinguish between "engine is down" and "engine crashed mid-response (EOF)"
            $isEof     = str_contains($msg, 'EOF') || str_contains($msg, 'stream reading') || str_contains($msg, 'ECONNRESET');
            $isDown    = str_contains($msg, 'Connection refused') || str_contains($msg, 'cURL error 7') || str_contains($msg, 'Could not connect');

            if ($isEof) {
                abort(502, 'Engine closed the connection unexpectedly. The app may have crashed during initialization. Please retry — it usually works on the second request once the DB is seeded.');
            } elseif ($isDown) {
                abort(502, 'Node Engine is not running. Start it with: cd node-engine && npm run dev');
            }

            abort(502, 'Engine unavailable: ' . $msg);
        }
    }
}
