import { useState } from 'react';
import { Plus, Image, File, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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

export function NewFileDialog({ newFileName, onChangeFileName, onCreateFile, onCreateFolder, onUploadAsset, assets }: NewFileDialogProps) {
    const [mode, setMode] = useState<CreateMode>('file');
    const [open, setOpen] = useState(false);

    const handleCreateFile = () => {
        onCreateFile();
        setOpen(false);
    };

    const handleCreateFolder = () => {
        onCreateFolder();
        setOpen(false);
    };

    const modes: { value: CreateMode; label: string; icon: typeof File }[] = [
        { value: 'file', label: 'File', icon: File },
        { value: 'folder', label: 'Folder', icon: FolderOpen },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                    <Plus className="size-3" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New {mode === 'file' ? 'File' : 'Folder'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex rounded-lg border p-0.5 bg-muted">
                        {modes.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                onClick={() => { setMode(m.value); onChangeFileName(''); }}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                    mode === m.value
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <m.icon className="size-3.5" />
                                {m.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label>{mode === 'file' ? 'Filename' : 'Folder name'}</Label>
                        <Input
                            value={newFileName}
                            onChange={(e) => onChangeFileName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (mode === 'file' ? handleCreateFile() : handleCreateFolder())}
                            placeholder={mode === 'file' ? 'about.ejs' : 'images'}
                        />
                    </div>

                    {mode === 'file' && (
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
                                    onClick={() => onChangeFileName(preset.value)}
                                    className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent data-[active=true]:border-primary"
                                    data-active={newFileName === preset.value}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <Button onClick={mode === 'file' ? handleCreateFile : handleCreateFolder} className="w-full">
                        Create {mode === 'file' ? 'File' : 'Folder'}
                    </Button>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Upload Asset</Label>
                        <Input type="file" onChange={onUploadAsset} className="text-xs" />
                    </div>

                    {assets && assets.length > 0 && (
                        <div>
                            <Label className="text-xs text-muted-foreground">Assets</Label>
                            <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                                {assets.map((asset) => (
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
    );
}
