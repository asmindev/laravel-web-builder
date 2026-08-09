<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings/index', [
            'settings' => Setting::getLandingContent(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'admin_whatsapp' => 'required|string|max:50',
            
            // Hero
            'hero_badge' => 'nullable|string|max:255',
            'hero_title_1' => 'nullable|string|max:255',
            'hero_title_2' => 'nullable|string|max:255',
            'hero_title_highlight' => 'nullable|string|max:255',
            'hero_subtitle' => 'nullable|string|max:1000',
            'hero_prompt_demo' => 'nullable|string|max:1000',

            // Fitur
            'fitur_section_tag' => 'nullable|string|max:255',
            'fitur_title' => 'nullable|string|max:255',
            'fitur_subtitle' => 'nullable|string|max:1000',
            'fitur_items' => 'nullable|array',
            'fitur_items.*.tag' => 'nullable|string|max:255',
            'fitur_items.*.title' => 'nullable|string|max:255',
            'fitur_items.*.description' => 'nullable|string|max:1000',

            // Cara Kerja
            'cara_kerja_tag' => 'nullable|string|max:255',
            'cara_kerja_title' => 'nullable|string|max:255',
            'cara_kerja_subtitle' => 'nullable|string|max:1000',
            'cara_kerja_steps' => 'nullable|array',
            'cara_kerja_steps.*.step' => 'nullable|string|max:10',
            'cara_kerja_steps.*.title' => 'nullable|string|max:255',
            'cara_kerja_steps.*.description' => 'nullable|string|max:1000',

            // Jasa Agensi
            'agency_badge' => 'nullable|string|max:255',
            'agency_title' => 'nullable|string|max:255',
            'agency_description' => 'nullable|string|max:2000',

            // Terms
            'terms_tag' => 'nullable|string|max:255',
            'terms_title' => 'nullable|string|max:255',
            'terms_subtitle' => 'nullable|string|max:1000',
            'terms_items' => 'nullable|array',
            'terms_items.*.number' => 'nullable|string|max:50',
            'terms_items.*.title' => 'nullable|string|max:255',
            'terms_items.*.description' => 'nullable|string|max:1000',
        ]);

        foreach ($validated as $key => $value) {
            if (is_array($value)) {
                Setting::set($key, json_encode($value));
            } else {
                Setting::set($key, $value);
            }
        }

        return redirect()->back()->with('success', 'Pengaturan sistem & konten landing page berhasil diperbarui.');
    }
}
