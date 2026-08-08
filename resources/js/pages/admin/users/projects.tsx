import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, ExternalLink, Eye, FileCode, FolderOpen, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserProjectItem {
    id: number;
    name: string;
    slug: string;
    description?: string;
    published: boolean;
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
    projects: UserProjectItem[];
}

export default function UserProjects({ targetUser, projects }: UserProjectsProps) {
    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'starter':
                return <Badge variant="outline" className="border-slate-300 text-slate-700 dark:text-slate-300">Starter (2 Proyek)</Badge>;
            case 'basic':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Basic (5 Proyek)</Badge>;
            case 'pro':
                return <Badge className="bg-[#2cb1bc] text-slate-900 font-bold">Pro (10 Proyek)</Badge>;
            case 'business':
                return <Badge className="bg-[#ff8a5c] text-white font-bold">Business (15 Proyek)</Badge>;
            default:
                return <Badge variant="outline">{plan}</Badge>;
        }
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight">Proyek Milik User — {targetUser.name}</h2>}>
            <Head title={`Admin — Proyek ${targetUser.name}`} />

            <div className="space-y-6">
                {/* Back Button & User Details Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href={route('admin.users.index')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" /> Kembali ke Kelola User
                    </Link>
                </div>

                {/* User Summary Card */}
                <Card className="border-[#2cb1bc]/30 bg-gradient-to-r from-[#2cb1bc]/5 via-transparent to-[#ff8a5c]/5">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-2xl font-bold">{targetUser.name}</CardTitle>
                                    {targetUser.roles.includes('admin') && (
                                        <Badge className="bg-emerald-600 text-white gap-1"><ShieldCheck className="size-3" /> Admin</Badge>
                                    )}
                                </div>
                                <CardDescription className="text-sm mt-1">{targetUser.email}</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div>{getPlanBadge(targetUser.plan)}</div>
                                <div className="text-xs font-mono font-bold bg-muted border px-3 py-1.5 rounded-md">
                                    Penggunaan: <span className="text-[#2cb1bc]">{projects.length} / {targetUser.project_limit} Proyek</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Projects Grid */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FolderOpen className="size-5 text-[#2cb1bc]" /> Daftar Proyek ({projects.length})
                    </h3>

                    {projects.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <FolderOpen className="size-12 mb-3 text-muted-foreground/50" />
                                <p className="font-semibold">Belum Ada Proyek</p>
                                <p className="text-xs mt-1">User ini belum membuat proyek apa pun di platform.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((p) => (
                                <Card key={p.id} className="flex flex-col justify-between hover:border-[#2cb1bc]/50 transition-all shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                                    {p.name}
                                                </CardTitle>
                                                {p.description && (
                                                    <CardDescription className="line-clamp-2 text-xs">
                                                        {p.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <Badge variant={p.published ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                                                {p.published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-b py-2">
                                            <span className="flex items-center gap-1">
                                                <FileCode className="size-3.5" /> {p.files_count} files
                                            </span>
                                            <span className="flex items-center gap-1 font-mono text-[11px]">
                                                {p.created_at}
                                            </span>
                                        </div>

                                        {/* Action Buttons (Strict Secret Mode: Preview and Live Only) */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button variant="outline" size="sm" asChild className="h-8 text-xs flex-1">
                                                <a href={route('projects.preview', p.slug)} title="Preview Project">
                                                    <Eye className="size-3.5 mr-1" /> Preview
                                                </a>
                                            </Button>
                                            {p.published && (
                                                <Button size="sm" asChild className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-1" title="View Live">
                                                    <a href={route('app.preview', [p.slug])} target="_blank" rel="noopener noreferrer">
                                                        <Globe className="size-3.5 mr-1" /> Live
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
