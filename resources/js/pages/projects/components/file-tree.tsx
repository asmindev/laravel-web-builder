import { useState, useRef } from 'react';
import { motion } from 'motion/react';
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
    // Ref for instant synchronous reads during drag events; state for re-render/visuals
    const draggedPathRef = useRef<string | null>(null);
    const [draggedPath, setDraggedPath] = useState<string | null>(null);
    const [dragOverPath, setDragOverPath] = useState<string | null>(null);

    const groups: Record<string, ProjectFile[]> = {};

    files.forEach((f) => {
        const dir = getFileGroup(f);
        if (!groups[dir]) groups[dir] = [];
        groups[dir].push(f);
    });

    const handleDragStart = (path: string) => {
        draggedPathRef.current = path;
        setDraggedPath(path);
    };

    const handleDragEnd = () => {
        draggedPathRef.current = null;
        setDraggedPath(null);
        setDragOverPath(null);
    };

    const handleDragOverFile = (e: React.DragEvent, targetPath: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const source = draggedPathRef.current;
        if (!source || source === targetPath) return;
        setDragOverPath(targetPath);
    };

    const handleDropOnFile = (targetPath: string, dirFiles: ProjectFile[], dir: string) => {
        const sourcePath = draggedPathRef.current;
        if (!sourcePath || sourcePath === targetPath) {
            setDragOverPath(null);
            return;
        }

        const sourceIdx = dirFiles.findIndex((f) => f.path === sourcePath);
        if (sourceIdx === -1) {
            setDragOverPath(null);
            return;
        }

        const targetIdx = dirFiles.findIndex((f) => f.path === targetPath);
        if (targetIdx === -1) {
            setDragOverPath(null);
            return;
        }

        const reordered = [...dirFiles];
        const [moved] = reordered.splice(sourceIdx, 1);
        reordered.splice(targetIdx, 0, moved);

        onReorder(dir, reordered);
        setDragOverPath(null);
    };

    const handleDropOnFolderHeader = (dir: string) => {
        const sourcePath = draggedPathRef.current;
        if (sourcePath) {
            onDropOnFolder(sourcePath, dir);
        }
        setDragOverPath(null);
    };

    const renderFile = (file: ProjectFile, dir: string) => {
        const depth = dir === '/' ? 0 : file.path.split('/').length - 1;

        const content = (
            <button
                onClick={() => onSelect(file.path)}
                className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                    activeFile === file.path
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50',
                )}
                style={{ paddingLeft: `${12 + depth * 12}px` }}
            >
                <FileCode className={`size-3.5 ${EXT_ICONS[getExt(file.path)] || ''}`} />
                <span className="flex-1 truncate">{file.path.split('/').pop()}</span>
            </button>
        );

        const item = (
            <div
                onDragOver={(e) => handleDragOverFile(e, file.path)}
                onDrop={() => handleDropOnFile(file.path, groups[dir], dir)}
                className={cn('rounded-md', draggedPath === file.path && 'opacity-50')}
            >
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        {content}
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
            </div>
        );

        return (
            <motion.div
                key={file.path}
                layout="position"
                className={cn(
                    'relative rounded-md transition-colors',
                    dragOverPath === file.path && 'border-t border-primary',
                )}
            >
                <div
                    draggable
                    onDragStart={() => handleDragStart(file.path)}
                    onDragEnd={handleDragEnd}
                >
                    {item}
                </div>
            </motion.div>
        );
    };

    const isRoot = (dir: string) => dir === '/';

    return (
        <div className="space-y-1 text-sm">
            {Object.entries(groups).map(([dir, dirFiles]) => (
                <motion.div key={dir} layout="position">
                    {isRoot(dir) ? (
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground">
                            <Folder className="size-3" />
                            root
                        </div>
                    ) : (
                        <ContextMenu>
                            <ContextMenuTrigger asChild>
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                    }}
                                    onDrop={() => handleDropOnFolderHeader(dir)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground"
                                >
                                    <Folder className="size-3" />
                                    {dir}
                                </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => onNewFileInFolder(dir)}>
                                    <Plus className="size-3.5" /> New File
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => onRenameFolder(dir)}>
                                    <Pencil className="size-3.5" /> Rename Folder
                                </ContextMenuItem>
                                <ContextMenuItem
                                    onClick={() => onDeleteFolder(dir)}
                                    variant="destructive"
                                >
                                    <Trash2 className="size-3.5" /> Delete Folder
                                </ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    )}

                    <div className="space-y-0.5">
                        {dirFiles.map((file) => renderFile(file, dir))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
