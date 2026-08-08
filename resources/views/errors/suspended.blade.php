<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aplikasi Ditangguhkan — Nusantara Engine</title>
    <link rel="icon" href="/favicon.png" type="image/png">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        body {
            background-color: #0b0f19;
            color: #f3f4f6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .card {
            background: rgba(17, 24, 39, 0.85);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 1.5rem;
            padding: 2.5rem;
            max-width: 520px;
            width: 100%;
            box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.15);
            backdrop-filter: blur(16px);
            text-align: center;
        }
        .icon-container {
            width: 4rem;
            height: 4rem;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.4);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: #ef4444;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
        }
        .badge-dot {
            width: 0.5rem;
            height: 0.5rem;
            background-color: #ef4444;
            border-radius: 9999px;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
        h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
        }
        p.description {
            font-size: 0.875rem;
            color: #9ca3af;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        .reason-box {
            background: rgba(0, 0, 0, 0.4);
            border-left: 3px solid #ef4444;
            border-radius: 0.5rem;
            padding: 1rem;
            text-align: left;
            margin-bottom: 1.75rem;
        }
        .reason-title {
            font-size: 0.75rem;
            font-weight: 600;
            color: #ef4444;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.375rem;
        }
        .reason-text {
            font-size: 0.875rem;
            color: #e5e7eb;
            font-weight: 500;
        }
        .actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.625rem 1.25rem;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-primary {
            background: #ef4444;
            color: #ffffff;
        }
        .btn-primary:hover {
            background: #dc2626;
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #d1d5db;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            </svg>
        </div>

        <div class="badge">
            <span class="badge-dot"></span>
            Ditangguhkan (Suspended)
        </div>

        <h1>Aplikasi Ini Ditangguhkan</h1>

        <p class="description">
            Akses ke situs web <strong>"{{ $project->name ?? 'Aplikasi' }}"</strong> ditangguhkan oleh Administrator karena terindikasi melanggar Syarat & Ketentuan Layanan Nusantara Engine.
        </p>

        @if(!empty($project->suspension_reason))
        <div class="reason-box">
            <div class="reason-title">Alasan Penangguhan:</div>
            <div class="reason-text">{{ $project->suspension_reason }}</div>
        </div>
        @endif

        <div class="actions">
            <a href="/" class="btn btn-secondary">Kembali ke Beranda</a>
            <a href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20bertanya%20mengenai%20penangguhan%20proyek%20{{ urlencode($project->name ?? '') }}" target="_blank" class="btn btn-primary">Bantuan & Banding</a>
        </div>
    </div>
</body>
</html>
