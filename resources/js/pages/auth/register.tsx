import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Bot } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-4 font-sans selection:bg-purple-200">
            <Head title="Daftar — Nusantara Engine" />

            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
            />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-0" />

            <div className="relative z-10 w-full max-w-md space-y-6">
                {/* Back to Home Link */}
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white bg-white/80 dark:bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/50 dark:border-white/10 shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
                    </Link>
                </div>

                {/* Glassmorphism Card Container */}
                <div className="rounded-3xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-[#09090d]/85 backdrop-blur-xl p-8 shadow-2xl space-y-6">
                    {/* Brand & Header */}
                    <div className="space-y-3 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-200 text-white dark:text-black font-bold shadow-lg">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                                Buat Akun Baru
                            </h1>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                                Mulai buat web app pertama kamu secara gratis.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Nama Lengkap</Label>
                            <Input
                                id="name"
                                placeholder="Nama kamu"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoFocus
                                className="h-11 text-sm bg-white/70 dark:bg-black/50 border-neutral-300/80 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-neutral-900"
                            />
                            {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@domain.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="h-11 text-sm bg-white/70 dark:bg-black/50 border-neutral-300/80 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-neutral-900"
                            />
                            {errors.email && <p className="text-xs font-semibold text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Kata Sandi</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className="h-11 text-sm bg-white/70 dark:bg-black/50 border-neutral-300/80 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-neutral-900"
                            />
                            {errors.password && <p className="text-xs font-semibold text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Konfirmasi Kata Sandi</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder="••••••••"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                className="h-11 text-sm bg-white/70 dark:bg-black/50 border-neutral-300/80 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-neutral-900"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-lg rounded-xl text-sm mt-2"
                            disabled={processing}
                        >
                            {processing ? 'Membuat akun...' : 'Daftar Akun'}
                        </Button>
                    </form>

                    {/* Footer Login Link */}
                    <div className="border-t border-neutral-200/60 dark:border-neutral-800 pt-4 text-center text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                        Sudah punya akun?{' '}
                        <Link href={route('login')} className="font-bold text-neutral-900 dark:text-white hover:underline">
                            Masuk di Sini
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
