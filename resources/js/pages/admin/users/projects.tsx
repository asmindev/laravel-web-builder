import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileCode, FolderOpen, Globe, ShieldAlert, Ban, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserProjectItem {
    id: number;
    name: string;
    slug: string;
    description?: string;
    published: boolean;
    is_suspended: boolean;
    suspension_reason?: string;
    suspended_at?: string;
    template?: string;
    files_count: number;
    assets_count: number;
    created_at: string;
    updated_at: string;
}

interface TargetUser {
    id: number;
    name: string;
    email: string;
    plan: string;
    plan_name: string;
    project_limit: number | string;
    roles: string[];
}

interface UserProjectsProps {
    targetUser: TargetUser;
    userProjects?: UserProjectItem[];
    projects?: UserProjectItem[];
}

export default function UserProjects({ targetUser, userProjects, projects: legacyProjects }: UserProjectsProps) {
    const projects = userProjects || legacyProjects || [];
    
    // Suspend Modal State
    const [selectedProject, setSelectedProject] = useState<UserProjectItem | null>(null);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'starter':
                return <Badge variant="outline" className="border-slate-300 text-slate-700 dark:text-slate-300">Starter (2 Proyek)</Badge>;
            case 'basic':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Basic (5 Proyek)</Badge>;
            case 'pro':
                return <Badge className="bg-[#2cb1bc] text-slate-900 font-bold">Pro (10 Proyek)</Badge>;
            case 'business':
                return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold">Business (15 Proyek)</Badge>;
            default:
                return <Badge variant="outline">{plan}</Badge>;
        }
    };

    const handleOpenSuspendModal = (project: UserProjectItem) => {
        setSelectedProject(project);
        setReason(project.suspension_reason || 'Terindikasi melanggar Syarat & Ketentuan Layanan.');
        setIsSuspendModalOpen(true);
    };

    const handleToggleSuspend = (project: UserProjectItem) => {
        if (project.is_suspended) {
            // Unsuspend directly
            if (confirm(`Apakah Anda yakin ingin mencabut penangguhan proyek "${project.name}"?`)) {
                router.post(route('admin.projects.toggle-suspend', project.id));
            }
        } else {
            handleOpenSuspendModal(project);
        }
    };

    const submitSuspend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject) return;

        setIsSubmitting(true);
        router.post(route('admin.projects.toggle-suspend', selectedProject.id), {
            reason: reason,
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setIsSuspendModalOpen(false);
                setSelectedProject(null);
            }
        });
    };

    return (
        <AdminLayout title={`Proyek ${targetUser.name}`}>
            <Head title={`Proyek ${targetUser.name} — Admin Dashboard`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild className="size-8">
                                <Link href={route('admin.users.index')}>
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Proyek User: {targetUser.name}
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground pl-10">
                            Daftar seluruh aplikasi/proyek yang dimiliki oleh {targetUser.email}
                        </p>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.users.index')}>
                            <ArrowLeft className="size-4 mr-1" /> Kembali ke Daftar User
                        </Link>
                    </Button>
                </div>

                {/* Target User Info Summary */}
                <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-[#2cb1bc]/10 text-[#2cb1bc] font-bold text-base uppercase">
                                    {targetUser.name ? targetUser.name.slice(0, 2) : 'US'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{targetUser.name}</h3>
                                        {getPlanBadge(targetUser.plan)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{targetUser.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Proyek</p>
                                    <p className="font-bold text-base text-slate-900 dark:text-white">
                                        {projects.length} / {targetUser.project_limit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Status Pelanggaran</p>
                                    <p className="font-bold text-base text-slate-900 dark:text-white">
                                        {projects.filter(p => p.is_suspended).length > 0 ? (
                                            <span className="text-red-600 dark:text-red-400">
                                                {projects.filter(p => p.is_suspended).length} Ditangguhkan
                                            </span>
                                        ) : (
                                            <span className="text-emerald-600 dark:text-emerald-400">Normal</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Projects List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Daftar Aplikasi ({projects.length})
                    </h2>

                    {projects.length === 0 ? (
                        <Card className="py-12 text-center">
                            <CardContent className="space-y-2">
                                <FolderOpen className="size-10 mx-auto text-muted-foreground/50" />
                                <p className="font-semibold">Belum Ada Proyek</p>
                                <p className="text-xs mt-1">User ini belum membuat proyek apa pun di platform.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((p) => (
                                <Card 
                                    key={p.id} 
                                    className={`flex flex-col justify-between transition-all shadow-sm ${
                                        p.is_suspended 
                                            ? 'border-red-500/50 bg-red-500/5 dark:bg-red-950/10' 
                                            : 'hover:border-[#2cb1bc]/50'
                                    }`}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    {p.name}
                                                </CardTitle>
                                                {p.description && (
                                                    <CardDescription className="line-clamp-2 text-xs">
                                                        {p.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            
                                            {p.is_suspended ? (
                                                <Badge variant="destructive" className="bg-red-600 text-white font-bold text-[10px] shrink-0 animate-pulse">
                                                    Pelanggaran
                                                </Badge>
                                            ) : (
                                                <Badge variant={p.published ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                                                    {p.published ? 'Published' : 'Draft'}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Violation Details if Suspended */}
                                        {p.is_suspended && (
                                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-700 dark:text-red-300 space-y-1">
                                                <div className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                                                    <ShieldAlert className="size-3.5 shrink-0" /> Alasan Pelanggaran:
                                                </div>
                                                <p className="line-clamp-2 pl-4 italic">
                                                    "{p.suspension_reason || 'Terindikasi melanggar Syarat & Ketentuan Layanan.'}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-b py-2">
                                            <span className="flex items-center gap-1">
                                                <FileCode className="size-3.5" /> {p.files_count} files
                                            </span>
                                            <span className="flex items-center gap-1 font-mono text-[11px]">
                                                {p.created_at}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                {p.published && !p.is_suspended ? (
                                                    <Button size="sm" asChild className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white w-full" title="View Live">
                                                        <a href={route('app.preview', [p.slug])} target="_blank" rel="noopener noreferrer">
                                                            <Globe className="size-3.5 mr-1" /> View Live
                                                        </a>
                                                    </Button>
                                                ) : p.is_suspended ? (
                                                    <div className="text-xs text-red-600 dark:text-red-400 font-semibold italic text-center w-full py-1">
                                                        Situs Ditangguhkan
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-muted-foreground italic text-center w-full py-1">
                                                        Draft (Belum Dipublikasi)
                                                    </div>
                                                )}
                                            </div>

                                            {/* Admin Suspension Control Button */}
                                            <Button
                                                variant={p.is_suspended ? "outline" : "destructive"}
                                                size="sm"
                                                onClick={() => handleToggleSuspend(p)}
                                                className={`w-full h-8 text-xs font-semibold ${
                                                    p.is_suspended
                                                        ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                                }`}
                                            >
                                                {p.is_suspended ? (
                                                    <>
                                                        <CheckCircle className="size-3.5 mr-1 text-emerald-600" /> Pulihkan / Unsuspend
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban className="size-3.5 mr-1" /> Tandai Pelanggaran (Suspend)
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Suspend Reason Modal */}
            <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={submitSuspend}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <ShieldAlert className="size-5" /> Tandai Pelanggaran Aplikasi
                            </DialogTitle>
                            <DialogDescription>
                                Menangguhkan proyek <strong>"{selectedProject?.name}"</strong>. Pengunjung situs akan melihat card peringatan pelanggaran.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reason">Alasan Pelanggaran / Suspension Reason</Label>
                                <Input
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Contoh: Terindikasi konten ilegal / phishing."
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsSuspendModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isSubmitting}>
                                {isSubmitting ? 'Memproses...' : 'Tangguhkan Sekarang'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
