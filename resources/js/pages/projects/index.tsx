import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, ExternalLink, Globe, FileCode, MoreHorizontal, FolderOpen, Layout, Terminal, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';

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

    const filtered = projects.filter((p) => {
        const match = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.description || '').toLowerCase().includes(search.toLowerCase());
        if (!match) return false;
        if (filter === 'published') return p.published;
        if (filter === 'draft') return !p.published;
        return true;
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('projects.store'), { name, description, template }, {
            onSuccess: () => {
                setShowCreate(false);
                setName('');
                setDescription('');
                setTemplate('landing');
                setErrors({});
                router.reload({ only: ['projects'] });
            },
            onError: (errs) => {
                setErrors(errs);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout header={<h2 className="text-xl leading-tight font-semibold">Projects</h2>}>
            <Head title="Projects" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search projects..."
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-2">
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
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus /> New Project
                    </Button>
                </div>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Project</DialogTitle>
                        <DialogDescription>Name your project and pick a template.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="space-y-5 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="My Awesome Site"
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
                                    placeholder="What is this project about?"
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
                                            <div className={`mt-0.5 rounded-md border p-1.5 ${template === tpl.id ? 'bg-primary text-primary-foreground' : ''}`}>
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
                        </div>
                        <DialogFooter showCloseButton className="mt-6">
                            <Button type="submit" className="min-w-28" disabled={processing}>
                                {processing ? <Loader2 className="size-4 animate-spin" /> : 'Create'}
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
                            <CardTitle className="mb-1">
                                {search || filter !== 'all' ? 'No matching projects' : 'No projects yet'}
                            </CardTitle>
                            <Card>
                                <CardDescription>
                                    {search || filter !== 'all'
                                        ? 'Try a different search or filter.'
                                        : 'Create your first project to get started.'}
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
                        <Card key={project.id} className="group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">
                                            <a href={route('projects.show', project.slug)} className="hover:underline">
                                                {project.name}
                                            </a>
                                        </CardTitle>
                                        {project.description && (
                                            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-xs">
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <a href={route('projects.show', project.slug)}>Open Editor</a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <a href={route('projects.preview', project.slug)}>Preview</a>
                                            </DropdownMenuItem>
                                            {project.published && (
                                                <DropdownMenuItem>
                                                    <a href={route('app.preview', [project.slug])} target="_blank" rel="noopener">
                                                        View Live <ExternalLink className="ml-1 size-3" />
                                                    </a>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <FileCode className="size-3" /> {project.files_count ?? 0} files
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Globe className="size-3" />
                                        <Badge variant={project.published ? 'default' : 'secondary'} className="px-1.5 py-0 text-[10px]">
                                            {project.published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
