import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function Login() {
    const appSettings = usePage<{ app_settings?: { app_name?: string } }>().props.appSettings;
    const appName = appSettings?.app_name || 'Nusantara Engine';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const savedTheme = (localStorage.getItem('appearance') as 'light' | 'dark' | 'system') || 'system';
        const isDark = savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setTheme(isDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('appearance', nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-4 font-sans selection:bg-[#2cb1bc]/30 transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-white overflow-hidden">
            <Head title={`Masuk — ${appName}`} />

            {/* Glowing Theme Ambient Background Elements */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#2cb1bc]/20 dark:bg-[#2cb1bc]/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-blue-500/15 dark:bg-purple-500/10 blur-3xl pointer-events-none" />
            
            {/* Optional Subtle Pattern Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md space-y-6">
                {/* Header Bar: Back to Home & Theme Toggle */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:scale-105"
                    >
                        <ArrowLeft className="size-3.5" /> Kembali ke Beranda
                    </Link>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Mode Terang (Matahari)' : 'Mode Gelap (Bulan)'}
                        className="p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all hover:scale-105"
                    >
                        {theme === 'dark' ? (
                            <Sun className="size-4 text-amber-400" />
                        ) : (
                            <Moon className="size-4 text-slate-700" />
                        )}
                    </button>
                </div>

                {/* Glassmorphism Auth Card */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
                    {/* Brand & Header (Direct Unboxed Logo) */}
                    <div className="space-y-4 text-center">
                        <Link href="/" className="inline-block group">
                            <img
                                src="/images/logo.webp"
                                alt={`${appName} Logo`}
                                className="mx-auto h-32 md:h-36 w-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                Selamat Datang Kembali
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                Masukkan email dan kata sandi kamu untuk masuk ke {appName}.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@domain.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoFocus
                                className="h-11 text-sm bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2cb1bc]"
                            />
                            {errors.email && <p className="text-xs font-semibold text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Kata Sandi
                                </Label>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="h-11 text-sm bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl pr-10 focus:ring-2 focus:ring-[#2cb1bc]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs font-semibold text-red-500">{errors.password}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-[#2cb1bc] focus:ring-[#2cb1bc] cursor-pointer"
                            />
                            <Label htmlFor="remember" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                                Ingat saya
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 font-bold bg-[#2cb1bc] hover:bg-[#2597a0] text-slate-900 transition-all shadow-lg rounded-xl text-sm mt-2"
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Masuk Akun'}
                        </Button>
                    </form>

                    {/* Footer Register Link */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Belum punya akun?{' '}
                        <Link href={route('register')} className="font-bold text-[#2cb1bc] hover:underline">
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
