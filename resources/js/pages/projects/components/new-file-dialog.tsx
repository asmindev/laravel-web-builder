import { Plus, Image } from 'lucide-react';
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
import type { ProjectAsset } from '@/types/project';

interface NewFileDialogProps {
    newFileName: string;
    onChangeFileName: (val: string) => void;
    onCreateFile: () => void;
    onUploadAsset: (e: React.ChangeEvent<HTMLInputElement>) => void;
    assets?: ProjectAsset[];
}

export function NewFileDialog({ newFileName, onChangeFileName, onCreateFile, onUploadAsset, assets }: NewFileDialogProps) {
    return (
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
                            onChange={(e) => onChangeFileName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onCreateFile()}
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
                                onClick={() => onChangeFileName(preset.value)}
                                className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent data-[active=true]:border-primary"
                                data-active={newFileName === preset.value}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    <Button onClick={onCreateFile} className="w-full">
                        Create File
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
