<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => fn() => [
                'type' => session()->has('error')
                    ? 'error'
                    : (session()->has('success') ? 'success' : 'message'),
                'content' => session()->get('error')
                    ?? session()->get('success')
                    ?? session()->get('message'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'plan' => $user->plan ?? 'starter',
                    'plan_name' => $user->plan_name,
                    'project_limit' => $user->project_limit === 999999 ? 'Unlimited' : $user->project_limit,
                    'raw_limit' => $user->project_limit,
                    'projects_count' => $user->projects()->count(),
                    'can_create_project' => $user->canCreateProject(),
                    'is_admin' => $user->hasRole('admin'),
                    'roles' => $user->getRoleNames(),
                ] : null,
            ],
            'enhanced_prompt' => fn() => session()->get('enhanced_prompt'),
            'projects' => fn() => $user
                ? \App\Models\Project::where('user_id', $user->id)
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'name', 'slug', 'published'])
                : [],
        ];
    }
}
