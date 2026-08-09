import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import type { Project } from '@/types/project';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    Copy,
    ExternalLink,
    FileCode,
    FolderOpen,
    Globe,
    Layout,
    Loader2,
    MoreHorizontal,
    Plus,
    Search,
    ShieldAlert,
    Sparkles,
    Trash2,
    Edit3,
    Eye,
    FileArchive,
    Code2,
    Database,
    Terminal,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface IndexProps {
    projects: Project[];
}

const templates = [
    { id: 'landing', icon: Layout, name: 'Landing Page', description: 'A simple landing page layout' },
    { id: 'node-backend', icon: Terminal, name: 'Node.js Backend', description: 'Express API with routes' },
];

export default function ProjectIndex({ projects }: IndexProps) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [template, setTemplate] = useState('landing');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);

    const filtered = projects.filter((p) => {
        const match = p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase());
        if (!match) return false;
        if (filter === 'published') return p.published;
        if (filter === 'draft') return !p.published;
        return true;
    });

    const pageProps = usePage<{ auth?: any; enhanced_prompt?: string }>().props;
    const auth = pageProps.auth;
    const [enhancing, setEnhancing] = useState(false);
    const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [enhanceError, setEnhanceError] = useState<string | null>(null);

    // Auto-open create project modal when URL has ?create=true
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('create') === 'true') {
                setShowCreate(true);
            }
        }
    }, []);

    const handleEnhancePrompt = () => {
        if (!name || !description) return;
        setEnhancing(true);
        setEnhancedPrompt(null);
        setEnhanceError(null);

        router.post(
            route('ai.enhance-prompt'),
            {
                app_name: name,
                app_description: description,
                app_type: template === 'landing' ? 'landing' : 'nodejs',
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const result = (page.props as any)?.flash?.enhanced_prompt || (page.props as any)?.enhanced_prompt;
                    if (result) {
                        setEnhancedPrompt(result);
                    }
                },
                onError: (errs) => {
                    console.error('Failed to enhance prompt', errs);
                    const firstMsg = Object.values(errs)[0];
                    setEnhanceError(typeof firstMsg === 'string' ? firstMsg : 'Gagal memproses prompt AI');
                },
                onFinish: () => {
                    setEnhancing(false);
                },
            },
        );
    };

    const copyToClipboard = () => {
        if (enhancedPrompt) {
            navigator.clipboard.writeText(enhancedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            route('projects.store'),
            { name, description, template },
            {
                onSuccess: () => {
                    setShowCreate(false);
                    setName('');
                    setDescription('');
                    setTemplate('landing');
                    setEnhancedPrompt(null);
                    setErrors({});
                },
                onError: (errs) => {
                    setErrors(errs);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AdminLayout header={<h2 className="text-xl leading-tight font-semibold">Projects</h2>}>
            <Head title="Projects" />

            {/* Quota Limit Warning Banner */}
            {auth?.user && auth.user.can_create_project === false && (
                <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#ff8a5c]/40 bg-[#ff8a5c]/10 p-4 text-[#e86a38] shadow-sm sm:flex-row sm:items-center dark:text-[#ff8a5c]">
                    <div className="flex items-center gap-3">
                        <Sparkles className="size-5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold">
                                Batas Proyek Tercapai ({auth.user.projects_count} / {auth.user.project_limit} Proyek — Paket {auth.user.plan_name})
                            </p>
                            <p className="text-xs opacity-90">
                                Anda telah mencapai batas maksimal upload proyek untuk paket Anda. Upgrade ke Basic, Pro, atau Business untuk menambah
                                kuota proyek.
                            </p>
                        </div>
                    </div>
                    <a
                        href={`https://wa.me/${(usePage<{ app_settings?: { admin_whatsapp: string } }>().props.app_settings?.admin_whatsapp || '6281234567890').replace(/[^0-9]/g, '')}?text=Halo%20Admin,%20saya%20ingin%20upgrade%20paket%20proyek%20saya`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-[#ff8a5c] px-4 py-2 text-xs font-bold text-white shadow transition-colors hover:bg-[#e86a38]"
                    >
                        Hubungi Admin (Upgrade)
                    </a>
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="pl-8" />
                </div>
                <div className="flex items-center gap-2">
                    {auth?.user && (
                        <div className="mr-2 hidden rounded-full border border-border bg-muted px-3 py-1.5 font-mono text-xs font-semibold md:block">
                            Kuotamu:{' '}
                            <span className="font-bold text-primary">
                                {auth.user.projects_count} / {auth.user.project_limit} Proyek
                            </span>{' '}
                            ({auth.user.plan_name})
                        </div>
                    )}
                    {(['all', 'published', 'draft'] as const).map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                    <Button onClick={() => setShowCreate(true)} disabled={auth?.user?.can_create_project === false}>
                        <Plus /> New Project
                    </Button>
                </div>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-h-[90vh] min-w-6xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Project</DialogTitle>
                        <DialogDescription>Name your project, pick a template, or generate a tailored Gemini Prompt.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="space-y-5 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="My Awesome App"
                                    required
                                    autoFocus
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description <span className="text-muted-foreground">(optional)</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What is this project about? (e.g. Kasir toko dan stok barang)"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Template</Label>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {templates.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => setTemplate(tpl.id)}
                                            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                                                template === tpl.id ? 'border-primary ring-1 ring-primary' : ''
                                            }`}
                                        >
                                            <div
                                                className={`mt-0.5 rounded-md border p-1.5 ${template === tpl.id ? 'bg-primary text-primary-foreground' : ''}`}
                                            >
                                                <tpl.icon className="size-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{tpl.name}</div>
                                                <div className="text-xs text-muted-foreground">{tpl.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Gemini Prompt Enhancer Action Section */}
                            <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                        <Sparkles className="size-4 text-amber-500" />
                                        <span>Gemini Prompt Enhancer</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5 text-xs"
                                        disabled={!name || !description || enhancing}
                                        onClick={handleEnhancePrompt}
                                    >
                                        {enhancing ? (
                                            <>
                                                <Loader2 className="size-3.5 animate-spin" /> Enhancing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="size-3.5 text-amber-500" /> Enhance Prompt with Gemini
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {enhanceError && (
                                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                                        <ShieldAlert className="size-4 shrink-0" />
                                        <span>{enhanceError}</span>
                                    </div>
                                )}

                                {enhancedPrompt && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="size-3.5" /> Prompt Generated!
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 gap-1 text-xs"
                                                    onClick={copyToClipboard}
                                                >
                                                    {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                                                    {copied ? 'Copied!' : 'Copy Prompt'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="h-7 gap-1 bg-[#2cb1bc] text-xs font-bold text-slate-900 hover:bg-[#2597a0]"
                                                    asChild
                                                >
                                                    <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="size-3" /> Buka Gemini
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                        <Textarea value={enhancedPrompt} readOnly className="h-44 resize-none bg-background font-mono text-xs" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter showCloseButton className="mt-6">
                            <Button type="submit" className="min-w-28" disabled={processing}>
                                {processing ? <Loader2 className="size-4 animate-spin" /> : 'Create Project'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-16">
                        <FolderOpen className="size-12 text-muted-foreground" />
                        <div className="text-center">
                            <CardTitle className="mb-1">{search || filter !== 'all' ? 'No matching projects' : 'No projects yet'}</CardTitle>
                            <Card className="p-4">
                                <CardDescription>
                                    {search || filter !== 'all' ? 'Try a different search or filter.' : 'Create your first project to get started.'}
                                </CardDescription>
                            </Card>
                        </div>
                        {!search && filter === 'all' && (
                            <Button onClick={() => setShowCreate(true)}>
                                <Plus /> Create Project
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((project) => (
                        <Card
                            key={project.id}
                            className={`group flex flex-col justify-between ${project.is_suspended ? 'border-red-500/50 bg-red-500/5 dark:bg-red-950/10' : ''}`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-bold">
                                            {project.is_suspended ? (
                                                <span className="text-slate-700 dark:text-slate-300">{project.name}</span>
                                            ) : (
                                                <a href={route('projects.show', project.slug)} className="hover:underline">
                                                    {project.name}
                                                </a>
                                            )}
                                        </CardTitle>
                                        {project.description && <CardDescription className="line-clamp-2">{project.description}</CardDescription>}
                                    </div>

                                    {project.is_suspended ? (
                                        <Badge variant="destructive" className="shrink-0 animate-pulse bg-red-600 text-[10px] font-bold text-white">
                                            Pelanggaran
                                        </Badge>
                                    ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8 p-0">
                                                    <MoreHorizontal className="size-4" />
                                                    <span className="sr-only">Buka menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52">
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('projects.show', project.slug)} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                                        <Edit3 className="size-4 text-primary" /> Buka Editor Code
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('projects.preview', project.slug)} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                                        <Eye className="size-4 text-indigo-500" /> Preview App
                                                    </Link>
                                                </DropdownMenuItem>
                                                {project.published && (
                                                    <DropdownMenuItem asChild>
                                                        <a href={route('app.preview', [project.slug])} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                                            <Globe className="size-4 text-emerald-500" /> View Live Site
                                                        </a>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <a href={`/projects/${project.slug}/export-zip`} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                                        <FileArchive className="size-4 text-emerald-500" /> Export Full ZIP (MySQL)
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a href={`/projects/${project.slug}/export-db`} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                                        <Database className="size-4 text-cyan-500" /> Download Database SQL (MySQL Dump)
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a href={`/projects/${project.slug}/export-file?type=nodejs`} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                                        <FileCode className="size-4 text-sky-500" /> Download Node.js (index.js)
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a href={`/projects/${project.slug}/export-file?type=index`} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                                        <Code2 className="size-4 text-amber-500" /> Download Index (views/index)
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-red-600 dark:text-red-400 focus:text-red-600"
                                                    onClick={() => setDeletingProject(project)}
                                                >
                                                    <Trash2 className="size-4 text-red-500" /> Hapus Project
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {project.is_suspended && (
                                    <div className="space-y-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                                        <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                                            <ShieldAlert className="size-4 shrink-0" />
                                            <span>Ditangguhkan (Pelanggaran)</span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed opacity-90">
                                            Aplikasi ditangguhkan oleh Admin karena melanggar Syarat & Ketentuan Layanan.
                                        </p>
                                        {project.suspension_reason && (
                                            <div className="rounded border border-red-500/20 bg-red-500/15 p-2 font-mono text-[11px] italic">
                                                Alasan: "{project.suspension_reason}"
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <FileCode className="size-3" /> {project.files_count ?? 0} files
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Globe className="size-3" />
                                        <Badge
                                            variant={project.is_suspended ? 'destructive' : project.published ? 'default' : 'secondary'}
                                            className="px-1.5 py-0 text-[10px]"
                                        >
                                            {project.is_suspended ? 'Suspended' : project.published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you absolutely sure you want to delete <strong>{deletingProject?.name}</strong>? This action cannot be undone and will
                            permanently delete all files and configuration associated with this project.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeletingProject(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletingProject) {
                                    router.delete(route('projects.destroy', deletingProject.slug), {
                                        onSuccess: () => setDeletingProject(null),
                                    });
                                }
                            }}
                        >
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
