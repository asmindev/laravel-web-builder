import { Folder, FileCode, Trash2, Copy, Pencil, ArrowRight } from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
}

export function FileTree({ files, activeFile, onSelect, onDelete, onDuplicate, onRename, onMove }: FileTreeProps) {
    const groups: Record<string, ProjectFile[]> = {};

    files.forEach((f) => {
        const dir = getFileGroup(f);
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
