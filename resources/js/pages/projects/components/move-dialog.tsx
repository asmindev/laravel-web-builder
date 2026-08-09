import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { FileCode, ArrowRight } from 'lucide-react';
import { EXT_ICONS, getExt } from '@/lib/file-utils';
import type { ProjectFile, ProjectFolder } from '@/types/project';

interface MoveDialogProps {
    moveTarget: string | null;
    moveValue: string;
    onChangeMoveValue: (val: string) => void;
    onMove: () => void;
    onClose: () => void;
    folders?: ProjectFolder[];
    files?: ProjectFile[];
}

export function MoveDialog({
    moveTarget,
    moveValue,
    onChangeMoveValue,
    onMove,
    onClose,
    folders = [],
    files = [],
}: MoveDialogProps) {
    const [isCustom, setIsCustom] = useState(false);

    // Extract all folder names
    const implicitFolderNames = new Set<string>();
    files.forEach((f) => {
        if (f.path.includes('/')) {
            const parts = f.path.split('/');
            implicitFolderNames.add(parts[0]);
        }
    });
    const availableFolders = Array.from(
        new Set([...folders.map((f) => f.name), ...implicitFolderNames])
    ).sort();

    const fileName = moveTarget ? moveTarget.split('/').pop()! : '';
    const currentFolder = moveTarget && moveTarget.includes('/')
        ? moveTarget.split('/').slice(0, -1).join('/')
        : 'root ( / )';

    // Calculate final destination path
    const destinationPath = !moveValue || moveValue === '/'
        ? fileName
        : `${moveValue.replace(/\/$/, '')}/${fileName}`;

    return (
        <Dialog open={!!moveTarget} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <ArrowRight className="size-5 text-primary" /> Pindahkan File
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Pilih folder tujuan untuk memindahkan berkas.
                    </DialogDescription>
                </DialogHeader>

                {moveTarget && (
                    <div className="space-y-4 py-2">
                        {/* Current File Info */}
                        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3 text-xs">
                            <FileCode className={`size-6 shrink-0 ${EXT_ICONS[getExt(moveTarget)] || 'text-slate-400'}`} />
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-foreground truncate">{fileName}</p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    Lokasi saat ini: <code className="font-mono bg-muted px-1 rounded">{currentFolder}</code>
                                </p>
                            </div>
                        </div>

                        {/* Folder Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Pilih Folder Tujuan</Label>
                            <select
                                value={isCustom ? '__custom__' : (moveValue || '/')}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '__custom__') {
                                        setIsCustom(true);
                                    } else {
                                        setIsCustom(false);
                                        onChangeMoveValue(val === '/' ? '' : val);
                                    }
                                }}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="/">📁 Root Directory ( / )</option>
                                {availableFolders.map((fName) => (
                                    <option key={fName} value={fName}>
                                        📁 {fName}
                                    </option>
                                ))}
                                <option value="__custom__">➕ Ketik Folder Baru / Custom Path</option>
                            </select>

                            {isCustom && (
                                <Input
                                    value={moveValue}
                                    onChange={(e) => onChangeMoveValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onMove()}
                                    placeholder="misal: src/components"
                                    className="h-8 text-xs font-mono mt-2"
                                    autoFocus
                                />
                            )}
                        </div>

                        {/* Destination Preview */}
                        <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs space-y-1">
                            <span className="text-[11px] font-medium text-muted-foreground">Lokasi Akhir File:</span>
                            <div className="font-mono text-primary font-bold truncate">
                                {destinationPath}
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        size="sm"
                        className="font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={onMove}
                    >
                        Pindahkan File
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
