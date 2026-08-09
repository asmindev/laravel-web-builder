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

interface FiturItem {
    tag: string;
    title: string;
    description: string;
}

interface StepItem {
    step: string;
    title: string;
    description: string;
}

interface TermItem {
    number: string;
    title: string;
    description: string;
}

interface LandingContent {
    app_name?: string;
    admin_whatsapp?: string;
    
    hero_badge?: string;
    hero_title_1?: string;
    hero_title_2?: string;
    hero_title_highlight?: string;
    hero_subtitle?: string;
    hero_prompt_demo?: string;

    fitur_section_tag?: string;
    fitur_title?: string;
    fitur_subtitle?: string;
    fitur_items?: FiturItem[];

    cara_kerja_tag?: string;
    cara_kerja_title?: string;
    cara_kerja_subtitle?: string;
    cara_kerja_steps?: StepItem[];

    agency_badge?: string;
    agency_title?: string;
    agency_description?: string;

    terms_tag?: string;
    terms_title?: string;
    terms_subtitle?: string;
    terms_items?: TermItem[];
}

export default function Welcome({ auth, landing_content, app_settings }: { auth: any; landing_content?: LandingContent; app_settings?: { app_name: string; admin_whatsapp: string } }) {
    const content = landing_content || {};
    const appName = content.app_name || app_settings?.app_name || 'NUSANTARTECH';
    const adminWhatsapp = content.admin_whatsapp || app_settings?.admin_whatsapp || '6281234567890';
    const cleanWaNumber = adminWhatsapp.replace(/[^0-9]/g, '');

    const [isDark, setIsDark] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [agencyName, setAgencyName] = useState('');
    const [agencyType, setAgencyType] = useState('Jenis Website: Company Profile');

    const fullText = content.hero_prompt_demo || "Buat landing page SaaS untuk startup finansial dengan tema modern, tabel harga dinamis, dan dominasi warna navy blue...";
    const logoUrl = "/images/logo.webp";

    // Typing effect simulation
    useEffect(() => {
        let index = 0;
        setTypingText('');
        const interval = setInterval(() => {
            if (index < fullText.length) {
                setTypingText(fullText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 30);
        return () => clearInterval(interval);
    }, [fullText]);

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

    const fiturIcons = [Layers, Code2, Globe, Users];

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
                                {content.hero_badge || 'Engine Generasi Ke-3 Tersedia'}
                            </div>
                            
                            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] sm:leading-[1.1]">
                                {content.hero_title_1 || 'Ketik Idenya,'}<br />
                                {content.hero_title_2 || 'AI Kami Buat'}<br />
                                <span className="bg-gradient-to-r from-[#2cb1bc] to-[#ff8a5c] bg-clip-text text-transparent">
                                    {content.hero_title_highlight || 'Websitenya.'}
                                </span>
                            </h1>
                            
                            <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                {content.hero_subtitle || 'Lewati proses coding dan desain berbulan-bulan. Nusantartech AI merakit layout, menulis copy, dan mengatur styling hanya dari satu prompt teks.'}
                            </p>
                            
                            {/* AI Prompt Input Simulation */}
                            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                                <div className="bg-white dark:bg-gradient-to-br dark:from-[#0d1322] dark:to-[#030712] border border-slate-200 dark:border-[#2cb1bc]/30 rounded-2xl p-2 flex items-center gap-2 sm:gap-3 shadow-xl">
                                    <div className="pl-3 text-[#2cb1bc]">
                                        <Wand2 className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div className="flex-1 text-left py-1 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 min-h-[40px] flex items-center overflow-hidden">
                                        <span>{typingText}</span>
                                        <span className="w-2 h-4 bg-[#2cb1bc] ml-1 inline-block animate-pulse" />
                                    </div>
                                    <Link
                                        href={auth?.user ? "/dashboard" : "/login"}
                                        className="shrink-0 bg-gradient-to-r from-[#2cb1bc] to-[#ff8a5c] hover:opacity-90 active:scale-95 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5"
                                    >
                                        <span>Generate</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2cb1bc]" /> Instant Node Server</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#ff8a5c]" /> Multi-Role RBAC</span>
                            </div>
                        </div>

                        {/* Hero Interactive Code Preview */}
                        <div className="relative">
                            <div className="relative mx-auto max-w-lg lg:max-w-none">
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b101d] shadow-2xl overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-[#070b14] border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                            <span className="ml-2 text-xs font-mono text-slate-400">app.js — Node.js Proxy Engine</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-[#2cb1bc] bg-[#2cb1bc]/10 px-2 py-0.5 rounded border border-[#2cb1bc]/20">
                                            Status: Live
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-300 space-y-2 overflow-x-auto">
                                        <p className="text-slate-400 dark:text-slate-500">// 1. Express Server & Internal Proxy Initialization</p>
                                        <p><span className="text-purple-600 dark:text-purple-400">const</span> express = <span className="text-[#2cb1bc]">require</span>(<span className="text-emerald-600 dark:text-emerald-400">'express'</span>);</p>
                                        <p><span className="text-purple-600 dark:text-purple-400">const</span> app = <span className="text-[#2cb1bc]">express</span>();</p>
                                        <p className="text-slate-400 dark:text-slate-500 pt-2">// 2. Dynamic Preload Project Route Context</p>
                                        <p>app.<span className="text-[#ff8a5c]">post</span>(<span className="text-emerald-600 dark:text-emerald-400">'/internal/preload'</span>, (req, res) =&gt; &#123;</p>
                                        <p className="pl-4"><span className="text-[#2cb1bc]">preloadProjectData</span>(req.body.slug, req.body.projectData);</p>
                                        <p className="pl-4">res.<span className="text-[#2cb1bc]">json</span>(&#123; status: <span className="text-emerald-600 dark:text-emerald-400">'ready'</span> &#125;);</p>
                                        <p>&#125;);</p>
                                        <p className="text-slate-400 dark:text-slate-500 pt-2">// 3. Start Live Server Port</p>
                                        <p>app.<span className="text-[#ff8a5c]">listen</span>(<span className="text-amber-600 dark:text-amber-400">4000</span>, () =&gt; console.<span className="text-[#2cb1bc]">log</span>(<span className="text-emerald-600 dark:text-emerald-400">'Node Engine Ready!'</span>));</p>
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
                            <span className="text-[#2cb1bc]">{content.fitur_section_tag || '// fitur'}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-left">
                            {content.fitur_title || 'Yang Anda dapatkan'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg text-left max-w-3xl">
                            {content.fitur_subtitle || 'Fokus pada alur kerja inti yang paling sering dipakai untuk membangun dan mengelola project berbasis Node.js.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                        {(content.fitur_items || []).map((item, idx) => {
                            const IconComponent = fiturIcons[idx % fiturIcons.length];
                            return (
                                <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 hover:border-[#2cb1bc]/50 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none group">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{item.tag}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2.5 tracking-tight">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section Cara Kerja */}
            <section id="cara-kerja" className="py-16 sm:py-24 relative z-10 transition-colors duration-500 dark:bg-[#0a0d14] border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="mb-14 sm:mb-20">
                        <div className="font-mono text-xs mb-3 flex items-center gap-2">
                            <span className="text-[#2cb1bc]">{content.cara_kerja_tag || '// cara kerja'}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-left">
                            {content.cara_kerja_title || 'Tiga langkah untuk mulai'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg text-left max-w-3xl">
                            {content.cara_kerja_subtitle || 'Alurnya dibuat singkat supaya user awam tetap bisa mulai tanpa banyak penyesuaian teknis.'}
                        </p>
                    </div>

                    <div className="relative mt-4 sm:mt-8">
                        <div className="hidden md:block absolute top-[24px] left-6 right-6 h-[1px] bg-slate-200 dark:bg-white/10 z-0" />
                        <div className="block md:hidden absolute top-6 bottom-6 left-[23px] w-[1px] bg-slate-200 dark:bg-white/10 z-0" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 relative z-10">
                            {(content.cara_kerja_steps || []).map((step, idx) => (
                                <div key={idx} className="relative flex md:block items-start gap-5 md:gap-0">
                                    <div className="w-12 h-12 shrink-0 rounded-full border border-slate-300 dark:border-[#ff8a5c]/40 bg-white dark:bg-[#0a0d14] text-[#ff8a5c] flex items-center justify-center font-mono font-bold text-lg md:mb-6 shadow-sm relative z-10">
                                        {step.step || idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-200 mb-2 sm:mb-3">{step.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed md:pr-4">{step.description}</p>
                                    </div>
                                </div>
                            ))}
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
                                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {content.agency_badge || 'Opsi Terima Beres'}
                            </div>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {content.agency_title || 'Tidak Punya Waktu Membuat Sendiri?'}
                            </h3>
                            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
                                {content.agency_description || `Selain platform AI Builder, ${appName} juga memiliki Tim Studio Agensi Internal. Kami melayani pembuatan website kustom dengan tingkat kerumitan tinggi (Company Profile, E-commerce, hingga SaaS). Serahkan pada tim expert kami.`}
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
                            <span className="text-[#2cb1bc]">{content.terms_tag || '// terms & conditions'}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-left">
                            {content.terms_title || 'Terms & Conditions'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg text-left max-w-3xl">
                            {content.terms_subtitle || 'Gunakan bagian ini untuk menaruh aturan penggunaan layanan, hak dan kewajiban pengguna, serta batas tanggung jawab.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                        {(content.terms_items || []).map((term, idx) => (
                            <div key={idx} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 shadow-sm">
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-600 mb-4 sm:mb-6 block">{term.number || `§${idx + 1}`}</span>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-200 mb-3">{term.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                                    {term.description}
                                </p>
                            </div>
                        ))}
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
                            <p className="text-slate-500 text-xs sm:text-sm">&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
