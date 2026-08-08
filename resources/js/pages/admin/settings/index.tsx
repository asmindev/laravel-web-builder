import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, router, usePage } from '@inertiajs/react';
import { Save, Settings, Phone, Building2, CheckCircle2, MessageSquare } from 'lucide-react';

interface SettingsProps {
    settings: {
        app_name: string;
        admin_whatsapp: string;
    };
}

export default function AdminSettingsIndex({ settings }: SettingsProps) {
    const flash = usePage<{ flash?: { type?: string; content?: string } }>().props.flash;
    
    const [appName, setAppName] = useState(settings.app_name || 'Nusantara Engine');
    const [adminWhatsapp, setAdminWhatsapp] = useState(settings.admin_whatsapp || '6281234567890');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            route('admin.settings.update'),
            {
                app_name: appName,
                admin_whatsapp: adminWhatsapp,
            },
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Cleaned up WhatsApp number for preview link
    const cleanWaNumber = adminWhatsapp.replace(/[^0-9]/g, '');

    return (
        <AdminLayout title="Pengaturan Sistem">
            <Head title="Pengaturan Sistem — Admin Dashboard" />

            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Settings className="size-6 text-[#2cb1bc]" /> Pengaturan Sistem
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola konfigurasi global aplikasi, nama platform, dan kontak WhatsApp bantuan Administrator.
                    </p>
                </div>

                {/* Flash Success Alert */}
                {flash?.content && flash.type === 'success' && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                        <CheckCircle2 className="size-5 shrink-0" />
                        <span>{flash.content}</span>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Settings Form (Spans 2 cols) */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Informasi Platform & Kontak</CardTitle>
                            <CardDescription>
                                Perubahan di sini akan langsung berdampak pada nama di sidebar, halaman error, dan kontak bantuan WhatsApp.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* App Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="app_name" className="flex items-center gap-1.5 font-semibold">
                                        <Building2 className="size-4 text-slate-500" /> Nama Aplikasi / Platform
                                    </Label>
                                    <Input
                                        id="app_name"
                                        value={appName}
                                        onChange={(e) => setAppName(e.target.value)}
                                        placeholder="Contoh: Nusantara Engine"
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Nama ini akan ditampilkan pada Sidebar Header, Favicon Title, dan Card Peringatan Pelanggaran.
                                    </p>
                                </div>

                                {/* Admin WhatsApp */}
                                <div className="space-y-2">
                                    <Label htmlFor="admin_whatsapp" className="flex items-center gap-1.5 font-semibold">
                                        <Phone className="size-4 text-slate-500" /> Nomor WhatsApp Admin Support
                                    </Label>
                                    <Input
                                        id="admin_whatsapp"
                                        value={adminWhatsapp}
                                        onChange={(e) => setAdminWhatsapp(e.target.value)}
                                        placeholder="Contoh: 6281234567890"
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Gunakan format internasional tanpa spasi atau karakter khusus (contoh: <code>6281234567890</code>).
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={isSubmitting} className="bg-[#2cb1bc] hover:bg-[#2597a0] text-slate-900 font-bold gap-1.5">
                                        <Save className="size-4" /> {isSubmitting ? 'Simpan...' : 'Simpan Pengaturan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Live Preview Card (Spans 1 col) */}
                    <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                <MessageSquare className="size-4 text-emerald-500" /> Preview WhatsApp Link
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <p className="text-muted-foreground">
                                Tautan WhatsApp yang akan dibuka saat user mengeklik tombol bantuan/upgrade:
                            </p>

                            <div className="rounded-lg border bg-background p-3 space-y-2 font-mono text-[11px] break-all">
                                <span className="text-muted-foreground">URL:</span>
                                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    https://wa.me/{cleanWaNumber}
                                </div>
                            </div>

                            <a
                                href={`https://wa.me/${cleanWaNumber}?text=Halo%20Admin%20${encodeURIComponent(appName)},%20saya%20butuh%20bantuan`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 text-xs transition-colors"
                            >
                                <MessageSquare className="size-3.5" /> Uji Coba WhatsApp
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
