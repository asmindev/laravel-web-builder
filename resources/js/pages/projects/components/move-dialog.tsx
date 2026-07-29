import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface MoveDialogProps {
    moveTarget: string | null;
    moveValue: string;
    onChangeMoveValue: (val: string) => void;
    onMove: () => void;
    onClose: () => void;
}

export function MoveDialog({ moveTarget, moveValue, onChangeMoveValue, onMove, onClose }: MoveDialogProps) {
    return (
        <Dialog open={!!moveTarget} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Move File</DialogTitle>
                    <p className="text-xs text-muted-foreground">
                        Enter destination folder. File will be moved to{' '}
                        <code className="text-xs">{moveValue}/{moveTarget?.split('/').pop()}</code>
                    </p>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Destination folder</Label>
                        <Input
                            value={moveValue}
                            onChange={(e) => onChangeMoveValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onMove()}
                            placeholder="folder/subfolder"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={onMove} disabled={!moveValue}>
                            Move
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
