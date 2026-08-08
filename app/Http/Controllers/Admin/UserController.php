<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $planFilter = $request->input('plan');

        $query = User::with('roles')->withCount('projects');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            $query->whereHas('roles', function ($q) use ($roleFilter) {
                $q->where('name', $roleFilter);
            });
        }

        if ($planFilter && $planFilter !== 'all') {
            $query->where('plan', $planFilter);
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        // Transform users to include role name and project limit info
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'plan' => $user->plan ?? 'starter',
                'plan_name' => $user->plan_name,
                'project_limit' => $user->project_limit === 999999 ? 'Unlimited' : $user->project_limit,
                'projects_count' => $user->projects_count,
                'roles' => $user->getRoleNames(),
                'created_at' => $user->created_at?->format('d M Y H:i'),
            ];
        });

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $roleFilter ?? 'all',
                'plan' => $planFilter ?? 'all',
            ],
            'roles' => Role::pluck('name')->toArray(),
            'plans' => ['starter', 'basic', 'pro', 'business'],
        ]);
    }

    public function userProjects(User $user): Response
    {
        $projects = $user->projects()
            ->withCount(['files', 'assets'])
            ->latest()
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'description' => $project->description,
                    'published' => $project->published,
                    'is_suspended' => (bool) $project->is_suspended,
                    'suspension_reason' => $project->suspension_reason,
                    'suspended_at' => $project->suspended_at?->format('d M Y H:i'),
                    'template' => $project->template,
                    'files_count' => $project->files_count,
                    'assets_count' => $project->assets_count,
                    'created_at' => $project->created_at?->format('d M Y H:i'),
                    'updated_at' => $project->updated_at?->format('d M Y H:i'),
                ];
            });

        return Inertia::render('admin/users/projects', [
            'targetUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'plan' => $user->plan ?? 'starter',
                'plan_name' => $user->plan_name,
                'project_limit' => $user->project_limit === 999999 ? 'Unlimited' : $user->project_limit,
                'roles' => $user->getRoleNames(),
            ],
            'userProjects' => $projects,
        ]);
    }

    public function toggleProjectSuspend(Request $request, \App\Models\Project $project): RedirectResponse
    {
        if ($project->is_suspended) {
            $project->update([
                'is_suspended' => false,
                'suspension_reason' => null,
                'suspended_at' => null,
            ]);
            return redirect()->back()->with('success', 'Penangguhan proyek telah dicabut.');
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $project->update([
            'is_suspended' => true,
            'suspension_reason' => $request->input('reason', 'Terindikasi melanggar Syarat & Ketentuan Layanan.'),
            'suspended_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Proyek berhasil ditangguhkan karena pelanggaran.');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'plan' => 'required|string|in:starter,basic,pro,business',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'plan' => $validated['plan'],
        ]);

        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'User berhasil ditambahkan!');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'plan' => 'required|string|in:starter,basic,pro,business',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'plan' => $validated['plan'],
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = bcrypt($validated['password']);
        }

        $user->update($userData);
        $user->syncRoles([$validated['role']]);

        return redirect()->back()->with('success', 'Data user dan paket berhasil diperbarui!');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User berhasil dihapus!');
    }
}
