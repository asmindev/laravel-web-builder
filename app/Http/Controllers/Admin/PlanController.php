<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::orderBy('sort_order')->latest('id')->get();

        return Inertia::render('admin/plans/index', [
            'plans' => $plans,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'price_period' => 'required|string|max:50',
            'project_limit' => 'required|integer|min:1',
            'features' => 'nullable|array',
            'features.*' => 'nullable|string|max:255',
            'is_active' => 'required|boolean',
            'is_popular' => 'required|boolean',
            'sort_order' => 'required|integer',
        ]);

        Plan::create($validated);

        return redirect()->back()->with('success', 'Paket langganan baru berhasil dibuat!');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('plans')->ignore($plan->id)],
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'price_period' => 'required|string|max:50',
            'project_limit' => 'required|integer|min:1',
            'features' => 'nullable|array',
            'features.*' => 'nullable|string|max:255',
            'is_active' => 'required|boolean',
            'is_popular' => 'required|boolean',
            'sort_order' => 'required|integer',
        ]);

        $plan->update($validated);

        return redirect()->back()->with('success', 'Paket langganan berhasil diperbarui!');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        if ($plan->users()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus paket yang sedang digunakan oleh user.');
        }

        $plan->delete();

        return redirect()->back()->with('success', 'Paket langganan berhasil dihapus!');
    }
}
