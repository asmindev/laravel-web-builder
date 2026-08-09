import { useState, useRef } from 'react';
import { Folder, FileCode, Trash2, Copy, Pencil, ArrowRight, Plus } from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
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

    // Dialog States for Folder Delete / Move
    const [folderToDelete, setFolderToDelete] = useState<{ name: string; files: ProjectFile[] } | null>(null);
    const [folderToRename, setFolderToRename] = useState<{ oldName: string; newName: string } | null>(null);

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
                    <Folder className="size-3 text-amber-500" />
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
                        <ContextMenu>
                            <ContextMenuTrigger asChild>
                                <div className="group flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent/40 rounded-md cursor-pointer">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Folder className="size-3.5 text-amber-500 shrink-0" />
                                        <span className="font-semibold text-foreground truncate">{folderName}</span>
                                        <span className="text-[10px] text-muted-foreground font-normal">({dirFiles.length})</span>
                                    </div>
                                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNewFileInFolder(folderName);
                                            }}
                                            className="p-1 hover:text-primary transition-colors"
                                            title="Buat File di Folder Ini"
                                        >
                                            <Plus className="size-3 text-primary" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFolderToRename({ oldName: folderName, newName: folderName });
                                            }}
                                            className="p-1 hover:text-indigo-500 transition-colors"
                                            title="Pindahkan / Rename Folder"
                                        >
                                            <Pencil className="size-3 text-indigo-500" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFolderToDelete({ name: folderName, files: dirFiles });
                                            }}
                                            className="p-1 hover:text-red-500 transition-colors"
                                            title="Hapus Folder"
                                        >
                                            <Trash2 className="size-3 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => onNewFileInFolder(folderName)}>
                                    <Plus className="size-3.5 text-primary" /> Buat File di Folder ini
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => setFolderToRename({ oldName: folderName, newName: folderName })}>
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

                        <div className="space-y-0.5">
                            {dirFiles.map((file) => renderFile(file, 1))}
                        </div>
                    </div>
                );
            })}

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

            {/* Move / Rename Folder Dialog */}
            {folderToRename && (
                <Dialog open={!!folderToRename} onOpenChange={(open) => !open && setFolderToRename(null)}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Pencil className="size-4 text-primary" /> Pindahkan / Rename Folder
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Ubah nama folder <strong>"{folderToRename.oldName}"</strong>. Seluruh path file di dalamnya akan diperbarui secara otomatis.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-2">
                            <Label className="text-xs font-semibold">Nama / Path Folder Baru</Label>
                            <Input
                                value={folderToRename.newName}
                                onChange={(e) => setFolderToRename({ ...folderToRename, newName: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onRenameFolderByName(folderToRename.oldName, folderToRename.newName);
                                        setFolderToRename(null);
                                    }
                                }}
                                placeholder="misal: pages atau src/views"
                                className="h-8 text-xs font-mono"
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="flex gap-2 sm:justify-end">
                            <Button variant="outline" size="sm" onClick={() => setFolderToRename(null)}>
                                Batal
                            </Button>
                            <Button
                                size="sm"
                                className="font-bold"
                                disabled={!folderToRename.newName.trim() || folderToRename.newName === folderToRename.oldName}
                                onClick={() => {
                                    onRenameFolderByName(folderToRename.oldName, folderToRename.newName);
                                    setFolderToRename(null);
                                }}
                            >
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
