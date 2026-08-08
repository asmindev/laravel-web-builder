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
            'settings' => [
                'app_name' => Setting::get('app_name', 'Nusantara Engine'),
                'admin_whatsapp' => Setting::get('admin_whatsapp', '6281234567890'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'admin_whatsapp' => 'required|string|max:50',
        ]);

        Setting::set('app_name', $validated['app_name']);
        Setting::set('admin_whatsapp', $validated['admin_whatsapp']);

        return redirect()->back()->with('success', 'Pengaturan sistem berhasil diperbarui.');
    }
}
