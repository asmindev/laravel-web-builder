import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    Check,
    CheckCircle2,
    ChevronRight,
    Code2,
    Cpu,
    CreditCard,
    Github,
    Globe,
    Layers,
    LayoutTemplate,
    Linkedin,
    Menu,
    Moon,
    Sparkles,
    Sun,
    Terminal,
    Twitter,
    Users,
    Wand2,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

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

export interface PlanItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number | string;
    price_period: string;
    project_limit: number;
    features: string[] | null;
    is_active: boolean;
    is_popular: boolean;
    sort_order: number;
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
    hero_prompt_suggestions?: string[];

    fitur_section_tag?: string;
    fitur_title?: string;
    fitur_subtitle?: string;
    fitur_items?: FiturItem[];

    cara_kerja_tag?: string;
    cara_kerja_title?: string;
    cara_kerja_subtitle?: string;
    cara_kerja_steps?: StepItem[];

    pricing_section_tag?: string;
    pricing_title?: string;
    pricing_subtitle?: string;
    pricing_starter_title?: string;
    pricing_starter_subtitle?: string;
    pricing_starter_price?: string;
    pricing_starter_features?: string[];
    pricing_pro_title?: string;
    pricing_pro_subtitle?: string;
    pricing_pro_price?: string;
    pricing_pro_period?: string;
    pricing_pro_features?: string[];

    agency_badge?: string;
    agency_title?: string;
    agency_description?: string;

    terms_tag?: string;
    terms_title?: string;
    terms_subtitle?: string;
    terms_items?: TermItem[];
}

export default function Welcome({
    auth,
    landing_content,
    app_settings,
    plans,
}: {
    auth: any;
    landing_content?: LandingContent;
    app_settings?: { app_name: string; admin_whatsapp: string };
    plans?: PlanItem[];
}) {
    const content = landing_content || {};
    const appName = content.app_name || app_settings?.app_name || 'NUSANTARTECH';
    const adminWhatsapp = content.admin_whatsapp || app_settings?.admin_whatsapp || '6281234567890';
    const cleanWaNumber = adminWhatsapp.replace(/[^0-9]/g, '');

    const dbPlans: PlanItem[] =
        plans && plans.length > 0
            ? plans
            : [
                  {
                      id: 1,
                      name: content.pricing_starter_title || 'Starter',
                      slug: 'starter',
                      description: content.pricing_starter_subtitle || 'Untuk eksplorasi kekuatan AI.',
                      price: content.pricing_starter_price || '0',
                      price_period: '/bln',
                      project_limit: 2,
                      features: content.pricing_starter_features || [
                          '10x Generate AI per bulan',
                          'Akses Editor Visual Dasar',
                          'Domain nusantartech.site',
                      ],
                      is_active: true,
                      is_popular: false,
                      sort_order: 1,
                  },
                  {
                      id: 2,
                      name: content.pricing_pro_title || 'Pro Builder',
                      slug: 'pro',
                      description: content.pricing_pro_subtitle || 'Solusi lengkap untuk profesional.',
                      price: content.pricing_pro_price || '149000',
                      price_period: content.pricing_pro_period || '/bln',
                      project_limit: 10,
                      features: content.pricing_pro_features || [
                          'Unlimited Generate AI',
                          'Export Kode (HTML/React/Tailwind)',
                          'Custom Domain (.com/.id)',
                          'Integrasi Database',
                      ],
                      is_active: true,
                      is_popular: true,
                      sort_order: 2,
                  },
              ];

    const [isDark, setIsDark] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [typingText, setTypingText] = useState('');

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);
    const [agencyName, setAgencyName] = useState('');
    const [agencyType, setAgencyType] = useState('Jenis Website: Company Profile');

    const defaultPrompt =
        content.hero_prompt_demo ||
        'Buat landing page SaaS untuk startup finansial dengan tema modern, tabel harga dinamis, dan dominasi warna navy blue...';

    const demoPrompts = useMemo(() => [
        defaultPrompt,
        'Buat website Toko Sepatu Sneakers dengan katalog interaktif, keranjang belanja, dan filter ukuran...',
        'Buat sistem kasir & manajemen laundry kiloan dengan status cucian real-time dan struk digital...',
        'Buat platform Klinik Gigi Premium dengan jadwal booking dokter online dan testimoni pasien...',
        'Buat landing page Restoran & Kafe Modern dengan menu digital interaktif dan reservasi meja...'
    ], [defaultPrompt]);

    const [activePrompt, setActivePrompt] = useState(defaultPrompt);
    const [promptIndex, setPromptIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const logoUrl = (content as any).logo_url || (app_settings as any)?.logo_url || '/images/logo.webp';

    // Continuous smooth typing & rotation effect simulation
    useEffect(() => {
        let timer: NodeJS.Timeout;
        const currentFullText = activePrompt;

        if (!isDeleting && typingText === currentFullText) {
            timer = setTimeout(() => setIsDeleting(true), 3200);
        } else if (isDeleting && typingText === '') {
            setIsDeleting(false);
            const nextIdx = (promptIndex + 1) % demoPrompts.length;
            setPromptIndex(nextIdx);
            setActivePrompt(demoPrompts[nextIdx]);
        } else {
            const speed = isDeleting ? 16 : 28;
            timer = setTimeout(() => {
                setTypingText((prev) =>
                    isDeleting
                        ? currentFullText.slice(0, prev.length - 1)
                        : currentFullText.slice(0, prev.length + 1)
                );
            }, speed);
        }

        return () => clearTimeout(timer);
    }, [typingText, isDeleting, activePrompt, promptIndex, demoPrompts]);

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
    const suggestions = content.hero_prompt_suggestions || ['Toko Sepatu Sneakers', 'Klinik Gigi Premium'];

    return (
        <div
            className={`relative min-h-screen overflow-x-hidden overflow-y-auto bg-slate-50 font-sans text-slate-700 antialiased transition-colors duration-500 selection:bg-[#2cb1bc]/30 selection:text-[#2cb1bc] dark:bg-[#030712] dark:text-gray-300 ${isDark ? 'dark' : ''}`}
        >
            <Head title={`${appName} — Generate Website dengan Prompt`} />

            {/* Background Patterns */}
            <div className="bg-grid-light dark:bg-grid-dark pointer-events-none fixed inset-0 z-0 bg-[length:32px_32px] opacity-[0.4] transition-opacity duration-500 sm:bg-[length:40px_40px] dark:opacity-[0.04]" />
            <div className="pointer-events-none fixed top-0 left-1/2 z-0 h-[300px] w-[350px] -translate-x-1/2 rounded-full bg-[#2cb1bc] opacity-[0.05] mix-blend-multiply blur-[120px] filter transition-opacity duration-500 sm:h-[500px] sm:w-[600px] sm:blur-[200px] md:w-[800px] dark:opacity-[0.08] dark:mix-blend-screen" />

            {/* Header / Navbar */}
            <header className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/75 backdrop-blur-xl transition-all duration-300 dark:border-white/5 dark:bg-[#0f172a]/65">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
                    {/* Logo Header */}
                    <Link href="/" className="group flex items-center gap-2.5 transition-transform active:scale-95 sm:gap-3">
                        <img
                            src={logoUrl}
                            alt={`${appName} Logo`}
                            className="h-9 w-auto shrink-0 object-contain transition-transform group-hover:scale-105 sm:h-11"
                        />
                        <div className="flex flex-col">
                            <span className="text-base leading-none font-extrabold tracking-tight text-slate-900 uppercase sm:text-xl dark:text-white">
                                {appName}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 font-mono text-[8px] font-bold tracking-[0.2em] text-primary uppercase sm:text-[10px]">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> {app_settings?.app_version || 'V2'} AI Builder
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden items-center gap-6 md:flex lg:gap-8">
                        <a
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#2cb1bc] dark:text-gray-400 dark:hover:text-white"
                            href="#fitur"
                        >
                            Fitur AI
                        </a>
                        <a
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#2cb1bc] dark:text-gray-400 dark:hover:text-white"
                            href="#cara-kerja"
                        >
                            Cara Kerja
                        </a>
                        <a
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#2cb1bc] dark:text-gray-400 dark:hover:text-white"
                            href="#harga"
                        >
                            Langganan
                        </a>
                        <a
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#2cb1bc] dark:text-gray-400 dark:hover:text-white"
                            href="#terms"
                        >
                            Terms
                        </a>
                        <div className="h-4 w-px bg-slate-300 dark:bg-[#1e293b]" />
                        <a
                            className="flex items-center gap-1.5 text-sm font-semibold text-[#ff8a5c] transition-colors hover:text-[#e86a38]"
                            href="#jasa"
                        >
                            <LayoutTemplate className="h-4 w-4" /> Jasa Agensi
                        </a>
                    </nav>

                    {/* Header Actions */}
                    <div className="hidden items-center gap-3 md:flex lg:gap-4">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="rounded-full bg-slate-100 p-2.5 text-slate-600 transition-all hover:scale-105 hover:bg-slate-200 focus:outline-none active:scale-95 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        <Link
                            href={auth?.user ? '/dashboard' : '/login'}
                            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-slate-800 hover:shadow-lg active:scale-95 lg:px-6 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            Masuk ke Dashboard
                        </Link>
                    </div>

                    {/* Mobile Action Controls */}
                    <div className="flex items-center gap-2 sm:gap-3 md:hidden">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors focus:outline-none active:bg-slate-200 sm:p-2.5 dark:bg-slate-800 dark:text-yellow-400 dark:active:bg-slate-700"
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-xl p-2 text-slate-900 transition-colors focus:outline-none active:bg-slate-200 dark:text-white dark:active:bg-slate-800"
                            aria-label="Open Menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <>
                    {/* Backdrop overlay */}
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute top-full left-0 z-50 flex w-full flex-col gap-3 border-b border-slate-200/80 bg-white/98 px-5 py-5 shadow-2xl backdrop-blur-2xl sm:gap-4 sm:px-6 sm:py-6 md:hidden dark:border-[#1e293b]/80 dark:bg-[#0f172a]/98">
                        <a
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between py-1 text-base font-semibold text-slate-800 transition-colors hover:text-[#2cb1bc] dark:text-gray-200"
                            href="#fitur"
                        >
                            <span>Fitur AI</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </a>
                        <a
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between py-1 text-base font-semibold text-slate-800 transition-colors hover:text-[#2cb1bc] dark:text-gray-200"
                            href="#cara-kerja"
                        >
                            <span>Cara Kerja</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </a>
                        <a
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between py-1 text-base font-semibold text-slate-800 transition-colors hover:text-[#2cb1bc] dark:text-gray-200"
                            href="#harga"
                        >
                            <span>Langganan</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </a>
                        <a
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between py-1 text-base font-semibold text-slate-800 transition-colors hover:text-[#2cb1bc] dark:text-gray-200"
                            href="#terms"
                        >
                            <span>Terms &amp; Conditions</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </a>
                        <a
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between py-1 text-base font-semibold text-[#ff8a5c]"
                            href="#jasa"
                        >
                            <span className="flex items-center gap-2">
                                <LayoutTemplate className="h-4 w-4" /> Jasa Agensi (Kustom)
                            </span>
                            <ChevronRight className="h-4 w-4 text-[#ff8a5c]" />
                        </a>
                        <hr className="my-1 border-slate-200 dark:border-slate-800/80" />
                        <Link
                            href={auth?.user ? '/dashboard' : '/login'}
                            className="rounded-xl bg-slate-900 py-3 text-center text-sm font-bold text-white shadow-md transition-transform active:scale-95 sm:py-3.5 dark:bg-white dark:text-black"
                        >
                            Masuk ke Dashboard
                        </Link>
                    </div>
                    </>
                )}
            </header>

            {/* Hero Main Content */}
            <main className="relative z-10 pt-28 pb-14 sm:pt-36 sm:pb-16 lg:pt-48 lg:pb-32">
                <div className="mx-auto max-w-7xl px-5 sm:px-6">
                    <div className="grid grid-cols-1 items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
                        {/* Hero Text Content */}
                        <div className="space-y-6 text-left sm:space-y-7 md:space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#2cb1bc]/30 bg-[#2cb1bc]/10 px-4 py-1.5 font-mono text-xs font-bold text-[#2cb1bc] backdrop-blur-md sm:px-4 sm:py-2">
                                <Sparkles className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                                {content.hero_badge || 'Engine Generasi Ke-3 Tersedia'}
                            </div>

                            <h1 className="text-[2.75rem] leading-[1.04] font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.08] md:text-6xl lg:text-[4.75rem] lg:leading-[1.03] dark:text-white">
                                {content.hero_title_1 || 'Ketik Idenya,'}
                                <br />
                                {content.hero_title_2 || 'AI Kami Buat'}
                                <br />
                                <span className="bg-gradient-to-r from-[#2cb1bc] via-[#38c9d6] to-[#ff8a5c] bg-clip-text text-transparent">
                                    {content.hero_title_highlight || 'Websitenya.'}
                                </span>
                            </h1>

                            <p className="max-w-xl text-[0.95rem] leading-[1.7] font-normal text-slate-600 sm:text-base sm:leading-relaxed md:text-lg lg:text-xl dark:text-gray-300">
                                {content.hero_subtitle ||
                                    'Lewati proses coding dan desain berbulan-bulan. Nusantartech AI merakit layout, menulis copy, dan mengatur styling hanya dari satu prompt teks.'}
                            </p>

                            {/* AI Prompt Input Simulation */}
                            <div className="max-w-xl pt-3 sm:pt-2">
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl sm:gap-3 sm:rounded-2xl sm:p-2.5 dark:border-[#2cb1bc]/30 dark:bg-gradient-to-br dark:from-[#0d1322] dark:to-[#030712]">
                                    <div className="shrink-0 pl-1.5 text-[#2cb1bc] sm:pl-3">
                                        <Terminal className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="flex min-h-[44px] sm:min-h-[40px] w-full min-w-0 items-center overflow-hidden bg-transparent py-1 text-left font-mono text-[12px] sm:text-xs md:text-sm text-slate-800 leading-snug focus:outline-none dark:text-slate-200">
                                        <span className="line-clamp-2 break-words sm:line-clamp-none font-medium">{typingText}</span>
                                        <span className="ml-1 inline-block h-3.5 w-1.5 shrink-0 animate-pulse rounded-[1px] bg-[#2cb1bc] shadow-[0_0_8px_#2cb1bc]" />
                                    </div>
                                    <Link
                                        href={auth?.user ? '/dashboard' : '/login'}
                                        className="flex shrink-0 items-center justify-center rounded-lg bg-[#2cb1bc] p-2.5 text-white shadow-[0_4px_15px_rgba(44,177,188,0.3)] transition-all hover:bg-[#239099] active:scale-95 sm:rounded-xl sm:p-3.5 dark:text-[#030712] dark:shadow-[0_0_15px_rgba(44,177,188,0.5)]"
                                        aria-label="Jalankan Prompt AI"
                                    >
                                        <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </Link>
                                </div>

                                {/* Prompt Suggestions */}
                                <div className="mt-3.5 flex flex-wrap items-center justify-start gap-2 font-mono text-[11px] text-slate-500 sm:mt-4 sm:text-xs dark:text-gray-400">
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">Saran Prompt:</span>
                                    {suggestions.map((sug, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setIsDeleting(false);
                                                setTypingText('');
                                                setActivePrompt(`Buat website ${sug} dengan tema modern, tabel harga dinamis, dan responsif...`);
                                            }}
                                            className="rounded-lg border border-slate-200 bg-white/60 px-2.5 py-1.5 transition-all hover:border-[#ff8a5c] hover:text-[#ff8a5c] active:scale-95 dark:border-slate-800 dark:bg-transparent"
                                        >
                                            "{sug}"
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Hero Interactive 3D Orbit Visual */}
                        <div className="relative mt-4 flex h-[280px] items-center justify-center sm:mt-6 sm:h-[380px] md:h-[450px] lg:mt-0 lg:h-[520px]">
                            <div className="relative flex aspect-square w-full max-w-[220px] items-center justify-center sm:max-w-[320px] md:max-w-md">
                                <div className="absolute h-24 w-24 animate-pulse rounded-full bg-[#2cb1bc] blur-[40px] sm:h-32 sm:w-32 sm:blur-[50px] md:h-40 md:w-40 md:blur-[60px]" />

                                <div
                                    className="absolute h-[78%] w-[78%] animate-spin rounded-full border border-dashed border-[#2cb1bc]/40 dark:border-[#2cb1bc]/30"
                                    style={{ animationDuration: '18s' }}
                                />
                                <div
                                    className="absolute h-[98%] w-[98%] animate-spin rounded-full border border-dotted border-[#ff8a5c]/30 dark:border-[#ff8a5c]/20"
                                    style={{ animationDuration: '22s', animationDirection: 'reverse' }}
                                >
                                    <div className="absolute top-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff8a5c] shadow-[0_0_10px_#ff8a5c] sm:h-3 sm:w-3" />
                                    <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#2cb1bc] shadow-[0_0_10px_#2cb1bc]" />
                                    <div className="absolute top-1/2 -right-1 h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a6f4fa] shadow-[0_0_8px_#a6f4fa] sm:h-2.5 sm:w-2.5" />
                                </div>

                                {/* Central Logo Frame */}
                                <div className="group relative z-20 h-28 w-28 overflow-hidden rounded-full border-[3px] border-white bg-black shadow-2xl sm:h-40 sm:w-40 sm:border-4 md:h-52 md:w-52 md:border-[6px] dark:border-[#030712] dark:shadow-[0_0_50px_rgba(44,177,188,0.25)]">
                                    <img
                                        src={logoUrl}
                                        alt={`${appName} Core AI`}
                                        className="h-full w-full scale-110 transform object-cover transition-transform duration-1000 ease-out group-hover:scale-125"
                                    />

                                    <div className="pointer-events-none absolute inset-0 z-30 mix-blend-screen">
                                        <div className="h-8 w-full animate-scan bg-gradient-to-b from-transparent via-[#2cb1bc]/40 to-transparent" />
                                    </div>

                                    <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_120%)]" />
                                </div>

                                {/* Floating UI Elements */}
                                <div
                                    className="absolute -top-1 left-0 z-30 flex animate-bounce items-center gap-1.5 rounded-lg border border-l-2 border-slate-200/50 border-l-[#2cb1bc] bg-white/75 p-1.5 shadow-lg backdrop-blur-xl sm:top-8 sm:-left-6 sm:gap-2.5 sm:rounded-xl sm:p-2.5 md:gap-3 md:p-3 dark:border-white/10 dark:bg-[#0f172a]/65"
                                    style={{ animationDuration: '4s' }}
                                >
                                    <Cpu className="h-3 w-3 animate-pulse text-[#2cb1bc] sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                    <div className="font-mono text-[8px] sm:text-[9px] md:text-xs">
                                        <p className="font-bold text-slate-800 dark:text-white">Menyusun Layout...</p>
                                        <p className="text-[#2cb1bc]">CSS Grid Applied</p>
                                    </div>
                                </div>

                                <div
                                    className="absolute right-0 bottom-2 z-30 flex animate-bounce items-center gap-1.5 rounded-lg border border-l-2 border-slate-200/50 border-l-[#ff8a5c] bg-white/75 p-1.5 shadow-lg backdrop-blur-xl sm:-right-8 sm:bottom-12 sm:gap-2.5 sm:rounded-xl sm:p-2.5 md:gap-3 md:p-3 dark:border-white/10 dark:bg-[#0f172a]/65"
                                    style={{ animationDuration: '4s', animationDelay: '2s' }}
                                >
                                    <CheckCircle2 className="h-3 w-3 text-[#ff8a5c] sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                    <div className="font-mono text-[8px] sm:text-[9px] md:text-xs">
                                        <p className="font-bold text-slate-800 dark:text-white">Aset Dimuat</p>
                                        <p className="text-slate-500 dark:text-gray-400">Opt: WebP, 0.4s</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Section Fitur AI */}
            <section
                id="fitur"
                className="relative z-10 border-y border-slate-200 bg-white py-16 transition-colors duration-500 sm:py-24 dark:border-white/5 dark:bg-[#0a0d14]"
            >
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-12 sm:mb-16">
                        <div className="mb-3 flex items-center gap-2 font-mono text-xs">
                            <span className="text-[#2cb1bc]">{content.fitur_section_tag || '// fitur'}</span>
                        </div>
                        <h2 className="text-left text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                            {content.fitur_title || 'Yang Anda dapatkan'}
                        </h2>
                        <p className="mt-3 max-w-3xl text-left text-base text-slate-600 sm:text-lg dark:text-slate-400">
                            {content.fitur_subtitle ||
                                'Fokus pada alur kerja inti yang paling sering dipakai untuk membangun dan mengelola project berbasis Node.js.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                        {(content.fitur_items || []).map((item, idx) => {
                            const IconComponent = fiturIcons[idx % fiturIcons.length];
                            return (
                                <div
                                    key={idx}
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2cb1bc]/50 dark:border-white/5 dark:bg-[#111520] dark:shadow-none"
                                >
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-transform group-hover:scale-110">
                                            <IconComponent className="h-5 w-5" />
                                        </div>
                                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{item.tag}</span>
                                    </div>
                                    <h3 className="mb-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-200">{item.title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section Cara Kerja */}
            <section
                id="cara-kerja"
                className="relative z-10 border-b border-slate-200 py-16 transition-colors duration-500 sm:py-24 dark:border-white/5 dark:bg-[#0a0d14]"
            >
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-14 sm:mb-20">
                        <div className="mb-3 flex items-center gap-2 font-mono text-xs">
                            <span className="text-[#2cb1bc]">{content.cara_kerja_tag || '// cara kerja'}</span>
                        </div>
                        <h2 className="text-left text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                            {content.cara_kerja_title || 'Tiga langkah untuk mulai'}
                        </h2>
                        <p className="mt-3 max-w-3xl text-left text-base text-slate-600 sm:text-lg dark:text-slate-400">
                            {content.cara_kerja_subtitle ||
                                'Alurnya dibuat singkat supaya user awam tetap bisa mulai tanpa banyak penyesuaian teknis.'}
                        </p>
                    </div>

                    <div className="relative mt-4 sm:mt-8">
                        <div className="absolute top-[24px] right-6 left-6 z-0 hidden h-[1px] bg-slate-200 md:block dark:bg-white/10" />
                        <div className="absolute top-6 bottom-6 left-[23px] z-0 block w-[1px] bg-slate-200 md:hidden dark:bg-white/10" />

                        <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
                            {(content.cara_kerja_steps || []).map((step, idx) => (
                                <div key={idx} className="relative flex items-start gap-5 md:block md:gap-0">
                                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white font-mono text-lg font-bold text-[#ff8a5c] shadow-sm md:mb-6 dark:border-[#ff8a5c]/40 dark:bg-[#0a0d14]">
                                        {step.step || idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-lg font-bold text-slate-900 sm:mb-3 sm:text-xl dark:text-slate-200">{step.title}</h3>
                                        <p className="text-sm leading-relaxed text-slate-600 md:pr-4 dark:text-slate-400">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Akses Platform / Harga */}
            <section id="harga" className="relative z-10 py-16 transition-colors duration-500 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
                        <div className="mb-3 flex items-center justify-center gap-2 font-mono text-xs font-bold tracking-widest text-[#ff8a5c] uppercase">
                            <CreditCard className="h-4 w-4" />
                            {content.pricing_section_tag || '[ Akses Platform ]'}
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                            {content.pricing_title || 'Pilih Paket Builder Anda'}
                        </h2>
                        <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-gray-400">
                            {content.pricing_subtitle || 'Mulai gratis untuk bereksperimen, tingkatkan ke Pro saat Anda siap meluncurkan bisnis.'}
                        </p>
                    </div>

                    <div className={`mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:gap-8 md:grid-cols-2`}>
                        {dbPlans.map((plan) => (
                            <div
                                key={plan.slug}
                                className={`relative flex flex-col rounded-2xl p-5 shadow-lg transition-all sm:rounded-3xl sm:p-8 ${
                                    plan.is_popular
                                        ? 'border-2 border-[#2cb1bc] bg-slate-900 shadow-2xl md:-translate-y-2 dark:bg-[#0a0f1d] dark:shadow-[0_0_40px_rgba(44,177,188,0.15)]'
                                        : 'border border-slate-200 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]/65'
                                }`}
                            >
                                {plan.is_popular && (
                                    <div className="absolute -top-3.5 right-6 rounded-full bg-[#2cb1bc] px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-slate-900 uppercase shadow-lg sm:right-8 sm:px-4 sm:py-1.5 sm:text-[11px]">
                                        Populer
                                    </div>
                                )}
                                <h3 className={`text-xl font-bold sm:text-2xl ${plan.is_popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {plan.name}
                                </h3>
                                <p
                                    className={`mt-1 text-xs font-medium sm:text-sm ${plan.is_popular ? 'text-[#a6f4fa]' : 'text-slate-500 dark:text-gray-400'}`}
                                >
                                    {plan.description || 'Paket pilihan tepat untuk Anda.'}
                                </p>
                                <div className="my-4 sm:my-6">
                                    <span
                                        className={`text-3xl font-black tracking-tight sm:text-4xl ${plan.is_popular ? 'text-[#2cb1bc]' : 'text-slate-900 dark:text-white'}`}
                                    >
                                        {Number(plan.price) === 0 ? 'Rp 0' : `Rp ${Number(plan.price).toLocaleString('id-ID')}`}
                                    </span>
                                    <span className="text-xs font-medium text-gray-400 sm:text-sm">{plan.price_period}</span>
                                </div>
                                <div className="mb-4 flex items-center gap-1.5 text-xs font-bold text-primary">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Limit: {plan.project_limit} Upload Proyek
                                </div>
                                <ul className="mb-8 flex-1 space-y-3 sm:mb-10 sm:space-y-3.5">
                                    {(plan.features || []).map((feat, i) => (
                                        <li
                                            key={i}
                                            className={`flex items-center gap-2.5 text-xs font-medium sm:text-sm ${plan.is_popular ? 'text-gray-200' : 'text-slate-700 dark:text-gray-300'}`}
                                        >
                                            <div
                                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${plan.is_popular ? 'bg-[#2cb1bc] text-slate-900' : 'bg-[#2cb1bc]/20 text-[#2cb1bc]'}`}
                                            >
                                                <Check className="h-2.5 w-2.5" />
                                            </div>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={auth?.user ? '/dashboard' : '/login'}
                                    className={`block w-full rounded-xl px-4 py-2.5 text-center text-xs font-extrabold transition-all sm:py-3 sm:text-sm ${
                                        plan.is_popular
                                            ? 'bg-[#2cb1bc] text-slate-900 shadow-[0_0_20px_rgba(44,177,188,0.4)] hover:bg-[#239099] active:scale-95'
                                            : 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {plan.price > 0 ? 'Pilih Paket' : 'Mulai Gratis'}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section Jasa Agensi */}
            <section
                id="jasa"
                className="relative z-10 overflow-hidden border-y border-slate-200 bg-slate-100 py-16 transition-colors duration-500 sm:py-24 dark:border-[#1e293b] dark:bg-[#060a13]"
            >
                <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-[#ff8a5c] opacity-[0.05] mix-blend-multiply blur-[100px] filter sm:h-[500px] sm:w-[500px] sm:blur-[150px] dark:opacity-[0.08] dark:mix-blend-screen" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-300 bg-white/75 p-5 shadow-lg backdrop-blur-xl sm:gap-8 sm:rounded-[2rem] sm:p-10 md:flex-row md:gap-12 md:p-14 dark:border-[#1e293b] dark:bg-[#0f172a]/65">
                        <div className="w-full space-y-3 text-left sm:space-y-6 md:w-3/5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff8a5c]/30 bg-[#ff8a5c]/10 px-3 py-1.5 font-mono text-[10px] font-bold text-[#e86a38] sm:text-[11px] dark:text-[#ff8a5c]">
                                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {content.agency_badge || 'Opsi Terima Beres'}
                            </div>
                            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl md:text-3xl lg:text-4xl dark:text-white">
                                {content.agency_title || 'Tidak Punya Waktu Membuat Sendiri?'}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg dark:text-gray-400">
                                {content.agency_description ||
                                    `Selain platform AI Builder, ${appName} juga memiliki Tim Studio Agensi Internal. Kami melayani pembuatan website kustom dengan tingkat kerumitan tinggi (Company Profile, E-commerce, hingga SaaS). Serahkan pada tim expert kami.`}
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-4 md:w-2/5">
                            <form
                                onSubmit={handleWhatsAppAgency}
                                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 dark:border-slate-800 dark:bg-slate-900/60"
                            >
                                <h4 className="mb-3 font-mono text-xs font-bold tracking-wider text-slate-900 uppercase sm:mb-4 sm:text-sm dark:text-white">
                                    Konsultasi Proyek Kustom
                                </h4>
                                <input
                                    type="text"
                                    placeholder="Nama Anda"
                                    value={agencyName}
                                    onChange={(e) => setAgencyName(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs transition-colors focus:border-[#ff8a5c] focus:outline-none sm:rounded-xl sm:px-4 sm:text-sm dark:border-slate-700 dark:bg-black/50 dark:text-white"
                                />
                                <select
                                    value={agencyType}
                                    onChange={(e) => setAgencyType(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 transition-colors focus:border-[#ff8a5c] focus:outline-none sm:rounded-xl sm:px-4 sm:text-sm dark:border-slate-700 dark:bg-black/50 dark:text-gray-300"
                                >
                                    <option value="Jenis Website: Company Profile">Jenis Website: Company Profile</option>
                                    <option value="Jenis Website: Toko Online">Jenis Website: Toko Online</option>
                                    <option value="Jenis Website: Landing Page">Jenis Website: Landing Page</option>
                                    <option value="Jenis Website: Sistem Web Kustom">Jenis Website: Sistem Web Kustom</option>
                                </select>
                                <button
                                    type="submit"
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff8a5c] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#e86a38] active:scale-95 sm:text-sm"
                                >
                                    <span>Hubungi via WhatsApp</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Terms & Conditions */}
            <section
                id="terms"
                className="relative z-10 border-y border-slate-200 py-16 transition-colors duration-500 sm:py-24 dark:border-white/5 dark:bg-[#0a0d14]"
            >
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-10 sm:mb-12">
                        <div className="mb-3 flex items-center gap-2 font-mono text-xs">
                            <span className="text-[#2cb1bc]">{content.terms_tag || '// terms & conditions'}</span>
                        </div>
                        <h2 className="text-left text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                            {content.terms_title || 'Terms & Conditions'}
                        </h2>
                        <p className="mt-3 max-w-3xl text-left text-base text-slate-600 sm:text-lg dark:text-slate-400">
                            {content.terms_subtitle ||
                                'Gunakan bagian ini untuk menaruh aturan penggunaan layanan, hak dan kewajiban pengguna, serta batas tanggung jawab.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
                        {(content.terms_items || []).map((term, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/5 dark:bg-[#111520]"
                            >
                                <span className="mb-4 block font-mono text-xs text-slate-500 sm:mb-6 dark:text-slate-600">
                                    {term.number || `§${idx + 1}`}
                                </span>
                                <h3 className="mb-3 text-base font-bold text-slate-900 sm:text-lg dark:text-slate-200">{term.title}</h3>
                                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400">{term.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-200 bg-white py-10 transition-colors duration-500 sm:py-12 dark:border-white/10 dark:bg-[#0a0d14]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex flex-col items-center justify-between gap-5 text-center sm:gap-6 md:flex-row md:text-left">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-black sm:h-10 sm:w-10 dark:border-[#1e293b]">
                                <img src={logoUrl} alt={`${appName} Logo`} className="h-full w-full object-cover" />
                            </div>
                            <span className="text-lg font-extrabold tracking-tight text-slate-900 uppercase sm:text-xl dark:text-white">
                                {appName}
                            </span>
                        </div>

                        <div className="text-center md:text-right">
                            <div className="mb-3.5 flex items-center justify-center gap-5 md:justify-end">
                                <a href="#" className="p-1 text-slate-400 transition-colors hover:text-[#ff8a5c]" aria-label="Twitter">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="#" className="p-1 text-slate-400 transition-colors hover:text-[#ff8a5c]" aria-label="GitHub">
                                    <Github className="h-5 w-5" />
                                </a>
                                <a href="#" className="p-1 text-slate-400 transition-colors hover:text-[#ff8a5c]" aria-label="LinkedIn">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </div>
                            <p className="text-xs text-slate-500 sm:text-sm">
                                &copy; {new Date().getFullYear()} {appName}. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
