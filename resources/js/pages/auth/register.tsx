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
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] dark:bg-[#050505] p-4 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-purple-200">
            <Head title="Daftar — Nusantara Engine" />

            <div className="w-full max-w-sm space-y-6">
                {/* Back to Home Link */}
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
                    </Link>
                </div>

                {/* Card Container */}
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090d] p-7 shadow-xl space-y-6">
                    {/* Brand & Header */}
                    <div className="space-y-3 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-bold shadow-md">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Buat Akun Baru</h1>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                Mulai buat web app pertama kamu secara gratis.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">Nama Lengkap</Label>
                            <Input
                                id="name"
                                placeholder="Nama kamu"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoFocus
                                className="h-10 text-sm"
                            />
                            {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@domain.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="h-10 text-sm"
                            />
                            {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold">Kata Sandi</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className="h-10 text-sm"
                            />
                            {errors.password && <p className="text-xs font-medium text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold">Konfirmasi Kata Sandi</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder="••••••••"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                className="h-10 text-sm"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-md text-sm mt-2"
                            disabled={processing}
                        >
                            {processing ? 'Membuat akun...' : 'Daftar Akun'}
                        </Button>
                    </form>

                    {/* Footer Login Link */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 text-center text-xs text-neutral-500">
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
