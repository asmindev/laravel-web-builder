import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Sparkles, Send, CheckCircle2 } from 'lucide-react';

export default function Welcome({ auth }: { auth: any }) {
    const [promptText, setPromptText] = useState("Sistem kasir toko kopi dengan laporan penjualan");

    const samplePrompts = [
        "Aplikasi Kasir Kopi",
        "Toko Sepatu Online",
        "Portofolio Fotografer"
    ];

    const steps = [
        {
            number: "01",
            bgCard: "bg-[#fdf4ff] border-[#f5d0fe]",
            numberColor: "text-[#c084fc]",
            title: "Tulis Kebutuhan",
            desc: "Cukup ketik ide atau fitur web yang kamu inginkan dalam bahasa sehari-hari. Tanpa perlu paham sintaks koding."
        },
        {
            number: "02",
            bgCard: "bg-[#f0fdf4] border-[#bbf7d0]",
            numberColor: "text-[#34d399]",
            title: "Proses Otomatis",
            desc: "Engine AI langsung menyusun skema database, server Express.js, dan tampilan template EJS dalam hitungan detik."
        },
        {
            number: "03",
            bgCard: "bg-[#fff7ed] border-[#fed7aa]",
            numberColor: "text-[#fb923c]",
            title: "Langsung Gunakan",
            desc: "Uji coba hasilnya secara real-time di sandbox, edit kode jika perlu, dan langsung publikasikan web app kamu."
        }
    ];

    const features = [
        {
            cardBg: "bg-[#faf5ff]",
            border: "border-[#e9d5ff] hover:border-[#c084fc]",
            tag: "EXPRESS & EJS",
            tagBg: "bg-[#f3e8ff] text-[#7e22ce] border-[#d8b4fe]",
            title: "Generasi Express & EJS",
            desc: "Menghasilkan kode Node.js, Express, dan EJS 100% lengkap tanpa placeholder. Langsung siap jalan dan dipublikasikan."
        },
        {
            cardBg: "bg-[#f0fdf4]",
            border: "border-[#bbf7d0] hover:border-[#34d399]",
            tag: "REAL-TIME SANDBOX",
            tagBg: "bg-[#dcfce7] text-[#15803d] border-[#86efac]",
            title: "Live Node Sandbox",
            desc: "Aplikasi berjalan di lingkungan terisolasi Node Engine. Uji coba tampilan EJS dan sistem backend secara real-time."
        },
        {
            cardBg: "bg-[#fff1f2]",
            border: "border-[#fecdd3] hover:border-[#fb7185]",
            tag: "MONACO EDITOR",
            tagBg: "bg-[#ffe4e6] text-[#be123c] border-[#fda4af]",
            title: "Editor Kode Terintegrasi",
            desc: "Akses penuh untuk mengubah setiap baris kode server Express, template EJS, dan gaya CSS dengan Monaco Editor."
        },
        {
            cardBg: "bg-[#fffbe6]",
            border: "border-[#fef08a] hover:border-[#facc15]",
            tag: "ONE-CLICK DEPLOY",
            tagBg: "bg-[#fef9c3] text-[#a16207] border-[#fde047]",
            title: "Ekspor & Publikasi Instan",
            desc: "Rilis ke subdomain kustom atau unduh seluruh bundle proyek Node.js (ZIP) untuk di-host di server kamu sendiri."
        }
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans selection:bg-[#fef08a] selection:text-black flex flex-col justify-between relative overflow-hidden">
            <Head title="Nusantara Engine — Instant Web App Builder" />

            {/* Header Nav */}
            <header className="px-8 py-6 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="font-bold tracking-tight text-lg flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#34d399]" />
                        <span className="font-extrabold tracking-tight text-neutral-900">
                            NUSANTARA ENGINE
                        </span>
                    </div>
                    <div>
                        {auth?.user ? (
                            <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wider px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-all rounded-full shadow-md">
                                Dashboard &rarr;
                            </Link>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link href="/login" className="text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-colors">
                                    Masuk
                                </Link>
                                <Link href="/register" className="text-xs font-bold uppercase tracking-wider px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-all rounded-full shadow-md">
                                    Mulai Gratis
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                {/* Asymmetric Non-AI-Slop Hero Banner */}
                <section className="max-w-7xl mx-auto px-8 py-20 border-b border-neutral-200/80">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left Side Copy */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            <h1 className="text-5xl sm:text-7xl font-black text-neutral-900 tracking-tight leading-[1.05]">
                                Susun Website <br />
                                Cuma Pakai <span className="bg-[#fef08a] px-3 py-1 rounded-lg text-neutral-900 border border-[#fde047]">Kalimat Biasa.</span>
                            </h1>

                            <p className="text-neutral-600 text-lg sm:text-xl font-normal leading-relaxed max-w-xl">
                                Nusantara Engine mengubah deskripsi ide kamu jadi aplikasi web Node.js &amp; EJS yang siap dipakai secara otomatis.
                            </p>

                            <div className="pt-2 flex items-center gap-4">
                                <Link
                                    href={auth?.user ? "/dashboard" : "/register"}
                                    className="group inline-flex items-center gap-3 px-8 py-4 bg-neutral-900 text-white font-bold text-sm uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-xl rounded-full"
                                >
                                    <span>{auth?.user ? "Buka Dashboard" : "Mulai Buat Web App"}</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>

                        {/* Right Side Interactive Try Widget (Visual, Human-crafted) */}
                        <div className="lg:col-span-5 bg-white border border-neutral-300 p-6 rounded-2xl shadow-xl space-y-5">
                            <div className="flex items-center justify-between text-xs font-mono text-neutral-500 border-b border-neutral-100 pb-3">
                                <span className="font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#c084fc]" /> Coba Generator Simulator
                                </span>
                                <span className="text-[#16a34a] bg-[#dcfce7] px-2 py-0.5 rounded font-bold">READY</span>
                            </div>

                            {/* Preset Buttons */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Contoh Ide Prompt:</label>
                                <div className="flex flex-wrap gap-2">
                                    {samplePrompts.map((p, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPromptText(`Buatkan ${p.toLowerCase()} sederhana`)}
                                            className="text-xs px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium transition-all border border-neutral-200"
                                        >
                                            + {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Simulated Input Bar */}
                            <div className="space-y-2 pt-1">
                                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Prompt Kamu:</label>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-300 bg-neutral-50">
                                    <input
                                        type="text"
                                        value={promptText}
                                        onChange={(e) => setPromptText(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-xs font-medium text-neutral-800"
                                        placeholder="Ketik ide web kamu di sini..."
                                    />
                                    <Link href={auth?.user ? "/dashboard" : "/register"} className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
                                        <Send className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Simulated Output Status */}
                            <div className="p-3.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-between text-xs text-[#15803d]">
                                <span className="flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> Siap digenerate ke Node.js &amp; EJS
                                </span>
                                <span className="font-mono text-[10px] font-bold">~0.4s</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Explanation Section / How it Works */}
                <section className="py-24 border-b border-neutral-200/80 bg-white">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider mb-12">
                            [ ALUR PROSES ]
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {steps.map((s, idx) => (
                                <div key={idx} className={`p-8 rounded-2xl border transition-all duration-300 space-y-4 ${s.bgCard}`}>
                                    <div className={`text-4xl font-black font-mono ${s.numberColor}`}>
                                        {s.number}
                                    </div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                                        {s.title}
                                    </h3>
                                    <p className="text-neutral-600 text-sm font-normal leading-relaxed">
                                        {s.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Showcase Section */}
                <section className="py-24 border-b border-neutral-200/80">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div>
                                <div className="text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider mb-3">
                                    [ FITUR UTAMA ]
                                </div>
                                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900">
                                    Teknologi Pembuatan Web
                                </h2>
                            </div>
                            <p className="text-neutral-600 text-sm max-w-md font-normal">
                                Menggunakan stack Node.js, Express, dan EJS untuk aplikasi yang cepat, stabil, dan siap pakai.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((f, idx) => (
                                <div 
                                    key={idx} 
                                    className={`p-8 rounded-2xl border ${f.cardBg} ${f.border} transition-all duration-300 space-y-4`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold uppercase tracking-tight text-neutral-900">
                                            {f.title}
                                        </h3>
                                        <span className={`text-[10px] font-mono px-3 py-1 border rounded-md font-bold tracking-wider ${f.tagBg}`}>
                                            {f.tag}
                                        </span>
                                    </div>
                                    <p className="text-neutral-600 text-sm font-normal leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="px-8 py-10 border-t border-neutral-200/80 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-500 uppercase tracking-wider relative z-10 bg-white">
                <div>&copy; {new Date().getFullYear()} NUSANTARA ENGINE</div>
                <div className="flex items-center gap-4 font-bold text-neutral-700">
                    <span>NODE.JS</span>
                    <span>•</span>
                    <span>EXPRESS</span>
                    <span>•</span>
                    <span>EJS</span>
                </div>
            </footer>
        </div>
    );
}
