import { Save, Eye, Globe, Loader2, FileCode, Download, Sparkles, Trash2, ChevronDown, FileArchive, Code2, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { getExt, EXT_ICONS } from '@/lib/file-utils';
import type { Project } from '@/types/project';

interface TopBarProps {
    project: Project;
    activeFile: string | null;
    saving: boolean;
    publishing: boolean;
    onSave: () => void;
    onPublish: () => void;
    onOpenPromptModal: () => void;
    onOpenResetDbModal: () => void;
    onOpenDeleteModal: () => void;
}

export function TopBar({
    project,
    activeFile,
    saving,
    publishing,
    onSave,
    onPublish,
    onOpenPromptModal,
    onOpenResetDbModal,
    onOpenDeleteModal,
}: TopBarProps) {
    return (
        <div className="-mx-4 -mt-4 mb-0 flex items-center justify-between border-b px-4 py-2 flex-wrap gap-2">
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold">{project.name}</h1>
                {activeFile && (
                    <div className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                        <span className="text-xs text-muted-foreground/50">/</span>
                        <FileCode className={`size-3.5 ${EXT_ICONS[getExt(activeFile)] || ''}`} />
                        <span>{activeFile}</span>
                    </div>
                )}
                <Badge variant={project.published ? 'default' : 'secondary'}>
                    {project.published ? 'Published' : 'Draft'}
                </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {/* Buat Prompt Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenPromptModal}
                    className="gap-1 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                >
                    <Sparkles className="size-3.5 text-amber-500" /> Buat Prompt
                </Button>

                {/* Kosongkan DB (Simpan Admin) Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenResetDbModal}
                    className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                    <Database className="size-3.5 text-amber-500" /> Kosongkan DB
                </Button>

                {/* Download / Export Options Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Download className="size-3.5" /> Download / Export <ChevronDown className="size-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                            <a href={`/projects/${project.slug}/export-zip`} className="flex items-center gap-2 cursor-pointer font-medium">
                                <FileArchive className="size-4 text-emerald-500" /> Full Project ZIP (MySQL)
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`/projects/${project.slug}/export-db`} className="flex items-center gap-2 cursor-pointer text-xs">
                                <Database className="size-4 text-cyan-500" /> Database SQL (MySQL Dump)
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`/projects/${project.slug}/export-file?type=nodejs`} className="flex items-center gap-2 cursor-pointer text-xs">
                                <FileCode className="size-4 text-indigo-500" /> File Node.js (index.js)
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`/projects/${project.slug}/export-file?type=index`} className="flex items-center gap-2 cursor-pointer text-xs">
                                <Code2 className="size-4 text-amber-500" /> File Index (views/index)
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={onSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Save className="mr-1 size-3" />}
                    Save
                </Button>

                <Button variant="outline" size="sm" asChild>
                    <Link href={route('projects.preview', project.slug)}>
                        <Eye className="mr-1 size-3" /> Preview
                    </Link>
                </Button>

                <Button size="sm" onClick={onPublish} disabled={publishing}>
                    {publishing ? (
                        <Loader2 className="mr-1 size-3 animate-spin" />
                    ) : (
                        <Globe className="mr-1 size-3" />
                    )}
                    Publish
                </Button>

                {/* Hapus Project Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenDeleteModal}
                    className="gap-1 text-red-600 border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700"
                >
                    <Trash2 className="size-3.5" /> Hapus Project
                </Button>
            </div>
        </div>
    );
}
