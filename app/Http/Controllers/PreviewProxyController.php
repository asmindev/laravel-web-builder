<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PreviewProxyController extends Controller
{
    public function __invoke(Request $request, string $slug, string $path = '')
    {
        $project = Project::where('slug', $slug)->published()->with('files')->first();
        if (!$project) {
            abort(404, 'Project not found');
        }

        // Serve static files (CSS, JS, images) langsung dari DB tanpa proxy ke Node Engine
        if (!empty($path)) {
            $file = $project->files->firstWhere('path', $path);
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
            $response = Http::timeout(15)->withHeaders([
                'X-Project-Data' => base64_encode($project->toJson()),
            ])->send($request->method(), $target);

            $body = $response->body();
            $contentType = $response->header('Content-Type', 'text/html; charset=utf-8');

            // Rewrite absolute paths di HTML/JS agar request sampe ke Node Engine.
            // /assets/... → /app/slug/assets/..., /api/... → /app/slug/api/...
            if (str_contains($contentType, 'text/html')) {
                $prefix = '/app/' . $slug;
                $body = preg_replace(
                    '#(?:(["\']))(/(?:assets|public|api)/)#i',
                    '$1' . $prefix . '$2',
                    $body
                );
            }

            $headers = ['Content-Type' => $contentType];
            $headers['Access-Control-Allow-Origin'] = '*';

            return response($body, $response->status(), $headers);
        } catch (\Exception $e) {
            abort(502, 'Engine unavailable');
        }
    }
}
