import { FileCode } from 'lucide-react';
import { FileTree } from '../components/file-tree';
import { NewFileDialog } from '../components/new-file-dialog';
import type { ProjectFile, ProjectAsset } from '@/types/project';

interface EditorSidebarProps {
    files: ProjectFile[];
    activeFile: string | null;
    newFileName: string;
    assets?: ProjectAsset[];
    onSelect: (path: string) => void;
    onDelete: (path: string) => void;
    onDuplicate: (path: string) => void;
    onRename: (path: string) => void;
    onMove: (path: string) => void;
    onChangeFileName: (val: string) => void;
    onCreateFile: () => void;
    onUploadAsset: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditorSidebar({
    files, activeFile, newFileName, assets,
    onSelect, onDelete, onDuplicate, onRename, onMove,
    onChangeFileName, onCreateFile, onUploadAsset,
}: EditorSidebarProps) {
    return (
        <div className="w-56 shrink-0 border-r bg-muted/30 p-2 overflow-y-auto">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Files</span>
                <NewFileDialog
                    newFileName={newFileName}
                    onChangeFileName={onChangeFileName}
                    onCreateFile={onCreateFile}
                    onUploadAsset={onUploadAsset}
                    assets={assets}
                />
            </div>
            <FileTree
                files={files}
                activeFile={activeFile}
                onSelect={onSelect}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onRename={onRename}
                onMove={onMove}
            />
        </div>
    );
}
