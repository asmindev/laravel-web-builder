import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RenameDialogProps {
    renameTarget: string | null;
    renameValue: string;
    onChangeRenameValue: (val: string) => void;
    onRename: () => void;
    onClose: () => void;
}

export function RenameDialog({ renameTarget, renameValue, onChangeRenameValue, onRename, onClose }: RenameDialogProps) {
    return (
        <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>New filename</Label>
                        <Input
                            value={renameValue}
                            onChange={(e) => onChangeRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onRename()}
                            placeholder="about.ejs"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={onRename} disabled={!renameValue}>
                            Rename
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
