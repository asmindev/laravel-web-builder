import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Label } from '@/components/ui/label';
import { Head, Link, router } from '@inertiajs/react';
import { Project, ProjectFile } from '@/types';
import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import {
    Save,
    Eye,
    Globe,
    Sparkles,
    Plus,
    FileCode,
    Loader2,
    File,
    Folder,
    X,
    Image,
    Trash2,
    Copy,
    Pencil,
    ArrowRight,
} from 'lucide-react';
import Editor from '@monaco-editor/react';

interface ShowProps {
    project: Project;
}

const EXT_ICONS: Record<string, string> = {
    ejs: 'text-orange-500',
    html: 'text-orange-500',
    css: 'text-blue-500',
    js: 'text-yellow-500',
    json: 'text-green-500',
};

function getExt(path: string) {
    return path.split('.').pop() || '';
}

function FileTree({
    files,
    activeFile,
    onSelect,
    onDelete,
    onDuplicate,
    onRename,
    onMove,
}: {
    files: ProjectFile[];
    activeFile: string | null;
    onSelect: (path: string) => void;
    onDelete: (path: string) => void;
    onDuplicate: (path: string) => void;
    onRename: (path: string) => void;
    onMove: (path: string) => void;
}) {
    const groups: Record<string, ProjectFile[]> = {};

    files.forEach((f) => {
        const dir = f.path.includes('/') ? f.path.split('/')[0] : '/';
        if (!groups[dir]) groups[dir] = [];
        groups[dir].push(f);
    });

    return (
        <div className="space-y-1 text-sm">
            {Object.entries(groups).map(([dir, dirFiles]) => (
                <div key={dir}>
                    <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground">
                        <Folder className="size-3" />
                        {dir === '/' ? 'root' : dir}
                    </div>
                    {dirFiles.map((file) => (
                        <ContextMenu key={file.path}>
                            <ContextMenuTrigger asChild>
                                <button
                                    onClick={() => onSelect(file.path)}
                                    className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                                        activeFile === file.path
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-accent/50'
                                    }`}
                                >
                                    <FileCode className={`size-3.5 ${EXT_ICONS[getExt(file.path)] || ''}`} />
                                    <span className="flex-1 truncate">{file.path.split('/').pop()}</span>
                                </button>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => onSelect(file.path)}>
                                    <FileCode className="size-3.5" /> Open
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => onDuplicate(file.path)}>
                                    <Copy className="size-3.5" /> Duplicate
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => onRename(file.path)}>
                                    <Pencil className="size-3.5" /> Rename
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => onMove(file.path)}>
                                    <ArrowRight className="size-3.5" /> Move to
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem
                                    onClick={() => onDelete(file.path)}
                                    variant="destructive"
                                >
                                    <Trash2 className="size-3.5" /> Delete
                                </ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    ))}
                </div>
            ))}
        </div>
    );
}

function MonacoEditor({
    value,
    onChange,
    language,
}: {
    value: string;
    onChange: (val: string) => void;
    language: string;
}) {
    return (
        <Editor
            value={value}
            onChange={(val) => onChange(val ?? '')}
            language={language}
            theme="vs-dark"
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
            }}
        />
    );
}

function mapLanguage(path: string): string {
    const ext = getExt(path);
    switch (ext) {
        case 'ejs':
        case 'html':
            return 'html';
        case 'css':
            return 'css';
        case 'js':
            return 'javascript';
        case 'json':
            return 'json';
        default:
            return 'plaintext';
    }
}

export default function ProjectShow({ project }: ShowProps) {
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [files, setFiles] = useState<ProjectFile[]>(project.files || []);
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [showAi, setShowAi] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [openTabs, setOpenTabs] = useState<string[]>(() => (project.files || []).map((f) => f.path));
    const [renameTarget, setRenameTarget] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [moveTarget, setMoveTarget] = useState<string | null>(null);
    const [moveValue, setMoveValue] = useState('');

    useEffect(() => {
        if (files.length > 0 && !activeFile) {
            const first = files[0].path;
            setActiveFile(first);
            setOpenTabs((prev) => (prev.includes(first) ? prev : [...prev, first]));
        }
    }, [files]);

    useEffect(() => {
        const file = files.find((f) => f.path === activeFile);
        if (file) {
            setContent(file.content ?? '');
        }
    }, [activeFile, files]);

    const setActiveAndOpen = (path: string) => {
        setActiveFile(path);
        setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    };

    const closeTab = (path: string) => {
        setOpenTabs((prev) => prev.filter((p) => p !== path));
        if (path === activeFile) {
            const remaining = openTabs.filter((p) => p !== path);
            if (remaining.length > 0) {
                const idx = openTabs.indexOf(path);
                setActiveFile(remaining[Math.min(idx, remaining.length - 1)]);
            } else {
                setActiveFile(null);
            }
        }
    };

    const currentFile = files.find((f) => f.path === activeFile);
    const currentLanguage = currentFile ? mapLanguage(currentFile.path) : 'plaintext';

    const handleSave = useCallback(async () => {
        if (!activeFile) return;
        setSaving(true);
        try {
            const res = await fetch(route('projects.files.store', project.slug), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
                body: JSON.stringify({ path: activeFile, content }),
            });
            if (res.ok) {
                toast.success('Saved!');
                setFiles((prev) =>
                    prev.map((f) => (f.path === activeFile ? { ...f, content } : f)),
                );
            } else {
                toast.error('Failed to save');
            }
        } catch {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    }, [activeFile, content, project.slug]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler as any);
        return () => window.removeEventListener('keydown', handler as any);
    }, [handleSave]);

    const handleDeleteFile = async (path: string) => {
        try {
            const res = await fetch(route('projects.files.destroy', [project.slug, path]), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken },
            });
            if (res.ok) {
                setFiles((prev) => prev.filter((f) => f.path !== path));
                if (activeFile === path) {
                    setActiveFile(files.find((f) => f.path !== path)?.path ?? null);
                }
                toast.success('File deleted');
            }
        } catch {
            toast.error('Failed to delete file');
        }
    };

    const handleCreateFile = async () => {
        if (!newFileName) return;
        try {
            const res = await fetch(route('projects.files.store', project.slug), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
                body: JSON.stringify({ path: newFileName, content: '' }),
            });
            if (res.ok) {
                const file = await res.json();
                setFiles((prev) => [...prev, file]);
                setActiveAndOpen(file.path);
                setNewFileName('');
                toast.success('File created');
            }
        } catch {
            toast.error('Failed to create file');
        }
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setAiGenerating(true);
        try {
            const res = await fetch(route('ai.generate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
                body: JSON.stringify({ prompt: aiPrompt }),
            });
            const data = await res.json();
            if (data.files) {
                for (const [path, fileContent] of Object.entries(data.files) as [string, unknown][]) {
                    await fetch(route('projects.files.store', project.slug), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
                        body: JSON.stringify({ path, content: fileContent }),
                    });
                }
                // Refresh files
                const refresh = await fetch(route('projects.files.index', project.slug));
                const refreshed = await refresh.json();
                setFiles(refreshed);
                setAiPrompt('');
                toast.success('AI generated files!');
            }
        } catch {
            toast.error('AI generation failed');
        } finally {
            setAiGenerating(false);
        }
    };

    const handlePublish = async () => {
        setPublishing(true);
        try {
            const res = await fetch(route('projects.publish', project.slug), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken },
            });
            if (res.ok) {
                toast.success('Project published!');
                router.reload({ only: ['project'] });
            }
        } catch {
            toast.error('Publish failed');
        } finally {
            setPublishing(false);
        }
    };

    const handleDuplicateFile = async (path: string) => {
        const ext = path.includes('.') ? '.' + path.split('.').pop() : '';
        const base = ext ? path.slice(0, -ext.length) : path;
        let newPath = base + '-copy' + ext;
        let i = 1;
        while (files.some((f) => f.path === newPath)) {
            newPath = base + '-copy-' + i + ext;
            i++;
        }
        const source = files.find((f) => f.path === path);
        if (!source) return;
        try {
            const res = await fetch(route('projects.files.store', project.slug), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
                body: JSON.stringify({ path: newPath, content: source.content }),
            });
            if (res.ok) {
                const file = await res.json();
                setFiles((prev) => [...prev, file]);
                toast.success('Duplicated');
            }
        } catch {
            toast.error('Failed to duplicate');
        }
    };

    const handleRenameFile = async () => {
        if (!renameTarget || !renameValue) return;
        if (files.some((f) => f.path === renameValue && f.path !== renameTarget)) {
            toast.error('File already exists');
            return;
        }
        const source = files.find((f) => f.path === renameTarget);
        if (!source) return;
        try {
            await fetch(route('projects.files.store', project.slug), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
                body: JSON.stringify({ path: renameValue, content: source.content }),
            });
            await fetch(route('projects.files.destroy', [project.slug, renameTarget]), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken },
            });
            setFiles((prev) =>
                prev
                    .filter((f) => f.path !== renameTarget)
                    .concat({ ...source, path: renameValue })
            );
            setOpenTabs((prev) => prev.map((p) => (p === renameTarget ? renameValue : p)));
            if (activeFile === renameTarget) setActiveAndOpen(renameValue);
            setRenameTarget(null);
            setRenameValue('');
            toast.success('Renamed');
        } catch {
            toast.error('Failed to rename');
        }
    };

    const handleMoveFile = async () => {
        if (!moveTarget || !moveValue) return;
        const newPath = moveValue.endsWith('/')
            ? moveValue + moveTarget.split('/').pop()
            : moveValue + '/' + moveTarget.split('/').pop();
        if (files.some((f) => f.path === newPath)) {
            toast.error('File already exists at destination');
            return;
        }
        const source = files.find((f) => f.path === moveTarget);
        if (!source) return;
        try {
            await fetch(route('projects.files.store', project.slug), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
                body: JSON.stringify({ path: newPath, content: source.content }),
            });
            await fetch(route('projects.files.destroy', [project.slug, moveTarget]), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken },
            });
            setFiles((prev) =>
                prev
                    .filter((f) => f.path !== moveTarget)
                    .concat({ ...source, path: newPath })
            );
            setOpenTabs((prev) => prev.map((p) => (p === moveTarget ? newPath : p)));
            if (activeFile === moveTarget) setActiveAndOpen(newPath);
            setMoveTarget(null);
            setMoveValue('');
            toast.success('Moved');
        } catch {
            toast.error('Failed to move');
        }
    };

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await fetch(route('projects.assets.store', project.slug), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken },
                body: form,
            });
            if (res.ok) {
                toast.success('Asset uploaded');
                router.reload({ only: ['project'] });
            }
        } catch {
            toast.error('Upload failed');
        }
    };

    return (
        <AdminLayout header={<span className="text-sm font-medium">Editor</span>}>
            <Head title={project.name} />

            {/* Top bar */}
            <div className="-mx-4 -mt-4 mb-0 flex items-center justify-between border-b px-4 py-2">
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
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Save className="mr-1 size-3" />}
                        Save
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('projects.preview', project.slug)}>
                            <Eye className="mr-1 size-3" /> Preview
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAi(!showAi)}>
                        <Sparkles className="mr-1 size-3" /> AI
                    </Button>
                    <Button size="sm" onClick={handlePublish} disabled={publishing}>
                        {publishing ? (
                            <Loader2 className="mr-1 size-3 animate-spin" />
                        ) : (
                            <Globe className="mr-1 size-3" />
                        )}
                        Publish
                    </Button>
                </div>
            </div>

            <div className="flex min-w-0 flex-1 overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
                {/* File sidebar */}
                <div className="w-56 shrink-0 overflow-y-auto border-r bg-muted/30 p-2">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Files</span>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon-xs">
                                    <Plus className="size-3" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>New File</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Filename</Label>
                                        <Input
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                                            placeholder="about.ejs"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { label: '.ejs', value: 'index.ejs' },
                                            { label: '.css', value: 'style.css' },
                                            { label: '.js', value: 'script.js' },
                                            { label: '.json', value: 'data.json' },
                                        ].map((preset) => (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                onClick={() => setNewFileName(preset.value)}
                                                className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent data-[active=true]:border-primary"
                                                data-active={newFileName === preset.value}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                    <Button onClick={handleCreateFile} className="w-full">
                                        Create File
                                    </Button>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Upload Asset</Label>
                                        <Input type="file" onChange={handleAssetUpload} className="text-xs" />
                                    </div>
                                    {project.assets && project.assets.length > 0 && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Assets</Label>
                                            <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                                                {project.assets.map((asset) => (
                                                    <div
                                                        key={asset.id}
                                                        className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
                                                    >
                                                        <Image className="size-3 shrink-0" />
                                                        <span className="truncate">{asset.original_filename}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <FileTree
                        files={files}
                        activeFile={activeFile}
                        onSelect={(path) => setActiveAndOpen(path)}
                        onDelete={handleDeleteFile}
                        onDuplicate={handleDuplicateFile}
                        onRename={(path) => {
                            setRenameTarget(path);
                            setRenameValue(path);
                        }}
                        onMove={(path) => {
                            setMoveTarget(path);
                            setMoveValue(path.split('/').slice(0, -1).join('/') || '/');
                        }}
                    />
                </div>

                {/* Rename Dialog */}
                <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) { setRenameTarget(null); setRenameValue(''); } }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rename File</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>New filename</Label>
                                <Input
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameFile()}
                                    placeholder="about.ejs"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setRenameTarget(null); setRenameValue(''); }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleRenameFile} disabled={!renameValue}>
                                    Rename
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Move Dialog */}
                <Dialog open={!!moveTarget} onOpenChange={(open) => { if (!open) { setMoveTarget(null); setMoveValue(''); } }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Move File</DialogTitle>
                            <p className="text-xs text-muted-foreground">
                                Enter destination folder. File will be moved to <code className="text-xs">{moveValue}/{moveTarget?.split('/').pop()}</code>
                            </p>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Destination folder</Label>
                                <Input
                                    value={moveValue}
                                    onChange={(e) => setMoveValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleMoveFile()}
                                    placeholder="folder/subfolder"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setMoveTarget(null); setMoveValue(''); }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleMoveFile} disabled={!moveValue}>
                                    Move
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Editor */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* File tabs */}
                    <div className="flex shrink-0 items-center overflow-x-auto border-b bg-muted/20">
                        {files.filter((f) => openTabs.includes(f.path)).map((file) => (
                            <div
                                key={file.path}
                                onClick={() => setActiveAndOpen(file.path)}
                                className={`group flex cursor-pointer shrink-0 items-center gap-1.5 border-r px-3 py-1.5 text-xs transition-colors ${
                                    activeFile === file.path
                                        ? 'bg-background font-medium text-foreground'
                                        : 'text-muted-foreground hover:bg-accent/50'
                                }`}
                            >
                                <FileCode className={`size-3 ${EXT_ICONS[getExt(file.path)] || ''}`} />
                                <span className="max-w-[120px] truncate">{file.path.split('/').pop()}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); closeTab(file.path); }}
                                    className="ml-1 rounded-sm p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                                >
                                    <X className="size-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {/* Editor content */}
                    <div className="min-w-0 flex-1 overflow-hidden">
                        {activeFile ? (
                            <MonacoEditor
                                key={activeFile}
                                value={content}
                                onChange={setContent}
                                language={currentLanguage}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <FileCode className="mx-auto mb-2 size-8" />
                                    <p>Select a file to edit</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Panel */}
                {showAi && (
                    <div className="w-80 shrink-0 overflow-y-auto border-l bg-muted/30 p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                            <Sparkles className="size-4" /> AI Generator
                        </h3>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label className="text-xs">Describe what you want to build</Label>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g. Create a landing page with a hero section, features grid, and contact form"
                                    rows={6}
                                    className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleAiGenerate}
                                disabled={aiGenerating || !aiPrompt}
                            >
                                {aiGenerating ? (
                                    <>
                                        <Loader2 className="mr-1 size-3 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-1 size-3" /> Generate
                                    </>
                                )}
                            </Button>
                            <Separator />
                            <div className="space-y-1 text-xs text-muted-foreground">
                                <p>Pro tips:</p>
                                <ul className="list-inside list-disc space-y-1">
                                    <li>Be specific about layout sections</li>
                                    <li>Mention preferred colors/styles</li>
                                    <li>Describe responsive behavior</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
