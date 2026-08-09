import { FileCode } from 'lucide-react';
import { FileTree } from '../components/file-tree';
import { NewFileDialog } from '../components/new-file-dialog';
import type { ProjectFile, ProjectFolder, ProjectAsset } from '@/types/project';

interface EditorSidebarProps {
    files: ProjectFile[];
    folders: ProjectFolder[];
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
    onCreateFolder: () => void;
    onUploadAsset: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onReorder: (dir: string, reordered: ProjectFile[]) => void;
    onDropOnFolder: (filePath: string, targetDir: string) => void;
    onNewFileInFolder: (dir: string) => void;
    onRenameFolderByName: (folderName: string, newName: string) => void;
    onDeleteFolderByName: (folderName: string) => void;
}

export function EditorSidebar({
    files, folders, activeFile, newFileName, assets,
    onSelect, onDelete, onDuplicate, onRename, onMove,
    onChangeFileName, onCreateFile, onCreateFolder, onUploadAsset,
    onReorder, onDropOnFolder, onNewFileInFolder, onRenameFolderByName, onDeleteFolderByName,
}: EditorSidebarProps) {
    return (
        <div className="w-56 shrink-0 border-r bg-muted/30 p-2 overflow-y-auto">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Files</span>
                <NewFileDialog
                    newFileName={newFileName}
                    onChangeFileName={onChangeFileName}
                    onCreateFile={onCreateFile}
                    onCreateFolder={onCreateFolder}
                    onUploadAsset={onUploadAsset}
                    assets={assets}
                />
            </div>
            <FileTree
                files={files}
                folders={folders}
                activeFile={activeFile}
                onSelect={onSelect}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onRename={onRename}
                onMove={onMove}
                onReorder={onReorder}
                onDropOnFolder={onDropOnFolder}
                onNewFileInFolder={onNewFileInFolder}
                onRenameFolderByName={onRenameFolderByName}
                onDeleteFolderByName={onDeleteFolderByName}
            />
        </div>
    );
}
