import { useState, useRef } from 'react';
import { Folder, FileCode, Trash2, Copy, Pencil, ArrowRight, Plus } from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
    onRenameFolder: (folderId: number) => void;
    onDeleteFolder: (folderId: number) => void;
}

export function FileTree({
    files, folders, activeFile, onSelect, onDelete, onDuplicate, onRename, onMove,
    onReorder, onDropOnFolder, onNewFileInFolder, onRenameFolder, onDeleteFolder,
}: FileTreeProps) {
    const dragSource = useRef<string | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);

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

        const fileName = fp.split('/').pop() ?? fp;

        return (
            <div
                key={fp}
                className={cn(
                    'rounded-md transition-all',
                    isOver && 'bg-primary/10 ring-2 ring-primary ring-inset',
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
                                'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                                activeFile === fp && !isDragging
                                    ? 'bg-accent text-accent-foreground'
                                    : 'hover:bg-accent/50',
                                isDragging && 'opacity-40 ring-2 ring-dashed ring-foreground/30',
                                dragging && !isDragging && 'hover:bg-accent/30',
                                dragging ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                                isOver && 'ring-primary ring-2 ring-inset',
                            )}
                            style={{ paddingLeft: `${12 + depth * 12}px` }}
                        >
                            <FileCode className={`size-3.5 shrink-0 ${EXT_ICONS[getExt(fp)] || ''}`} />
                            <span className="flex-1 truncate">{fileName}</span>
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem onClick={() => onSelect(fp)}>
                            <FileCode className="size-3.5" /> Open
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => onDuplicate(fp)}>
                            <Copy className="size-3.5" /> Duplicate
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => onRename(fp)}>
                            <Pencil className="size-3.5" /> Rename
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => onMove(fp)}>
                            <ArrowRight className="size-3.5" /> Move to
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => onDelete(fp)} variant="destructive">
                            <Trash2 className="size-3.5" /> Delete
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </div>
        );
    };

    return (
        <div className="space-y-1 text-sm select-none">
            {/* ── ROOT ── */}
            <div
                key="_root_"
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver('/'); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onDropToFolder(e, '/')}
                className={cn(
                    'rounded-md transition-all',
                    dragOver === '/' && 'bg-primary/15 ring-2 ring-primary/40',
                )}
            >
                <div className="flex w-full items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <Folder className="size-3" />
                    root
                </div>
                <div className="space-y-0.5">
                    {rootFiles.map((file) => renderFile(file, 0))}
                </div>
            </div>

            {/* ── FOLDERS (both DB folders & path-derived folders) ── */}
            {allFolderNames.map((folderName) => {
                const dirFiles = files.filter((f) => f.path.startsWith(folderName + '/'));
                const dbFolder = folders.find((f) => f.name === folderName);

                return (
                    <div
                        key={dbFolder ? dbFolder.id : folderName}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(folderName); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => onDropToFolder(e, folderName)}
                        className={cn(
                            'rounded-md transition-all',
                            dragOver === folderName && 'bg-primary/15 ring-2 ring-primary/40',
                        )}
                    >
                        <div className="flex w-full items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground">
                            <Folder className="size-3" />
                            {folderName}
                        </div>
                        {dirFiles.map((file) => renderFile(file, 1))}
                    </div>
                );
            })}
        </div>
    );
}
