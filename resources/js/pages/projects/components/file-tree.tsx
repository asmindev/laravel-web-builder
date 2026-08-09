import { useState, useRef, useEffect } from 'react';
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
import { toast } from 'sonner';

// ── Tree Data Structures ──

export interface TreeFolderNode {
    type: 'folder';
    name: string; // display name e.g. "test"
    fullPath: string; // full path e.g. "views/test"
    dbFolder?: ProjectFolder;
    filesCount: number;
    children: TreeItemNode[];
}

export interface TreeFileNode {
    type: 'file';
    name: string; // display name e.g. "card.ejs"
    fullPath: string; // full path e.g. "views/test/card.ejs"
    file: ProjectFile;
}

export type TreeItemNode = TreeFolderNode | TreeFileNode;

function buildTree(files: ProjectFile[], folders: ProjectFolder[]): TreeItemNode[] {
    const folderMap = new Map<string, TreeFolderNode>();
    const rootItems: TreeItemNode[] = [];

    const ensureFolder = (path: string): TreeFolderNode => {
        if (folderMap.has(path)) return folderMap.get(path)!;

        const parts = path.split('/');
        const name = parts[parts.length - 1];
        const dbFolder = folders.find((f) => f.name === path);

        const node: TreeFolderNode = {
            type: 'folder',
            name,
            fullPath: path,
            dbFolder,
            filesCount: 0,
            children: [],
        };
        folderMap.set(path, node);

        if (parts.length > 1) {
            const parentPath = parts.slice(0, -1).join('/');
            const parentNode = ensureFolder(parentPath);
            if (!parentNode.children.some((c) => c.type === 'folder' && c.fullPath === path)) {
                parentNode.children.push(node);
            }
        } else {
            if (!rootItems.some((c) => c.type === 'folder' && c.fullPath === path)) {
                rootItems.push(node);
            }
        }
        return node;
    };

    // 1. Ensure all DB registered folders exist
    folders.forEach((f) => ensureFolder(f.name));

    // 2. Add all files
    files.forEach((file) => {
        const fileNode: TreeFileNode = {
            type: 'file',
            name: file.path.includes('/') ? file.path.split('/').pop()! : file.path,
            fullPath: file.path,
            file,
        };

        if (file.path.includes('/')) {
            const parts = file.path.split('/');
            const folderPath = parts.slice(0, -1).join('/');
            const parentFolder = ensureFolder(folderPath);
            parentFolder.children.push(fileNode);
        } else {
            rootItems.push(fileNode);
        }
    });

    // 3. Count files and sort children (folders first, then files alphabetically)
    const sortAndCount = (items: TreeItemNode[]): number => {
        let count = 0;
        items.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1; // Folders first!
            }
            return a.name.localeCompare(b.name);
        });

        items.forEach((item) => {
            if (item.type === 'file') {
                count += 1;
            } else {
                const subCount = sortAndCount(item.children);
                item.filesCount = subCount;
                count += subCount;
            }
        });
        return count;
    };

    sortAndCount(rootItems);
    return rootItems;
}

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
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);

    // Dialog / Inline States for Folder Operations
    const [folderToDelete, setFolderToDelete] = useState<{ name: string; files: ProjectFile[] } | null>(null);
    const [editingFolder, setEditingFolder] = useState<string | null>(null);
    const [editingFolderValue, setEditingFolderValue] = useState<string>('');

    // Folder Move Modal States
    const [folderToMove, setFolderToMove] = useState<string | null>(null);
    const [folderMoveTarget, setFolderMoveTarget] = useState<string>('/');
    const [isCustomFolderMove, setIsCustomFolderMove] = useState<boolean>(false);

    // Focus & select text ONCE when editing mode opens (prevents re-selecting on every key typed)
    useEffect(() => {
        if (editingFolder && folderInputRef.current) {
            folderInputRef.current.focus();
            folderInputRef.current.select();
        }
    }, [editingFolder]);

    const startRenameFolder = (folderPath: string, folderDisplayName: string) => {
        setEditingFolder(folderPath);
        setEditingFolderValue(folderDisplayName);
    };

    const submitRenameFolder = (oldPath: string) => {
        const newName = editingFolderValue.trim();
        if (!newName) {
            setEditingFolder(null);
            return;
        }
        const parts = oldPath.split('/');
        const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
        const newFullPath = parentPath ? `${parentPath}/${newName}` : newName;

        if (newFullPath !== oldPath) {
            onRenameFolderByName(oldPath, newFullPath);
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

    const onFolderDragStart = (e: React.DragEvent, folderPath: string) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', `folder:${folderPath}`);
        dragSource.current = `folder:${folderPath}`;
        setDragging(`folder:${folderPath}`);
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
        if (!source || source === targetPath || source.startsWith('folder:')) return;

        const sourceDir = source.includes('/') ? source.split('/').slice(0, -1).join('/') : '/';
        const rootFiles = files.filter((f) => !f.path.includes('/'));
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

    const onDropToFolder = (e: React.DragEvent, targetDir: string) => {
        e.preventDefault();
        const source = e.dataTransfer.getData('text/plain') || dragSource.current;
        if (!source) return;

        if (source.startsWith('folder:')) {
            const sourceFolder = source.replace('folder:', '');
            if (sourceFolder === targetDir) {
                setDragOver(null);
                return;
            }
            if (targetDir !== '/' && targetDir.startsWith(sourceFolder + '/')) {
                toast.error('Tidak bisa memindahkan folder ke dalam dirinya sendiri');
                setDragOver(null);
                return;
            }

            const folderBaseName = sourceFolder.split('/').pop()!;
            const newFolderName = targetDir === '/'
                ? folderBaseName
                : `${targetDir}/${folderBaseName}`;

            if (newFolderName !== sourceFolder) {
                onRenameFolderByName(sourceFolder, newFolderName);
            }
        } else {
            onDropOnFolder(source, targetDir);
        }
        setDragOver(null);
    };

    // ── Recursive Renderer ──

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

    const renderFolder = (node: TreeFolderNode, depth: number) => {
        const folderPath = node.fullPath;
        const folderDisplayName = node.name;
        const isFolderActive = activeFile?.startsWith(folderPath + '/');
        const isEditingThisFolder = editingFolder === folderPath;
        const isFolderDragging = dragging === `folder:${folderPath}`;
        const isOver = dragOver === folderPath;

        const collectFolderFiles = (items: TreeItemNode[]): ProjectFile[] => {
            let list: ProjectFile[] = [];
            items.forEach((item) => {
                if (item.type === 'file') list.push(item.file);
                else list = list.concat(collectFolderFiles(item.children));
            });
            return list;
        };

        const dirFiles = collectFolderFiles(node.children);

        return (
            <div
                key={folderPath}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOver(folderPath);
                }}
                onDragLeave={(e) => {
                    e.stopPropagation();
                    setDragOver(null);
                }}
                onDrop={(e) => onDropToFolder(e, folderPath)}
                className={cn(
                    'rounded-md transition-all space-y-0.5',
                    isOver && 'bg-primary/20 ring-2 ring-primary/40',
                )}
            >
                <DropdownMenu>
                    <ContextMenu>
                        <ContextMenuTrigger asChild>
                            <div
                                draggable
                                onDragStart={(e) => onFolderDragStart(e, folderPath)}
                                onDragEnd={onDragEnd}
                                className={cn(
                                    'flex w-full items-center justify-between py-1.5 pr-2 text-xs font-semibold rounded-md cursor-pointer transition-all duration-150',
                                    isFolderActive
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                                        : 'text-foreground/90 hover:bg-accent hover:text-foreground',
                                    isFolderDragging && 'opacity-40 ring-2 ring-dashed ring-amber-500',
                                    dragging ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                                )}
                                style={{ paddingLeft: `${10 + depth * 12}px` }}
                            >
                                {isEditingThisFolder ? (
                                    <div className="flex items-center gap-1.5 flex-1 pr-2">
                                        <Folder className="size-4 text-amber-500 shrink-0" />
                                        <Input
                                            ref={folderInputRef}
                                            value={editingFolderValue}
                                            onChange={(e) => setEditingFolderValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    submitRenameFolder(folderPath);
                                                } else if (e.key === 'Escape') {
                                                    setEditingFolder(null);
                                                }
                                            }}
                                            onBlur={() => submitRenameFolder(folderPath)}
                                            className="h-6 py-0 px-1 text-xs font-semibold font-mono border-primary bg-background w-36"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 truncate">
                                        <Folder className="size-4 text-amber-500 shrink-0" />
                                        <span className="truncate">{folderDisplayName}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
                                            {node.filesCount}
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
                            <ContextMenuItem onClick={() => onNewFileInFolder(folderPath)}>
                                <Plus className="size-3.5 text-primary" /> Buat File di Folder ini
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => startRenameFolder(folderPath, folderDisplayName)}>
                                <Pencil className="size-3.5 text-indigo-500" /> Rename Folder
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => {
                                    setFolderToMove(folderPath);
                                    setFolderMoveTarget('/');
                                    setIsCustomFolderMove(false);
                                }}
                            >
                                <ArrowRight className="size-3.5 text-emerald-500" /> Pindahkan Folder
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                                onClick={() => setFolderToDelete({ name: folderPath, files: dirFiles })}
                                variant="destructive"
                            >
                                <Trash2 className="size-3.5 text-red-500" /> Hapus Folder (Beserta Isinya)
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>

                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => onNewFileInFolder(folderPath)} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                            <Plus className="size-4 text-primary" /> Buat File di Folder ini
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startRenameFolder(folderPath, folderDisplayName)} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                            <Pencil className="size-4 text-indigo-500" /> Rename Folder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setFolderToMove(folderPath);
                                setFolderMoveTarget('/');
                                setIsCustomFolderMove(false);
                            }}
                            className="flex items-center gap-2 cursor-pointer text-xs font-medium text-emerald-600 dark:text-emerald-400"
                        >
                            <ArrowRight className="size-4 text-emerald-500" /> Pindahkan Folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setFolderToDelete({ name: folderPath, files: dirFiles })}
                            className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-red-600 dark:text-red-400 focus:text-red-600"
                        >
                            <Trash2 className="size-4 text-red-500" /> Hapus Folder (Beserta Isinya)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="space-y-0.5">
                    {node.children.map((child) => renderNode(child, depth + 1))}
                </div>
            </div>
        );
    };

    const renderNode = (node: TreeItemNode, depth: number) => {
        if (node.type === 'file') {
            return renderFile(node.file, depth);
        }
        return renderFolder(node, depth);
    };

    const treeItems = buildTree(files, folders);

    return (
        <div className="space-y-0.5 text-sm select-none">
            {/* Root Drop Zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOver('/');
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onDropToFolder(e, '/')}
                className={cn(
                    'rounded-md transition-all space-y-0.5 min-h-12',
                    dragOver === '/' && 'bg-primary/20 ring-2 ring-primary/40 p-1',
                )}
            >
                {treeItems.map((node) => renderNode(node, 0))}
            </div>

            {/* Pindahkan Folder Dialog Modal */}
            {folderToMove && (() => {
                const folderBaseName = folderToMove.split('/').pop()!;
                const destPath = !folderMoveTarget || folderMoveTarget === '/'
                    ? folderBaseName
                    : `${folderMoveTarget.replace(/\/$/, '')}/${folderBaseName}`;

                // Extract all folders list
                const implicitFolders = new Set<string>();
                files.forEach((f) => {
                    if (f.path.includes('/')) {
                        const parts = f.path.split('/');
                        parts.pop();
                        for (let i = 1; i <= parts.length; i++) {
                            implicitFolders.add(parts.slice(0, i).join('/'));
                        }
                    }
                });
                const allFoldersList = Array.from(new Set([...folders.map((f) => f.name), ...implicitFolders])).sort();

                // Valid targets = exclude folderToMove itself and its child subfolders
                const validTargets = allFoldersList.filter(
                    (fPath) => fPath !== folderToMove && !fPath.startsWith(folderToMove + '/')
                );

                return (
                    <Dialog open={!!folderToMove} onOpenChange={(open) => !open && setFolderToMove(null)}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                    <ArrowRight className="size-5 text-primary" /> Pindahkan Folder
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Pilih folder tujuan untuk memindahkan folder <strong>{folderBaseName}</strong>.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                {/* Current Location */}
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3 text-xs">
                                    <Folder className="size-6 text-amber-500 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-foreground truncate">{folderBaseName}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            Lokasi saat ini: <code className="font-mono bg-muted px-1 rounded">{folderToMove}</code>
                                        </p>
                                    </div>
                                </div>

                                {/* Target Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Pilih Folder Tujuan</Label>
                                    <select
                                        value={isCustomFolderMove ? '__custom__' : folderMoveTarget}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '__custom__') {
                                                setIsCustomFolderMove(true);
                                            } else {
                                                setIsCustomFolderMove(false);
                                                setFolderMoveTarget(val);
                                            }
                                        }}
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="/">📁 Root Directory ( / )</option>
                                        {validTargets.map((fName) => (
                                            <option key={fName} value={fName}>
                                                📁 {fName}
                                            </option>
                                        ))}
                                        <option value="__custom__">➕ Ketik Folder Baru / Custom Path</option>
                                    </select>

                                    {isCustomFolderMove && (
                                        <Input
                                            value={folderMoveTarget}
                                            onChange={(e) => setFolderMoveTarget(e.target.value)}
                                            placeholder="misal: src/components"
                                            className="h-8 text-xs font-mono mt-2"
                                            autoFocus
                                        />
                                    )}
                                </div>

                                {/* Destination Preview */}
                                <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs space-y-1">
                                    <span className="text-[11px] font-medium text-muted-foreground">Lokasi Akhir Folder:</span>
                                    <div className="font-mono text-primary font-bold truncate">
                                        {destPath}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="flex gap-2 sm:justify-end">
                                <Button variant="outline" size="sm" onClick={() => setFolderToMove(null)}>
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    className="font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={() => {
                                        if (destPath !== folderToMove) {
                                            onRenameFolderByName(folderToMove, destPath);
                                        }
                                        setFolderToMove(null);
                                    }}
                                >
                                    Pindahkan Folder
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            })()}

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
