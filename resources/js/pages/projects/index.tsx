import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Project } from '@/types';
import { useState, useMemo } from 'react';
import {
    Plus, Search, ExternalLink, Globe, FileCode, MoreHorizontal, FolderOpen,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface IndexProps {
    projects: Project[];
}

export default function ProjectIndex({ projects }: IndexProps) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

    const filtered = useMemo(() => {
        return projects.filter((p) => {
            const match = p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.description || '').toLowerCase().includes(search.toLowerCase());
            if (!match) return false;
            if (filter === 'published') return p.published;
            if (filter === 'draft') return !p.published;
            return true;
        });
    }, [projects, search, filter]);

    return (
        <AdminLayout header={<h2 className="text-xl leading-tight font-semibold">Projects</h2>}>
            <Head title="Projects" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
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
                    <Button asChild>
                        <Link href={route('projects.create')}>
                            <Plus /> New Project
                        </Link>
                    </Button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-16">
                        <FolderOpen className="size-12 text-muted-foreground" />
                        <div className="text-center">
                            <CardTitle className="mb-1">
                                {search || filter !== 'all' ? 'No matching projects' : 'No projects yet'}
                            </CardTitle>
                            <CardDescription>
                                {search || filter !== 'all'
                                    ? 'Try a different search or filter.'
                                    : 'Create your first project to get started.'}
                            </CardDescription>
                        </div>
                        {!search && filter === 'all' && (
                            <Button asChild>
                                <Link href={route('projects.create')}>
                                    <Plus /> Create Project
                                </Link>
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
                                            <Link href={route('projects.show', project.slug)} className="hover:underline">
                                                {project.name}
                                            </Link>
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
                                            <DropdownMenuItem asChild>
                                                <Link href={route('projects.show', project.slug)}>Open Editor</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={route('projects.preview', project.slug)}>Preview</Link>
                                            </DropdownMenuItem>
                                            {project.published && (
                                                <DropdownMenuItem asChild>
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
                                        <Badge variant={project.published ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
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
