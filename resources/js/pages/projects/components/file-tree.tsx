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
import { getFileGroup } from '../helpers/file-operations';
import type { ProjectFile } from '@/types/project';

interface FileTreeProps {
    files: ProjectFile[];
    activeFile: string | null;
    onSelect: (path: string) => void;
    onDelete: (path: string) => void;
    onDuplicate: (path: string) => void;
    onRename: (path: string) => void;
    onMove: (path: string) => void;
    onReorder: (dir: string, reordered: ProjectFile[]) => void;
    onDropOnFolder: (filePath: string, targetDir: string) => void;
    onNewFileInFolder: (dir: string) => void;
    onRenameFolder: (dir: string) => void;
    onDeleteFolder: (dir: string) => void;
}

export function FileTree({
    files, activeFile, onSelect, onDelete, onDuplicate, onRename, onMove,
    onReorder, onDropOnFolder, onNewFileInFolder, onRenameFolder, onDeleteFolder,
}: FileTreeProps) {
    const dragSource = useRef<string | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);

    // Build groups but keep root separate so it never disappears
    const rootFiles = files.filter((f) => !f.path.includes('/'));
    const subGroups: Record<string, ProjectFile[]> = {};
    files.forEach((f) => {
        const dir = getFileGroup(f);
        if (dir !== '/' && !subGroups[dir]) subGroups[dir] = [];
        if (dir !== '/') subGroups[dir].push(f);
    });

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

        const sourceFile = files.find((f) => f.path === source);
        if (!sourceFile) return;
        const sourceDir = getFileGroup(sourceFile);
        const sameDirFiles = sourceDir === '/'
            ? rootFiles
            : subGroups[sourceDir];
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

    const renderFile = (file: ProjectFile) => {
        const depth = file.path.split('/').length - 1;
        const fp = file.path;
        const isDragging = dragging === fp;
        const isOver = dragOver === fp;

        return (
            <div
                key={fp}
                className={cn('rounded-md transition-all', isOver && 'bg-primary/10 ring-2 ring-primary ring-inset')}
            >
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
                        isDragging && 'opacity-40',
                        dragging ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                    )}
                    style={{ paddingLeft: `${12 + depth * 12}px` }}
                >
                    <FileCode className={`size-3.5 shrink-0 ${EXT_ICONS[getExt(fp)] || ''}`} />
                    <span className="flex-1 truncate">{fp.split('/').pop()}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-1 text-sm select-none">
            {/* ── ROOT GROUP — always visible ── */}
            <div key="_root_">
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <Folder className="size-3" />
                    root
                </div>
                <div className="space-y-0.5">
                    {rootFiles.map((file) => renderFile(file))}
                </div>
            </div>

            {/* ── SUB FOLDERS ── */}
            {Object.entries(subGroups).map(([dir, dirFiles]) => (
                <div key={dir}>
                    <div
                        role="button"
                        tabIndex={0}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(dir); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => onDropToFolder(e, dir)}
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors text-muted-foreground',
                            dragging && 'rounded-md hover:bg-accent/50',
                            dragOver === dir && 'rounded-md bg-primary/10 ring-1 ring-primary',
                        )}
                    >
                        <Folder className="size-3" />
                        {dir}
                    </div>
                    <div className="space-y-0.5">
                        {dirFiles.map((file) => renderFile(file))}
                    </div>
                </div>
            ))}
        </div>
    );
}
