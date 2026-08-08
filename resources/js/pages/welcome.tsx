import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Bot, Cpu, Zap, Code2, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome({ auth }: { auth: any }) {
    const features = [
        {
            icon: <Cpu className="w-6 h-6 text-indigo-400" />,
            title: "Generasi Kode AI Instan",
            description: "Cukup jelaskan ide aplikasi web Anda dalam bahasa sehari-hari, Nusantara Engine akan menghasilkan kode Express & React secara utuh dan siap jalan."
        },
        {
            icon: <Zap className="w-6 h-6 text-violet-400" />,
            title: "Sandbox Node Engine Real-time",
            description: "Jalankan dan uji aplikasi langsung di dalam lingkungan terisolasi Node Engine. Cek kueri database, API, dan tampilan secara langsung."
        },
        {
            icon: <Code2 className="w-6 h-6 text-emerald-400" />,
            title: "Kendali Kode Sepenuhnya",
            description: "Inspeksi dan ubah setiap baris kode secara langsung menggunakan Monaco Editor terintegrasi tanpa batasan atau kekangan sistem."
        },
        {
            icon: <Globe className="w-6 h-6 text-amber-400" />,
            title: "Publikasi & Ekspor Instan",
            description: "Rilis aplikasi web buatan AI ke subdomain kustom atau unduh seluruh bundle file zip proyek secara utuh hanya dalam satu klik."
        }
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-neutral-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            <Head title="Nusantara Engine - Pembuat Aplikasi Web Berbasis AI" />

            {/* Background radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
            <div className="absolute top-[400px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/15 to-transparent blur-3xl pointer-events-none rounded-full" />

            {/* Navbar */}
            <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-black/20 sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-semibold text-lg tracking-tight">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
                            <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
                                <Bot className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                        <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent font-bold text-xl">
                            Nusantara Engine
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link href="/dashboard">
                                <Button className="bg-white text-black hover:bg-neutral-200 font-medium rounded-full px-6 shadow-md transition-all">
                                    Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/5 rounded-full px-5">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-full px-6 shadow-lg shadow-indigo-500/25 transition-all">
                                        Daftar Sekarang
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Mesin Generator Aplikasi Web Berbasis AI</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                    Ubah Ide Menjadi Aplikasi Web Full-Stack Secara Instan
                </h1>

                <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
                    Nusantara Engine membantu developer dan kreator membangun, menguji, dan mempublikasikan aplikasi web Node.js utuh hanya menggunakan instruksi bahasa alami.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href={auth?.user ? "/dashboard" : "/register"}>
                        <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base bg-white text-black hover:bg-neutral-200 rounded-full font-semibold shadow-xl shadow-white/10 transition-all hover:scale-105">
                            {auth?.user ? "Buka Dashboard" : "Mulai Buat Gratis"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        Dirancang untuk Kecepatan Pengembangan Maksimal
                    </h2>
                    <p className="text-neutral-400 max-w-xl mx-auto text-base">
                        Semua fitur yang Anda butuhkan untuk mengubah ide menjadi aplikasi web siap pakai dan produksi.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((item, idx) => (
                        <div key={idx} className="group relative p-8 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 backdrop-blur-sm hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-indigo-500/30 transition-all">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-indigo-300 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8 text-center text-sm text-neutral-500">
                <p>&copy; {new Date().getFullYear()} Nusantara Engine. Hak cipta dilindungi.</p>
            </footer>
        </div>
    );
}
