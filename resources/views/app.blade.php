<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-appearance="{{ $appearance ?? 'system' }}"
    @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Nusantara Engine') }}</title>
    <meta name="description" content="AI-Powered Web Application Builder. Generate, preview, and manage full-stack web applications instantly with Nusantara Tech Engine.">
    <meta name="theme-color" content="#6366f1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url('/') }}">
    <meta property="og:title" content="{{ config('app.name', 'Nusantara Engine') }}">
    <meta property="og:description" content="AI-Powered Web Application Builder. Generate, preview, and manage full-stack web applications instantly.">
    <meta property="og:image" content="{{ asset('images/logo.webp') }}">
    <meta property="twitter:image" content="{{ asset('images/logo.webp') }}">

    <link rel="icon" href="/favicon.png" type="image/png">
    <link rel="apple-touch-icon" href="/favicon.png">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    <script>
        (() => {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

            const apply = () => {
                const stored = localStorage.getItem('appearance') ?? document.documentElement.dataset.appearance ?? 'system'
                const isDark = stored === 'dark' || (stored === 'system' && systemDark.matches)
                document.documentElement.classList.toggle('dark', isDark)
            }

            apply()
            systemDark.addEventListener('change', apply)
        })()
    </script>
    <script>
        window.csrfToken = '{{ csrf_token() }}';
    </script>

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
