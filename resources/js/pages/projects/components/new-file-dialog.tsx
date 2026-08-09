import { useState } from 'react';
import { Plus, Image, File, FolderOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ProjectAsset } from '@/types/project';

interface NewFileDialogProps {
    newFileName: string;
    onChangeFileName: (val: string) => void;
    onCreateFile: () => void;
    onCreateFolder: () => void;
    onUploadAsset: (e: React.ChangeEvent<HTMLInputElement>) => void;
    assets?: ProjectAsset[];
}

type CreateMode = 'file' | 'folder';

export function NewFileDialog({
    newFileName,
    onChangeFileName,
    onCreateFile,
    onCreateFolder,
    onUploadAsset,
    assets,
}: NewFileDialogProps) {
    const [mode, setMode] = useState<CreateMode>('file');
    const [open, setOpen] = useState(false);

    const handleCreateFile = () => {
        if (!newFileName.trim()) return;
        onCreateFile();
        setOpen(false);
    };

    const handleCreateFolder = () => {
        if (!newFileName.trim()) return;
        onCreateFolder();
        setOpen(false);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="size-6 p-0 hover:bg-accent" title="Tambah File / Folder">
                    <Plus className="size-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Buat Baru</span>
                    <div className="flex rounded-md border p-0.5 bg-muted">
                        <button
                            type="button"
                            onClick={() => { setMode('file'); onChangeFileName(''); }}
                            className={cn(
                                'flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                                mode === 'file' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <File className="size-3" /> File
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('folder'); onChangeFileName(''); }}
                            className={cn(
                                'flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                                mode === 'folder' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <FolderOpen className="size-3" /> Folder
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Input
                        value={newFileName}
                        onChange={(e) => onChangeFileName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                mode === 'file' ? handleCreateFile() : handleCreateFolder();
                            }
                        }}
                        placeholder={mode === 'file' ? 'Nama file (mis. index.ejs)' : 'Nama folder (mis. views)'}
                        className="h-8 text-xs font-mono"
                        autoFocus
                    />
                </div>

                {mode === 'file' && (
                    <div className="flex flex-wrap gap-1">
                        {[
                            { label: '.ejs', value: 'index.ejs' },
                            { label: '.css', value: 'style.css' },
                            { label: '.js', value: 'script.js' },
                            { label: '.json', value: 'data.json' },
                        ].map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => onChangeFileName(preset.value)}
                                className={cn(
                                    'rounded border px-2 py-0.5 text-[10px] font-medium transition-colors hover:bg-accent',
                                    newFileName === preset.value ? 'border-primary bg-primary/10 text-primary font-bold' : 'text-muted-foreground'
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                )}

                <Button
                    size="sm"
                    onClick={mode === 'file' ? handleCreateFile : handleCreateFolder}
                    disabled={!newFileName.trim()}
                    className="w-full h-7 text-xs font-bold"
                >
                    + Buat {mode === 'file' ? 'File' : 'Folder'}
                </Button>

                <DropdownMenuSeparator />

                <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Upload className="size-3" /> Upload Asset File
                    </Label>
                    <Input type="file" onChange={(e) => { onUploadAsset(e); setOpen(false); }} className="h-8 text-[11px] cursor-pointer" />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
