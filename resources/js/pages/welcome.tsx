import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Sparkles,
    Terminal,
    Wand2,
    Cpu,
    CheckCircle2,
    Layers,
    Code2,
    Globe,
    Users,
    CreditCard,
    Check,
    Briefcase,
    ArrowRight,
    Moon,
    Sun,
    Menu,
    X,
    ChevronRight,
    LayoutTemplate,
    Twitter,
    Github,
    Linkedin
} from 'lucide-react';

export default function Welcome({ auth, app_settings }: { auth: any; app_settings?: { app_name: string; admin_whatsapp: string } }) {
    const appName = app_settings?.app_name || 'NUSANTARTECH';
    const adminWhatsapp = app_settings?.admin_whatsapp || '6281234567890';
    const cleanWaNumber = adminWhatsapp.replace(/[^0-9]/g, '');

    const [isDark, setIsDark] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [agencyName, setAgencyName] = useState('');
    const [agencyType, setAgencyType] = useState('Jenis Website: Company Profile');

    const fullText = "Buat landing page SaaS untuk startup finansial dengan tema modern, tabel harga dinamis, dan dominasi warna navy blue...";
    const logoUrl = "/images/logo.webp";

    // Typing effect simulation
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < fullText.length) {
                setTypingText(fullText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 30);
        return () => clearInterval(interval);
    }, []);

    // Toggle Dark Mode class on html element
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    const handleWhatsAppAgency = (e: React.FormEvent) => {
        e.preventDefault();
        const text = `Halo ${appName}, saya ${agencyName || 'User'} ingin berkonsultasi mengenai pembuatan ${agencyType}.`;
        window.open(`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className={`min-h-screen font-sans antialiased text-slate-700 bg-slate-50 dark:text-gray-300 dark:bg-[#030712] selection:bg-[#2cb1bc]/30 selection:text-[#2cb1bc] transition-colors duration-500 overflow-x-hidden relative ${isDark ? 'dark' : ''}`}>
            <Head title={`${appName} — Generate Website dengan Prompt`} />

            {/* Background Patterns */}
            <div className="fixed inset-0 bg-grid-light dark:bg-grid-dark bg-[length:32px_32px] sm:bg-[length:40px_40px] opacity-[0.4] dark:opacity-[0.04] pointer-events-none z-0 transition-opacity duration-500" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[500px] bg-[#2cb1bc] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] sm:blur-[200px] opacity-[0.05] dark:opacity-[0.08] pointer-events-none z-0 transition-opacity duration-500" />

            {/* Header / Navbar */}
            <header className="fixed w-full top-0 z-50 bg-white/75 dark:bg-[#0f172a]/65 backdrop-blur-xl transition-all duration-300 border-b border-slate-200/50 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
                    
                    {/* Logo Header */}
                    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group active:scale-95 transition-transform">
                        <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-xl bg-white/10 dark:bg-black/40 border border-slate-200 dark:border-[#2cb1bc]/40 group-hover:border-[#2cb1bc] group-hover:shadow-[0_0_15px_rgba(44,177,188,0.5)] transition-all shrink-0 p-1 flex items-center justify-center">
                            <img src={logoUrl} alt={`${appName} Logo`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold tracking-tight text-base sm:text-xl leading-none text-slate-900 dark:text-white uppercase">{appName}</span>
                            <span className="text-[8px] sm:text-[10px] font-mono text-[#2cb1bc] font-bold tracking-[0.2em] uppercase flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2cb1bc] animate-pulse" /> AI Builder
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        <a className="text-sm font-semibold text-slate-600 hover:text-[#2cb1bc] dark:text-gray-400 dark:hover:text-white transition-colors" href="#fitur">Fitur AI</a>
                        <a className="text-sm font-semibold text-slate-600 hover:text-[#2cb1bc] dark:text-gray-400 dark:hover:text-white transition-colors" href="#cara-kerja">Cara Kerja</a>
                        <a className="text-sm font-semibold text-slate-600 hover:text-[#2cb1bc] dark:text-gray-400 dark:hover:text-white transition-colors" href="#harga">Langganan</a>
                        <a className="text-sm font-semibold text-slate-600 hover:text-[#2cb1bc] dark:text-gray-400 dark:hover:text-white transition-colors" href="#terms">Terms</a>
                        <div className="h-4 w-px bg-slate-300 dark:bg-[#1e293b]" />
                        <a className="text-sm font-semibold text-[#ff8a5c] hover:text-[#e86a38] transition-colors flex items-center gap-1.5" href="#jasa">
                            <LayoutTemplate className="w-4 h-4" /> Jasa Agensi
                        </a>
                    </nav>

                    {/* Header Actions */}
                    <div className="hidden md:flex items-center gap-3 lg:gap-4">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-yellow-400 transition-all hover:scale-105 active:scale-95 focus:outline-none"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        
                        <Link
                            href={auth?.user ? "/dashboard" : "/login"}
                            className="text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-5 lg:px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                        >
                            Masuk ke Dashboard
                        </Link>
                    </div>

                    {/* Mobile Action Controls */}
                    <div className="flex items-center gap-2 sm:gap-3 md:hidden">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 sm:p-2.5 rounded-full bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700 text-slate-600 dark:text-yellow-400 transition-colors focus:outline-none"
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-slate-900 dark:text-white focus:outline-none active:bg-slate-200 dark:active:bg-slate-800 transition-colors"
                            aria-label="Open Menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white/95 dark:bg-[#0f172a]/95 border-b border-slate-200/80 dark:border-[#1e293b]/80 flex flex-col px-6 py-6 gap-4 md:hidden shadow-2xl backdrop-blur-2xl z-50">
                        <a onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 dark:text-gray-200 hover:text-[#2cb1bc] transition-colors py-1 flex items-center justify-between" href="#fitur">
                            <span>Fitur AI</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </a>
                        <a onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 dark:text-gray-200 hover:text-[#2cb1bc] transition-colors py-1 flex items-center justify-between" href="#cara-kerja">
                            <span>Cara Kerja</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </a>
                        <a onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 dark:text-gray-200 hover:text-[#2cb1bc] transition-colors py-1 flex items-center justify-between" href="#harga">
                            <span>Langganan</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </a>
                        <a onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 dark:text-gray-200 hover:text-[#2cb1bc] transition-colors py-1 flex items-center justify-between" href="#terms">
                            <span>Terms &amp; Conditions</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </a>
                        <a onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-[#ff8a5c] py-1 flex items-center justify-between" href="#jasa">
                            <span className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4" /> Jasa Agensi (Kustom)</span>
                            <ChevronRight className="w-4 h-4 text-[#ff8a5c]" />
                        </a>
                        <hr className="border-slate-200 dark:border-slate-800/80 my-1" />
                        <Link href={auth?.user ? "/dashboard" : "/login"} className="text-center text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-black py-3.5 rounded-xl active:scale-95 transition-transform shadow-md">
                            Masuk ke Dashboard
                        </Link>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="relative pt-28 sm:pt-36 pb-16 lg:pt-48 lg:pb-32 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        
                        {/* Hero Text Content */}
                        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#2cb1bc]/10 border border-[#2cb1bc]/30 text-[10px] sm:text-xs font-mono font-bold text-[#2cb1bc] mb-1 backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                Engine Generasi Ke-3 Tersedia
                            </div>
                            
                            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] sm:leading-[1.1]">
                                Ketik Idenya,<br />
                                AI Kami Buat<br />
                                <span className="bg-gradient-to-r from-[#2cb1bc] to-[#ff8a5c] bg-clip-text text-transparent">Websitenya.</span>
                            </h1>
                            
                            <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Lewati proses coding dan desain berbulan-bulan. Nusantartech AI merakit layout, menulis copy, dan mengatur styling hanya dari satu prompt teks.
                            </p>
                            
                            {/* AI Prompt Input Simulation */}
                            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                                <div className="bg-white dark:bg-gradient-to-br dark:from-[#0d1322] dark:to-[#030712] border border-slate-200 dark:border-[#2cb1bc]/30 rounded-2xl p-2 flex items-center gap-2 sm:gap-3 shadow-xl">
                                    <div className="pl-2.5 sm:pl-3 text-[#2cb1bc] shrink-0">
                                        <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="w-full text-left bg-transparent text-slate-800 dark:text-white text-xs sm:text-sm font-mono py-1.5 min-h-[38px] flex items-center overflow-hidden">
                                        <span>{typingText}</span>
                                        <span className="animate-pulse text-[#2cb1bc] font-bold">|</span>
                                    </div>
                                    <Link href={auth?.user ? "/dashboard" : "/register"} className="bg-[#2cb1bc] hover:bg-[#239099] active:scale-95 text-white dark:text-[#030712] p-3 sm:p-3.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(44,177,188,0.3)] dark:shadow-[0_0_15px_rgba(44,177,188,0.5)] shrink-0" aria-label="Jalankan Prompt AI">
                                        <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </Link>
                                </div>
                                <div className="mt-3.5 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-slate-500 dark:text-gray-500 justify-center lg:justify-start items-center">
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">Saran Prompt:</span>
                                    <button onClick={() => setTypingText("Toko Sepatu Sneakers dengan keranjang belanja")} className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:border-[#ff8a5c] hover:text-[#ff8a5c] active:scale-95 transition-all bg-white/50 dark:bg-transparent">"Toko Sepatu Sneakers"</button>
                                    <button onClick={() => setTypingText("Klinik Gigi Premium dengan janji temu online")} className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:border-[#2cb1bc] hover:text-[#2cb1bc] active:scale-95 transition-all bg-white/50 dark:bg-transparent">"Klinik Gigi Premium"</button>
                                </div>
                            </div>
                        </div>

                        {/* Hero Interactive Orbit Visual */}
                        <div className="relative h-[320px] sm:h-[450px] lg:h-[520px] flex items-center justify-center mt-6 lg:mt-0">
                            <div className="relative w-full max-w-[280px] sm:max-w-md aspect-square flex items-center justify-center">
                                
                                <div className="absolute w-32 h-32 sm:w-40 sm:h-40 bg-[#2cb1bc] rounded-full blur-[50px] sm:blur-[60px] opacity-40 animate-pulse" />

                                <div className="absolute w-[78%] h-[78%] rounded-full border border-[#2cb1bc]/40 dark:border-[#2cb1bc]/30 border-dashed animate-spin" style={{ animationDuration: '18s' }} />
                                <div className="absolute w-[98%] h-[98%] rounded-full border border-[#ff8a5c]/30 dark:border-[#ff8a5c]/20 border-dotted animate-spin" style={{ animationDuration: '22s', animationDirection: 'reverse' }}>
                                    <div className="absolute top-0 left-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#ff8a5c] rounded-full shadow-[0_0_10px_#ff8a5c] -translate-x-1/2 -translate-y-1/2" />
                                    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[#2cb1bc] rounded-full shadow-[0_0_10px_#2cb1bc] -translate-x-1/2 translate-y-1/2" />
                                    <div className="absolute top-1/2 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#a6f4fa] rounded-full shadow-[0_0_8px_#a6f4fa] translate-x-1/2 -translate-y-1/2" />
                                </div>

                                {/* Central Logo Frame */}
                                <div className="relative w-36 h-36 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 sm:border-[6px] border-white dark:border-[#030712] shadow-2xl dark:shadow-[0_0_50px_rgba(44,177,188,0.25)] z-20 bg-black group">
                                    <img src={logoUrl} alt="Nusantartech AI Core" className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-1000 ease-out" />
                                    
                                    <div className="absolute inset-0 z-30 pointer-events-none mix-blend-screen">
                                        <div className="w-full h-8 bg-gradient-to-b from-transparent via-[#2cb1bc]/40 to-transparent animate-pulse" />
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_120%)] z-10 pointer-events-none" />
                                </div>

                                {/* Floating UI Elements */}
                                <div className="absolute top-2 sm:top-8 -left-2 sm:-left-6 bg-white/75 dark:bg-[#0f172a]/65 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border-l-2 border-l-[#2cb1bc] border border-slate-200/50 dark:border-white/10 flex items-center gap-2.5 sm:gap-3 z-30 shadow-lg">
                                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-[#2cb1bc] animate-pulse" />
                                    <div className="text-[9px] sm:text-xs font-mono">
                                        <p className="text-slate-800 dark:text-white font-bold">Menyusun Layout...</p>
                                        <p className="text-[#2cb1bc]">CSS Grid Applied</p>
                                    </div>
                                </div>
                                
                                <div className="absolute bottom-6 sm:bottom-12 -right-2 sm:-right-8 bg-white/75 dark:bg-[#0f172a]/65 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border-l-2 border-l-[#ff8a5c] border border-slate-200/50 dark:border-white/10 flex items-center gap-2.5 sm:gap-3 z-30 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff8a5c]" />
                                    <div className="text-[9px] sm:text-xs font-mono">
                                        <p className="text-slate-800 dark:text-white font-bold">Aset Dimuat</p>
                                        <p className="text-slate-500 dark:text-gray-400">Opt: WebP, 0.4s</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Section Fitur AI */}
            <section id="fitur" className="py-16 sm:py-24 bg-white dark:bg-[#0a0d14] border-y border-slate-200 dark:border-white/5 relative z-10 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="mb-12 sm:mb-16">
                        <div className="font-mono text-xs mb-3 flex items-center gap-2">
                            <span className="text-[#2cb1bc]">// fitur</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-left">Yang Anda dapatkan</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg text-left max-w-3xl">Fokus pada alur kerja inti yang paling sering dipakai untuk membangun dan mengelola project berbasis Node.js.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                        {/* Fitur 1 */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 hover:border-[#2cb1bc]/50 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none group">
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">project-builder.js</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2.5 tracking-tight">Project builder</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Buat landing page atau aplikasi baru dengan struktur file yang langsung siap dipakai.
                            </p>
                        </div>

                        {/* Fitur 2 */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 hover:border-[#2cb1bc]/50 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none group">
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <Code2 className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">browser-ide.js</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2.5 tracking-tight">IDE browser</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Edit file utama, jalankan project, lihat log, dan simpan perubahan dari dashboard.
                            </p>
                        </div>

                        {/* Fitur 3 */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 hover:border-[#2cb1bc]/50 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none group">
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">publish.sh</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2.5 tracking-tight">Preview dan publish</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Aktifkan preview internal dan URL publik saat project sudah siap diuji atau dipresentasikan.
                            </p>
                        </div>

                        {/* Fitur 4 */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 hover:border-[#2cb1bc]/50 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none group">
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">users.json</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2.5 tracking-tight">Manajemen user</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Atur akun user, role, status aktif, password, dan batas project sesuai paket layanan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Cara Kerja */}
            <section id="cara-kerja" className="py-16 sm:py-24 relative z-10 transition-colors duration-500 dark:bg-[#0a0d14] border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="mb-14 sm:mb-20">
                        <div className="font-mono text-xs mb-3 flex items-center gap-2">
                            <span className="text-[#2cb1bc]">// cara kerja</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-left">Tiga langkah untuk mulai</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg text-left max-w-3xl">Alurnya dibuat singkat supaya user awam tetap bisa mulai tanpa banyak penyesuaian teknis.</p>
                    </div>

                    <div className="relative mt-4 sm:mt-8">
                        <div className="hidden md:block absolute top-[24px] left-6 right-6 h-[1px] bg-slate-200 dark:bg-white/10 z-0" />
                        <div className="block md:hidden absolute top-6 bottom-6 left-[23px] w-[1px] bg-slate-200 dark:bg-white/10 z-0" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 relative z-10">
                            {/* Langkah 1 */}
                            <div className="relative flex md:block items-start gap-5 md:gap-0">
                                <div className="w-12 h-12 shrink-0 rounded-full border border-slate-300 dark:border-[#ff8a5c]/40 bg-white dark:bg-[#0a0d14] text-[#ff8a5c] flex items-center justify-center font-mono font-bold text-lg md:mb-6 shadow-sm relative z-10">1</div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-200 mb-2 sm:mb-3">Pilih paket</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed md:pr-4">Tentukan paket sesuai kebutuhan jumlah project dan jenis pekerjaan yang dijalankan.</p>
                                </div>
                            </div>

                            {/* Langkah 2 */}
                            <div className="relative flex md:block items-start gap-5 md:gap-0">
                                <div className="w-12 h-12 shrink-0 rounded-full border border-slate-300 dark:border-[#ff8a5c]/40 bg-white dark:bg-[#0a0d14] text-[#ff8a5c] flex items-center justify-center font-mono font-bold text-lg md:mb-6 shadow-sm relative z-10">2</div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-200 mb-2 sm:mb-3">Registrasi akun</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed md:pr-4">Isi nama lengkap, email, nomor WhatsApp, lalu lanjut ke checkout DOKU untuk menyelesaikan pembayaran.</p>
                                </div>
                            </div>

                            {/* Langkah 3 */}
                            <div className="relative flex md:block items-start gap-5 md:gap-0">
                                <div className="w-12 h-12 shrink-0 rounded-full border border-slate-300 dark:border-[#ff8a5c]/40 bg-white dark:bg-[#0a0d14] text-[#ff8a5c] flex items-center justify-center font-mono font-bold text-lg md:mb-6 shadow-sm relative z-10">3</div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-200 mb-2 sm:mb-3">Masuk dan mulai build</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed md:pr-4">Setelah akun aktif, login ke dashboard dan mulai membuat landing page atau aplikasi baru.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Akses Platform / Harga */}
            <section id="harga" className="py-16 sm:py-24 relative z-10 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
                        <div className="text-[#ff8a5c] font-mono text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            [ Akses Platform ]
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pilih Paket Builder Anda</h2>
                        <p className="text-slate-600 dark:text-gray-400 mt-3 text-sm sm:text-base">Mulai gratis untuk bereksperimen, tingkatkan ke Pro saat Anda siap meluncurkan bisnis.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                        {/* Starter Tier */}
                        <div className="bg-white/75 dark:bg-[#0f172a]/65 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-white/8 flex flex-col relative shadow-sm">
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Starter</h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1 font-medium">Untuk eksplorasi kekuatan AI.</p>
                            <div className="my-5 sm:my-6">
                                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Rp 0</span>
                            </div>
                            <ul className="space-y-3.5 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                                    <div className="w-5 h-5 rounded-full bg-[#2cb1bc]/20 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-[#2cb1bc]" /></div>
                                    10x Generate AI per bulan
                                </li>
                                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                                    <div className="w-5 h-5 rounded-full bg-[#2cb1bc]/20 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-[#2cb1bc]" /></div>
                                    Akses Editor Visual Dasar
                                </li>
                                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                                    <div className="w-5 h-5 rounded-full bg-[#2cb1bc]/20 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-[#2cb1bc]" /></div>
                                    Domain nusantartech.site
                                </li>
                            </ul>
                            <Link href={auth?.user ? "/dashboard" : "/login"} className="w-full text-center py-3 sm:py-3.5 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all font-bold text-sm">
                                Masuk ke Dashboard
                            </Link>
                        </div>

                        {/* Pro Tier */}
                        <div className="bg-slate-900 dark:bg-[#0a0f1d] border-2 border-[#2cb1bc] p-6 sm:p-8 rounded-3xl flex flex-col relative transform md:-translate-y-4 shadow-2xl">
                            <div className="absolute -top-3.5 right-6 sm:right-8 bg-[#2cb1bc] text-slate-900 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest py-1 px-3.5 sm:py-1.5 sm:px-4 rounded-full shadow-lg">
                                Populer
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">Pro Builder</h3>
                            <p className="text-xs sm:text-sm text-[#a6f4fa] mt-1 font-medium">Solusi lengkap untuk profesional.</p>
                            <div className="my-5 sm:my-6">
                                <span className="text-4xl sm:text-5xl font-black text-[#2cb1bc] tracking-tight">Rp 149k</span><span className="text-gray-400 font-medium text-sm sm:text-base"> /bln</span>
                            </div>
                            <ul className="space-y-3.5 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-gray-200">
                                    <div className="w-5 h-5 rounded-full bg-[#2cb1bc] flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-slate-900" /></div>
                                    Unlimited Generate AI
                                </li>
                                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-gray-200">
                                    <div className="w-5 h-5 rounded-full bg-[#2cb1bc] flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-slate-900" /></div>
                                    Export Kode (HTML/React/Tailwind)
                                </li>
                                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-gray-200">
                                    <div className="w-5 h-5 rounded-full bg-[#2cb1bc] flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-slate-900" /></div>
                                    Custom Domain (.com/.id)
                                </li>
                                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-gray-200">
                                    <div className="w-5 h-5 rounded-full bg-[#2cb1bc] flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-slate-900" /></div>
                                    Integrasi Database
                                </li>
                            </ul>
                            <Link href={auth?.user ? "/dashboard" : "/register"} className="w-full text-center py-3 sm:py-3.5 px-4 rounded-xl bg-[#2cb1bc] hover:bg-[#239099] active:scale-95 text-slate-900 transition-all font-extrabold text-sm shadow-[0_0_20px_rgba(44,177,188,0.4)]">
                                Berlangganan Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Jasa Agensi */}
            <section id="jasa" className="py-16 sm:py-24 border-y border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#060a13] relative z-10 overflow-hidden transition-colors duration-500">
                <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#ff8a5c] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] sm:blur-[150px] opacity-[0.05] dark:opacity-[0.08] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="bg-white/75 dark:bg-[#0f172a]/65 backdrop-blur-xl border border-slate-300 dark:border-[#1e293b] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 shadow-lg">
                        <div className="md:w-3/5 space-y-4 sm:space-y-6 text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff8a5c]/10 border border-[#ff8a5c]/30 text-[10px] sm:text-[11px] font-mono font-bold text-[#e86a38] dark:text-[#ff8a5c]">
                                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Opsi Terima Beres
                            </div>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tidak Punya Waktu Membuat Sendiri?</h3>
                            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
                                Selain platform AI Builder, {appName} juga memiliki <strong className="text-slate-900 dark:text-white">Tim Studio Agensi Internal</strong>. Kami melayani pembuatan website kustom dengan tingkat kerumitan tinggi (Company Profile, E-commerce, hingga SaaS). Serahkan pada tim expert kami.
                            </p>
                        </div>
                        <div className="md:w-2/5 w-full flex flex-col gap-4">
                            <form onSubmit={handleWhatsAppAgency} className="bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 text-xs sm:text-sm font-mono uppercase tracking-wider">Konsultasi Proyek Kustom</h4>
                                <input
                                    type="text"
                                    placeholder="Nama Anda"
                                    value={agencyName}
                                    onChange={(e) => setAgencyName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#ff8a5c] dark:text-white transition-colors"
                                />
                                <select
                                    value={agencyType}
                                    onChange={(e) => setAgencyType(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#ff8a5c] text-slate-600 dark:text-gray-300 transition-colors"
                                >
                                    <option value="Jenis Website: Company Profile">Jenis Website: Company Profile</option>
                                    <option value="Jenis Website: Toko Online">Jenis Website: Toko Online</option>
                                    <option value="Jenis Website: Landing Page">Jenis Website: Landing Page</option>
                                    <option value="Jenis Website: Sistem Web Kustom">Jenis Website: Sistem Web Kustom</option>
                                </select>
                                <button type="submit" className="w-full py-3 bg-[#ff8a5c] hover:bg-[#e86a38] active:scale-95 text-white font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 group shadow-md">
                                    <span>Hubungi via WhatsApp</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Terms & Conditions */}
            <section id="terms" className="py-16 sm:py-24 relative z-10 transition-colors duration-500 border-y border-slate-200 dark:border-white/5 dark:bg-[#0a0d14]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="mb-10 sm:mb-12">
                        <div className="font-mono text-xs mb-3 flex items-center gap-2">
                            <span className="text-[#2cb1bc]">// terms &amp; conditions</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-left">Terms &amp; Conditions</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg text-left max-w-3xl">Gunakan bagian ini untuk menaruh aturan penggunaan layanan, hak dan kewajiban pengguna, serta batas tanggung jawab.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                        {/* T&C 1 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 shadow-sm">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-600 mb-4 sm:mb-6 block">§1</span>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-200 mb-3">Penggunaan layanan</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Layanan hanya digunakan untuk keperluan yang sesuai dengan ketentuan, hukum yang berlaku, dan kebijakan internal yang Anda tetapkan.
                            </p>
                        </div>

                        {/* T&C 2 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 shadow-sm">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-600 mb-4 sm:mb-6 block">§2</span>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-200 mb-3">Akses akun</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Pengguna wajib menjaga kerahasiaan kredensial akun dan bertanggung jawab atas aktivitas yang dilakukan melalui akun tersebut.
                            </p>
                        </div>

                        {/* T&C 3 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 shadow-sm">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-600 mb-4 sm:mb-6 block">§3</span>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-200 mb-3">Pembaruan ketentuan</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Anda dapat memperbarui syarat dan ketentuan sewaktu-waktu selama perubahan tersebut diumumkan dengan jelas kepada pengguna.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 sm:py-12 bg-white dark:bg-[#0a0d14] border-t border-slate-200 dark:border-white/10 relative z-10 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-black flex items-center justify-center overflow-hidden shrink-0">
                                <img src={logoUrl} alt={`${appName} Logo`} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg sm:text-xl uppercase">{appName}</span>
                        </div>

                        <div className="text-center md:text-right">
                            <div className="flex items-center justify-center md:justify-end gap-5 mb-3.5">
                                <a href="#" className="text-slate-400 hover:text-[#ff8a5c] transition-colors p-1" aria-label="Twitter">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-slate-400 hover:text-[#ff8a5c] transition-colors p-1" aria-label="GitHub">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-slate-400 hover:text-[#ff8a5c] transition-colors p-1" aria-label="LinkedIn">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                            <p className="text-slate-500 text-xs sm:text-sm">&copy; 2026 {appName}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
