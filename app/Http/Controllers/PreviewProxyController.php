<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PreviewProxyController extends Controller
{
    public function __invoke(Request $request, string $slug, string $path = '')
    {
        $engineUrl = config('app.node_engine_url', 'http://127.0.0.1:4000');

        $project = Project::where('slug', $slug)->published()->with('files')->first();
        if (!$project) {
            abort(404, 'Project not found');
        }

        $target = rtrim("$engineUrl/$slug/$path", '/');
        if ($request->query()) {
            $target .= '?' . http_build_query($request->query());
        }

        try {
            $response = Http::timeout(15)->withHeaders([
                'X-Project-Data' => base64_encode($project->toJson()),
            ])->send($request->method(), $target);

            return response()->stream(function () use ($response) {
                echo $response->body();
            }, $response->status(), ['Content-Type' => 'text/html; charset=utf-8']);
        } catch (\Exception $e) {
            abort(502, 'Engine unavailable');
        }
    }
}
