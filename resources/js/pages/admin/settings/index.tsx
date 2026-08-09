import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Save,
    Settings,
    Phone,
    Building2,
    CheckCircle2,
    MessageSquare,
    Sparkles,
    Layers,
    ListOrdered,
    Briefcase,
    FileText,
    CreditCard
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

interface LandingSettings {
    app_name: string;
    admin_whatsapp: string;
    
    // Hero
    hero_badge: string;
    hero_title_1: string;
    hero_title_2: string;
    hero_title_highlight: string;
    hero_subtitle: string;
    hero_prompt_demo: string;
    hero_prompt_suggestions: string[];

    // Fitur AI
    fitur_section_tag: string;
    fitur_title: string;
    fitur_subtitle: string;
    fitur_items: FiturItem[];

    // Cara Kerja
    cara_kerja_tag: string;
    cara_kerja_title: string;
    cara_kerja_subtitle: string;
    cara_kerja_steps: StepItem[];

    // Pricing
    pricing_section_tag: string;
    pricing_title: string;
    pricing_subtitle: string;
    pricing_starter_title: string;
    pricing_starter_subtitle: string;
    pricing_starter_price: string;
    pricing_starter_features: string[];
    pricing_pro_title: string;
    pricing_pro_subtitle: string;
    pricing_pro_price: string;
    pricing_pro_period: string;
    pricing_pro_features: string[];

    // Jasa Agensi
    agency_badge: string;
    agency_title: string;
    agency_description: string;

    // Terms
    terms_tag: string;
    terms_title: string;
    terms_subtitle: string;
    terms_items: TermItem[];
}

interface SettingsProps {
    settings: LandingSettings;
}

export default function AdminSettingsIndex({ settings }: SettingsProps) {
    const flash = usePage<{ flash?: { type?: string; content?: string } }>().props.flash;
    const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'fitur' | 'cara_kerja' | 'pricing' | 'jasa' | 'terms'>('general');
    
    // Form State
    const [form, setForm] = useState<LandingSettings>({
        app_name: settings.app_name || 'Nusantara Engine',
        admin_whatsapp: settings.admin_whatsapp || '6281234567890',
        
        hero_badge: settings.hero_badge || 'Engine Generasi Ke-3 Tersedia',
        hero_title_1: settings.hero_title_1 || 'Ketik Idenya,',
        hero_title_2: settings.hero_title_2 || 'AI Kami Buat',
        hero_title_highlight: settings.hero_title_highlight || 'Websitenya.',
        hero_subtitle: settings.hero_subtitle || '',
        hero_prompt_demo: settings.hero_prompt_demo || '',
        hero_prompt_suggestions: settings.hero_prompt_suggestions || ['Toko Sepatu Sneakers', 'Klinik Gigi Premium'],

        fitur_section_tag: settings.fitur_section_tag || '// fitur',
        fitur_title: settings.fitur_title || 'Yang Anda dapatkan',
        fitur_subtitle: settings.fitur_subtitle || '',
        fitur_items: settings.fitur_items || [],

        cara_kerja_tag: settings.cara_kerja_tag || '// cara kerja',
        cara_kerja_title: settings.cara_kerja_title || 'Tiga langkah untuk mulai',
        cara_kerja_subtitle: settings.cara_kerja_subtitle || '',
        cara_kerja_steps: settings.cara_kerja_steps || [],

        pricing_section_tag: settings.pricing_section_tag || '[ Akses Platform ]',
        pricing_title: settings.pricing_title || 'Pilih Paket Builder Anda',
        pricing_subtitle: settings.pricing_subtitle || '',
        pricing_starter_title: settings.pricing_starter_title || 'Starter',
        pricing_starter_subtitle: settings.pricing_starter_subtitle || '',
        pricing_starter_price: settings.pricing_starter_price || 'Rp 0',
        pricing_starter_features: settings.pricing_starter_features || [],
        pricing_pro_title: settings.pricing_pro_title || 'Pro Builder',
        pricing_pro_subtitle: settings.pricing_pro_subtitle || '',
        pricing_pro_price: settings.pricing_pro_price || 'Rp 149k',
        pricing_pro_period: settings.pricing_pro_period || '/bln',
        pricing_pro_features: settings.pricing_pro_features || [],

        agency_badge: settings.agency_badge || 'Opsi Terima Beres',
        agency_title: settings.agency_title || 'Tidak Punya Waktu Membuat Sendiri?',
        agency_description: settings.agency_description || '',

        terms_tag: settings.terms_tag || '// terms & conditions',
        terms_title: settings.terms_title || 'Terms & Conditions',
        terms_subtitle: settings.terms_subtitle || '',
        terms_items: settings.terms_items || [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (key: keyof LandingSettings, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleFiturChange = (index: number, field: keyof FiturItem, value: string) => {
        const updated = [...form.fitur_items];
        updated[index] = { ...updated[index], [field]: value };
        setForm((prev) => ({ ...prev, fitur_items: updated }));
    };

    const handleStepChange = (index: number, field: keyof StepItem, value: string) => {
        const updated = [...form.cara_kerja_steps];
        updated[index] = { ...updated[index], [field]: value };
        setForm((prev) => ({ ...prev, cara_kerja_steps: updated }));
    };

    const handleTermChange = (index: number, field: keyof TermItem, value: string) => {
        const updated = [...form.terms_items];
        updated[index] = { ...updated[index], [field]: value };
        setForm((prev) => ({ ...prev, terms_items: updated }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            route('admin.settings.update'),
            form as any,
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const cleanWaNumber = form.admin_whatsapp.replace(/[^0-9]/g, '');

    const tabs = [
        { id: 'general', label: 'Umum & WA', icon: Building2 },
        { id: 'hero', label: 'Hero Section', icon: Sparkles },
        { id: 'fitur', label: 'Fitur AI', icon: Layers },
        { id: 'cara_kerja', label: 'Cara Kerja', icon: ListOrdered },
        { id: 'pricing', label: 'Harga / Paket', icon: CreditCard },
        { id: 'jasa', label: 'Jasa Agensi', icon: Briefcase },
        { id: 'terms', label: 'Terms', icon: FileText },
    ] as const;

    return (
        <AdminLayout title="Pengaturan Sistem & Landing Page">
            <Head title="Pengaturan Landing Page — Admin Dashboard" />

            <div className="max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <Settings className="size-6 text-[#2cb1bc]" /> Pengaturan Konten Landing Page
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola seluruh teks, judul hero, fitur, cara kerja, harga paket, jasa agensi, dan syarat ketentuan landing page.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#2cb1bc] hover:bg-[#2597a0] text-slate-900 font-bold gap-1.5 shrink-0"
                    >
                        <Save className="size-4" /> {isSubmitting ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                    </Button>
                </div>

                {/* Flash Success Alert */}
                {flash?.content && flash.type === 'success' && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                        <CheckCircle2 className="size-5 shrink-0" />
                        <span>{flash.content}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="w-full space-y-6">
                        {/* Tab Buttons Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            {tabs.map((tab) => {
                                const IconComp = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <IconComp className={`size-3.5 ${isActive ? 'text-[#2cb1bc]' : ''}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* TAB 1: General & WA */}
                        {activeTab === 'general' && (
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-base">Informasi Utama Platform</CardTitle>
                                        <CardDescription>Nama brand aplikasi dan nomor WhatsApp kontak bantuan Admin.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="app_name" className="flex items-center gap-1.5 font-semibold">
                                                <Building2 className="size-4 text-slate-500" /> Nama Aplikasi / Brand
                                            </Label>
                                            <Input
                                                id="app_name"
                                                value={form.app_name}
                                                onChange={(e) => handleChange('app_name', e.target.value)}
                                                placeholder="Contoh: Nusantara Engine"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="admin_whatsapp" className="flex items-center gap-1.5 font-semibold">
                                                <Phone className="size-4 text-slate-500" /> Nomor WhatsApp Admin Support
                                            </Label>
                                            <Input
                                                id="admin_whatsapp"
                                                value={form.admin_whatsapp}
                                                onChange={(e) => handleChange('admin_whatsapp', e.target.value)}
                                                placeholder="Contoh: 6281234567890"
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                            <MessageSquare className="size-4 text-emerald-500" /> Preview WhatsApp Link
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-xs">
                                        <div className="rounded-lg border bg-background p-3 font-mono text-[11px] break-all">
                                            <span className="text-muted-foreground">URL:</span>
                                            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                https://wa.me/{cleanWaNumber}
                                            </div>
                                        </div>
                                        <a
                                            href={`https://wa.me/${cleanWaNumber}?text=Halo%20Admin%20${encodeURIComponent(form.app_name)},%20saya%20butuh%20bantuan`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 text-xs transition-colors"
                                        >
                                            <MessageSquare className="size-3.5" /> Uji Coba WhatsApp
                                        </a>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* TAB 2: Hero Section */}
                        {activeTab === 'hero' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Bagian Hero (Bagian Atas Landing Page)</CardTitle>
                                    <CardDescription>Atur badge, judul bertingkat, deskripsi, dan prompt demo.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="hero_badge">Text Badge Atas</Label>
                                        <Input
                                            id="hero_badge"
                                            value={form.hero_badge}
                                            onChange={(e) => handleChange('hero_badge', e.target.value)}
                                            placeholder="Contoh: Engine Generasi Ke-3 Tersedia"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="hero_title_1">Judul Baris 1</Label>
                                            <Input
                                                id="hero_title_1"
                                                value={form.hero_title_1}
                                                onChange={(e) => handleChange('hero_title_1', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hero_title_2">Judul Baris 2</Label>
                                            <Input
                                                id="hero_title_2"
                                                value={form.hero_title_2}
                                                onChange={(e) => handleChange('hero_title_2', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hero_title_highlight">Judul Teks Gradasi</Label>
                                            <Input
                                                id="hero_title_highlight"
                                                value={form.hero_title_highlight}
                                                onChange={(e) => handleChange('hero_title_highlight', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hero_subtitle">Deskripsi Hero</Label>
                                        <Textarea
                                            id="hero_subtitle"
                                            rows={3}
                                            value={form.hero_subtitle}
                                            onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hero_prompt_demo">Teks Simulasi Prompt AI Default</Label>
                                        <Textarea
                                            id="hero_prompt_demo"
                                            rows={3}
                                            value={form.hero_prompt_demo}
                                            onChange={(e) => handleChange('hero_prompt_demo', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* TAB 3: Fitur AI */}
                        {activeTab === 'fitur' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Section Fitur AI (#fitur)</CardTitle>
                                    <CardDescription>Atur judul section dan 4 kartu fitur utama.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="fitur_section_tag">Tag Subtitle</Label>
                                            <Input
                                                id="fitur_section_tag"
                                                value={form.fitur_section_tag}
                                                onChange={(e) => handleChange('fitur_section_tag', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="fitur_title">Judul Section Fitur</Label>
                                            <Input
                                                id="fitur_title"
                                                value={form.fitur_title}
                                                onChange={(e) => handleChange('fitur_title', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fitur_subtitle">Deskripsi Section Fitur</Label>
                                        <Input
                                            id="fitur_subtitle"
                                            value={form.fitur_subtitle}
                                            onChange={(e) => handleChange('fitur_subtitle', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <Label className="text-sm font-bold">Daftar Kartu Fitur (4 Items)</Label>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {form.fitur_items.map((item, idx) => (
                                                <Card key={idx} className="bg-slate-50/50 dark:bg-slate-900/40">
                                                    <CardHeader className="py-3 px-4">
                                                        <CardTitle className="text-xs font-bold uppercase text-[#2cb1bc]">
                                                            Kartu Fitur #{idx + 1}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3 p-4 pt-0">
                                                        <div>
                                                            <Label className="text-[11px]">Tag Code / File</Label>
                                                            <Input
                                                                value={item.tag}
                                                                onChange={(e) => handleFiturChange(idx, 'tag', e.target.value)}
                                                                className="h-8 text-xs font-mono"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[11px]">Judul Fitur</Label>
                                                            <Input
                                                                value={item.title}
                                                                onChange={(e) => handleFiturChange(idx, 'title', e.target.value)}
                                                                className="h-8 text-xs font-bold"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[11px]">Deskripsi Fitur</Label>
                                                            <Textarea
                                                                value={item.description}
                                                                onChange={(e) => handleFiturChange(idx, 'description', e.target.value)}
                                                                rows={2}
                                                                className="text-xs"
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* TAB 4: Cara Kerja */}
                        {activeTab === 'cara_kerja' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Section Cara Kerja (#cara-kerja)</CardTitle>
                                    <CardDescription>Atur 3 langkah memulai project di platform.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="cara_kerja_tag">Tag Subtitle</Label>
                                            <Input
                                                id="cara_kerja_tag"
                                                value={form.cara_kerja_tag}
                                                onChange={(e) => handleChange('cara_kerja_tag', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="cara_kerja_title">Judul Section Cara Kerja</Label>
                                            <Input
                                                id="cara_kerja_title"
                                                value={form.cara_kerja_title}
                                                onChange={(e) => handleChange('cara_kerja_title', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cara_kerja_subtitle">Deskripsi Section Cara Kerja</Label>
                                        <Input
                                            id="cara_kerja_subtitle"
                                            value={form.cara_kerja_subtitle}
                                            onChange={(e) => handleChange('cara_kerja_subtitle', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <Label className="text-sm font-bold">Daftar Langkah (3 Steps)</Label>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            {form.cara_kerja_steps.map((step, idx) => (
                                                <Card key={idx} className="bg-slate-50/50 dark:bg-slate-900/40">
                                                    <CardHeader className="py-3 px-4">
                                                        <CardTitle className="text-xs font-bold uppercase text-[#ff8a5c]">
                                                            Langkah #{step.step || idx + 1}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3 p-4 pt-0">
                                                        <div>
                                                            <Label className="text-[11px]">Judul Langkah</Label>
                                                            <Input
                                                                value={step.title}
                                                                onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                                                                className="h-8 text-xs font-bold"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[11px]">Deskripsi Langkah</Label>
                                                            <Textarea
                                                                value={step.description}
                                                                onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                                                                rows={3}
                                                                className="text-xs"
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* TAB 5: Pricing */}
                        {activeTab === 'pricing' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Section Harga & Paket Langganan (#harga)</CardTitle>
                                    <CardDescription>Atur judul section dan isi fitur untuk Paket Starter & Pro Builder.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="pricing_section_tag">Tag Subtitle Section</Label>
                                            <Input
                                                id="pricing_section_tag"
                                                value={form.pricing_section_tag}
                                                onChange={(e) => handleChange('pricing_section_tag', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="pricing_title">Judul Section Harga</Label>
                                            <Input
                                                id="pricing_title"
                                                value={form.pricing_title}
                                                onChange={(e) => handleChange('pricing_title', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pricing_subtitle">Deskripsi Section Harga</Label>
                                        <Input
                                            id="pricing_subtitle"
                                            value={form.pricing_subtitle}
                                            onChange={(e) => handleChange('pricing_subtitle', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2 pt-2">
                                        {/* Starter Card Setting */}
                                        <Card className="bg-slate-50/50 dark:bg-slate-900/40">
                                            <CardHeader className="py-3 px-4">
                                                <CardTitle className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">
                                                    Paket Starter (Gratis)
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 p-4 pt-0">
                                                <div>
                                                    <Label className="text-[11px]">Nama Paket</Label>
                                                    <Input
                                                        value={form.pricing_starter_title}
                                                        onChange={(e) => handleChange('pricing_starter_title', e.target.value)}
                                                        className="h-8 text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[11px]">Subtitle Paket</Label>
                                                    <Input
                                                        value={form.pricing_starter_subtitle}
                                                        onChange={(e) => handleChange('pricing_starter_subtitle', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[11px]">Harga</Label>
                                                    <Input
                                                        value={form.pricing_starter_price}
                                                        onChange={(e) => handleChange('pricing_starter_price', e.target.value)}
                                                        className="h-8 text-xs font-mono font-bold"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Pro Card Setting */}
                                        <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-[#2cb1bc]/40">
                                            <CardHeader className="py-3 px-4">
                                                <CardTitle className="text-xs font-bold uppercase text-[#2cb1bc]">
                                                    Paket Pro Builder (Berbayar)
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 p-4 pt-0">
                                                <div>
                                                    <Label className="text-[11px]">Nama Paket</Label>
                                                    <Input
                                                        value={form.pricing_pro_title}
                                                        onChange={(e) => handleChange('pricing_pro_title', e.target.value)}
                                                        className="h-8 text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[11px]">Subtitle Paket</Label>
                                                    <Input
                                                        value={form.pricing_pro_subtitle}
                                                        onChange={(e) => handleChange('pricing_pro_subtitle', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-[11px]">Harga</Label>
                                                        <Input
                                                            value={form.pricing_pro_price}
                                                            onChange={(e) => handleChange('pricing_pro_price', e.target.value)}
                                                            className="h-8 text-xs font-mono font-bold text-[#2cb1bc]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-[11px]">Periode</Label>
                                                        <Input
                                                            value={form.pricing_pro_period}
                                                            onChange={(e) => handleChange('pricing_pro_period', e.target.value)}
                                                            className="h-8 text-xs font-mono"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* TAB 6: Jasa Agensi */}
                        {activeTab === 'jasa' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Section Jasa Agensi / Kustom (#jasa)</CardTitle>
                                    <CardDescription>Atur penawaran pembuatan website kustom terima beres.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="agency_badge">Text Badge</Label>
                                        <Input
                                            id="agency_badge"
                                            value={form.agency_badge}
                                            onChange={(e) => handleChange('agency_badge', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="agency_title">Judul Section Agensi</Label>
                                        <Input
                                            id="agency_title"
                                            value={form.agency_title}
                                            onChange={(e) => handleChange('agency_title', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="agency_description">Deskripsi Penawaran Agensi</Label>
                                        <Textarea
                                            id="agency_description"
                                            rows={4}
                                            value={form.agency_description}
                                            onChange={(e) => handleChange('agency_description', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* TAB 7: Terms & Conditions */}
                        {activeTab === 'terms' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Section Terms & Conditions (#terms)</CardTitle>
                                    <CardDescription>Atur poin-poin syarat dan ketentuan penggunaan platform.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="terms_tag">Tag Subtitle</Label>
                                            <Input
                                                id="terms_tag"
                                                value={form.terms_tag}
                                                onChange={(e) => handleChange('terms_tag', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="terms_title">Judul Section Terms</Label>
                                            <Input
                                                id="terms_title"
                                                value={form.terms_title}
                                                onChange={(e) => handleChange('terms_title', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="terms_subtitle">Deskripsi Section Terms</Label>
                                        <Input
                                            id="terms_subtitle"
                                            value={form.terms_subtitle}
                                            onChange={(e) => handleChange('terms_subtitle', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <Label className="text-sm font-bold">Pasal Terms & Conditions (3 Items)</Label>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            {form.terms_items.map((term, idx) => (
                                                <Card key={idx} className="bg-slate-50/50 dark:bg-slate-900/40">
                                                    <CardHeader className="py-3 px-4">
                                                        <CardTitle className="text-xs font-bold uppercase text-slate-500">
                                                            Pasal {term.number || `§${idx + 1}`}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3 p-4 pt-0">
                                                        <div>
                                                            <Label className="text-[11px]">Judul Pasal</Label>
                                                            <Input
                                                                value={term.title}
                                                                onChange={(e) => handleTermChange(idx, 'title', e.target.value)}
                                                                className="h-8 text-xs font-bold"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[11px]">Isi Ketentuan</Label>
                                                            <Textarea
                                                                value={term.description}
                                                                onChange={(e) => handleTermChange(idx, 'description', e.target.value)}
                                                                rows={3}
                                                                className="text-xs"
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#2cb1bc] hover:bg-[#2597a0] text-slate-900 font-bold gap-1.5"
                        >
                            <Save className="size-4" /> {isSubmitting ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
