<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SettingUploadController extends Controller
{
    public function uploadLogo(Request $request): RedirectResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp,svg,gif|max:2048',
        ]);

        $file = $request->file('logo');
        $filename = 'custom_logo_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/branding'), $filename);

        // Delete previous custom logo if exists
        $oldLogo = Setting::get('app_logo');
        if ($oldLogo && file_exists(public_path(ltrim($oldLogo, '/')))) {
            @unlink(public_path(ltrim($oldLogo, '/')));
        }

        Setting::set('app_logo', '/uploads/branding/' . $filename);

        return redirect()->back()->with('success', 'Logo aplikasi berhasil diperbarui!');
    }

    public function resetLogo(): RedirectResponse
    {
        $oldLogo = Setting::get('app_logo');
        if ($oldLogo && file_exists(public_path(ltrim($oldLogo, '/')))) {
            @unlink(public_path(ltrim($oldLogo, '/')));
        }

        Setting::set('app_logo', null);

        return redirect()->back()->with('success', 'Logo aplikasi dikembalikan ke default statis (/images/logo.webp).');
    }

    public function uploadFavicon(Request $request): RedirectResponse
    {
        $request->validate([
            'favicon' => 'required|image|mimes:ico,png,jpg,jpeg,svg|max:1024',
        ]);

        $file = $request->file('favicon');
        $filename = 'custom_favicon_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/branding'), $filename);

        // Delete previous custom favicon if exists
        $oldFavicon = Setting::get('app_favicon');
        if ($oldFavicon && file_exists(public_path(ltrim($oldFavicon, '/')))) {
            @unlink(public_path(ltrim($oldFavicon, '/')));
        }

        Setting::set('app_favicon', '/uploads/branding/' . $filename);

        return redirect()->back()->with('success', 'Favicon aplikasi berhasil diperbarui!');
    }

    public function resetFavicon(): RedirectResponse
    {
        $oldFavicon = Setting::get('app_favicon');
        if ($oldFavicon && file_exists(public_path(ltrim($oldFavicon, '/')))) {
            @unlink(public_path(ltrim($oldFavicon, '/')));
        }

        Setting::set('app_favicon', null);

        return redirect()->back()->with('success', 'Favicon aplikasi dikembalikan ke default statis (/favicon.png).');
    }
}
