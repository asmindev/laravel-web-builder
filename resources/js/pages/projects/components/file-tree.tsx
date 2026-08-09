import { useState, useRef } from 'react';
import { Folder, FileCode, Trash2, Copy, Pencil, ArrowRight, Plus, MoreHorizontal } from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { EXT_ICONS, getExt } from '@/lib/file-utils';
import type { ProjectFile, ProjectFolder } from '@/types/project';

interface FileTreeProps {
    files: ProjectFile[];
    folders: ProjectFolder[];
    activeFile: string | null;
    onSelect: (path: string) => void;
    onDelete: (path: string) => void;
    onDuplicate: (path: string) => void;
    onRename: (path: string) => void;
    onMove: (path: string) => void;
    onReorder: (dir: string, reordered: ProjectFile[]) => void;
    onDropOnFolder: (filePath: string, targetDir: string) => void;
    onNewFileInFolder: (dir: string) => void;
    onRenameFolderByName: (folderName: string, newName: string) => void;
    onDeleteFolderByName: (folderName: string) => void;
}

export function FileTree({
    files, folders, activeFile, onSelect, onDelete, onDuplicate, onRename, onMove,
    onReorder, onDropOnFolder, onNewFileInFolder, onRenameFolderByName, onDeleteFolderByName,
}: FileTreeProps) {
    const dragSource = useRef<string | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);

    // Dialog / Inline States for Folder Operations
    const [folderToDelete, setFolderToDelete] = useState<{ name: string; files: ProjectFile[] } | null>(null);
    const [editingFolder, setEditingFolder] = useState<string | null>(null);
    const [editingFolderValue, setEditingFolderValue] = useState<string>('');

    // Root files = files with no folder prefix
    const rootFiles = files.filter((f) => !f.path.includes('/'));

    // Extract all unique folder paths from files (e.g. "views/index.ejs" -> "views")
    const implicitFolderNames = new Set<string>();
    files.forEach((f) => {
        if (f.path.includes('/')) {
            const parts = f.path.split('/');
            implicitFolderNames.add(parts[0]);
        }
    });

    const allFolderNames = Array.from(new Set([...folders.map((f) => f.name), ...implicitFolderNames]));

    const startRenameFolder = (folderName: string) => {
        setEditingFolder(folderName);
        setEditingFolderValue(folderName);
    };

    const submitRenameFolder = (oldName: string) => {
        if (editingFolderValue.trim() && editingFolderValue.trim() !== oldName) {
            onRenameFolderByName(oldName, editingFolderValue.trim());
        }
        setEditingFolder(null);
    };

    // ── Native HTML5 drag handlers ──

    const onDragStart = (e: React.DragEvent, path: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', path);
        dragSource.current = path;
        setDragging(path);
    };

    const onDragEnd = () => {
        dragSource.current = null;
        setDragging(null);
        setDragOver(null);
    };

    const prevent = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDropOnFile = (e: React.DragEvent, targetPath: string) => {
        e.preventDefault();
        const source = e.dataTransfer.getData('text/plain') || dragSource.current;
        if (!source || source === targetPath) return;

        const sourceDir = source.includes('/') ? source.split('/')[0] : '/';
        const sameDirFiles = sourceDir === '/' ? rootFiles : files.filter((f) => f.path.startsWith(sourceDir + '/'));
        if (!sameDirFiles) return;

        const sourceIdx = sameDirFiles.findIndex((f) => f.path === source);
        const targetIdx = sameDirFiles.findIndex((f) => f.path === targetPath);
        if (sourceIdx === -1 || targetIdx === -1) return;

        const reordered = [...sameDirFiles];
        const [moved] = reordered.splice(sourceIdx, 1);
        reordered.splice(targetIdx, 0, moved);

        onReorder(sourceDir, reordered);
        setDragOver(null);
    };

    const onDropToFolder = (e: React.DragEvent, dir: string) => {
        e.preventDefault();
        const source = e.dataTransfer.getData('text/plain') || dragSource.current;
        if (source) {
            onDropOnFolder(source, dir);
        }
        setDragOver(null);
    };

    // ── File row ──

    const renderFile = (file: ProjectFile, depth: number) => {
        const fp = file.path;
        const isDragging = dragging === fp;
        const isOver = dragOver === fp;
        const isActive = activeFile === fp;

        const fileName = fp.split('/').pop() ?? fp;

        return (
            <div
                key={fp}
                className={cn(
                    'rounded-md transition-all',
                    isOver && 'bg-primary/20 ring-2 ring-primary ring-inset',
                )}
            >
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <div
                            draggable
                            role="button"
                            tabIndex={0}
                            onDragStart={(e) => onDragStart(e, fp)}
                            onDragEnd={onDragEnd}
                            onDragOver={prevent}
                            onDrop={(e) => onDropOnFile(e, fp)}
                            onClick={() => onSelect(fp)}
                            onKeyDown={(e) => e.key === 'Enter' && onSelect(fp)}
                            className={cn(
                                'relative flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-xs font-medium transition-all duration-150',
                                isActive && !isDragging
                                    ? 'bg-primary/15 text-primary font-bold shadow-xs before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-primary before:rounded-r-full'
                                    : 'text-foreground/80 hover:bg-accent hover:text-foreground',
                                isDragging && 'opacity-40 ring-2 ring-dashed ring-primary',
                                dragging ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                            )}
                            style={{ paddingLeft: `${10 + depth * 12}px` }}
                        >
                            <FileCode className={`size-4 shrink-0 ${EXT_ICONS[getExt(fp)] || 'text-slate-400'}`} />
                            <span className="flex-1 truncate">{fileName}</span>
                            {isActive && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                        <ContextMenuItem onClick={() => onSelect(fp)}>
                            <FileCode className="size-3.5 text-primary" /> Open Code
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => onDuplicate(fp)}>
                            <Copy className="size-3.5 text-indigo-500" /> Duplicate
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => onRename(fp)}>
                            <Pencil className="size-3.5 text-amber-500" /> Rename
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => onMove(fp)}>
                            <ArrowRight className="size-3.5 text-emerald-500" /> Move to
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => onDelete(fp)} variant="destructive">
                            <Trash2 className="size-3.5 text-red-500" /> Delete
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </div>
        );
    };

    // Sort folders alphabetically
    const sortedFolderNames = [...allFolderNames].sort((a, b) => a.localeCompare(b));

    return (
        <div className="space-y-0.5 text-sm select-none">
            {/* 1. FOLDERS FIRST (Level 0) */}
            {sortedFolderNames.map((folderName) => {
                const dirFiles = files.filter((f) => f.path.startsWith(folderName + '/'));
                const dbFolder = folders.find((f) => f.name === folderName);
                const isFolderActive = activeFile?.startsWith(folderName + '/');
                const isEditingThisFolder = editingFolder === folderName;

                return (
                    <div
                        key={dbFolder ? dbFolder.id : folderName}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(folderName); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => onDropToFolder(e, folderName)}
                        className={cn(
                            'rounded-md transition-all space-y-0.5',
                            dragOver === folderName && 'bg-primary/20 ring-2 ring-primary/40',
                        )}
                    >
                        <DropdownMenu>
                            <ContextMenu>
                                <ContextMenuTrigger asChild>
                                    <div
                                        className={cn(
                                            'flex w-full items-center justify-between py-1.5 pr-2 text-xs font-semibold rounded-md cursor-pointer transition-all duration-150',
                                            isFolderActive
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                                                : 'text-foreground/90 hover:bg-accent hover:text-foreground'
                                        )}
                                        style={{ paddingLeft: '10px' }}
                                    >
                                        {isEditingThisFolder ? (
                                            <div className="flex items-center gap-1.5 flex-1 pr-2">
                                                <Folder className="size-4 text-amber-500 shrink-0" />
                                                <Input
                                                    value={editingFolderValue}
                                                    onChange={(e) => setEditingFolderValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            submitRenameFolder(folderName);
                                                        } else if (e.key === 'Escape') {
                                                            setEditingFolder(null);
                                                        }
                                                    }}
                                                    onBlur={() => submitRenameFolder(folderName)}
                                                    className="h-6 py-0 px-1 text-xs font-semibold font-mono border-primary bg-background w-36"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 truncate">
                                                <Folder className="size-4 text-amber-500 shrink-0" />
                                                <span className="truncate">{folderName}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
                                                    {dirFiles.length}
                                                </span>
                                            </div>
                                        )}

                                        {!isEditingThisFolder && (
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 p-0 hover:bg-accent text-muted-foreground hover:text-foreground shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Menu Folder"
                                                >
                                                    <MoreHorizontal className="size-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                        )}
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-52">
                                    <ContextMenuItem onClick={() => onNewFileInFolder(folderName)}>
                                        <Plus className="size-3.5 text-primary" /> Buat File di Folder ini
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => startRenameFolder(folderName)}>
                                        <Pencil className="size-3.5 text-indigo-500" /> Pindahkan / Rename Folder
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                        onClick={() => setFolderToDelete({ name: folderName, files: dirFiles })}
                                        variant="destructive"
                                    >
                                        <Trash2 className="size-3.5 text-red-500" /> Hapus Folder (Beserta Isinya)
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>

                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem onClick={() => onNewFileInFolder(folderName)} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                    <Plus className="size-4 text-primary" /> Buat File di Folder ini
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => startRenameFolder(folderName)} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                                    <Pencil className="size-4 text-indigo-500" /> Pindahkan / Rename Folder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setFolderToDelete({ name: folderName, files: dirFiles })}
                                    className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-red-600 dark:text-red-400 focus:text-red-600"
                                >
                                    <Trash2 className="size-4 text-red-500" /> Hapus Folder (Beserta Isinya)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="space-y-0.5">
                            {dirFiles.map((file) => renderFile(file, 1))}
                        </div>
                    </div>
                );
            })}

            {/* 2. ROOT FILES AFTER FOLDERS (Level 0) */}
            <div
                key="_root_"
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver('/'); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onDropToFolder(e, '/')}
                className={cn(
                    'rounded-md transition-all space-y-0.5',
                    dragOver === '/' && 'bg-primary/20 ring-2 ring-primary/40',
                )}
            >
                {rootFiles.map((file) => renderFile(file, 0))}
            </div>

            {/* Delete Folder Alert Dialog */}
            {folderToDelete && (
                <Dialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Trash2 className="size-5" /> Hapus Folder "{folderToDelete.name}"?
                            </DialogTitle>
                            <DialogDescription className="text-xs space-y-2 pt-2">
                                <span>
                                    Tindakan ini akan <strong>menghapus folder ini secara permanen</strong> beserta{' '}
                                    <strong>{folderToDelete.files.length} file</strong> yang ada di dalamnya:
                                </span>
                                {folderToDelete.files.length > 0 && (
                                    <div className="max-h-36 overflow-y-auto rounded-md border bg-muted/50 p-2 space-y-1 font-mono text-[11px] mt-2">
                                        {folderToDelete.files.map((file) => (
                                            <div key={file.path} className="flex items-center gap-1.5 text-muted-foreground">
                                                <FileCode className="size-3 text-sky-500 shrink-0" />
                                                <span className="truncate">{file.path}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
                            <Button variant="outline" size="sm" onClick={() => setFolderToDelete(null)}>
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="font-bold bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                    onDeleteFolderByName(folderToDelete.name);
                                    setFolderToDelete(null);
                                }}
                            >
                                Hapus Beserta Isinya
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
