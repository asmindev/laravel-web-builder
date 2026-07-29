import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { useProjectFiles } from './hooks/use-project-files';
import { mapLanguage } from '@/lib/file-utils';
import { TopBar } from './components/top-bar';
import { RenameDialog } from './components/rename-dialog';
import { MoveDialog } from './components/move-dialog';
import { EditorSidebar } from './sections/editor-sidebar';
import { EditorPanel } from './sections/editor-panel';
import type { ShowProps } from '@/types/project';

export default function ProjectShow({ project }: ShowProps) {
    const f = useProjectFiles(project);
    const currentLanguage = f.currentFile ? mapLanguage(f.currentFile.path) : 'plaintext';

    return (
        <AdminLayout header={<span className="text-sm font-medium">Editor</span>}>
            <Head title={project.name} />

            <TopBar
                project={project}
                activeFile={f.activeFile}
                saving={f.saving}
                publishing={f.publishing}
                onSave={f.handleSave}
                onPublish={f.handlePublish}
            />

            <div className="flex min-w-0 flex-1 overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
                <EditorSidebar
                    files={f.files}
                    folders={f.folders}
                    activeFile={f.activeFile}
                    newFileName={f.newFileName}
                    assets={project.assets}
                    onSelect={f.setActiveAndOpen}
                    onDelete={f.handleDeleteFile}
                    onDuplicate={f.handleDuplicateFile}
                    onRename={(path) => {
                        f.setRenameTarget(path);
                        f.setRenameValue(path);
                    }}
                    onMove={(path) => {
                        f.setMoveTarget(path);
                        f.setMoveValue(path.split('/').slice(0, -1).join('/') || '/');
                    }}
                    onChangeFileName={f.setNewFileName}
                    onCreateFile={f.handleCreateFile}
                    onCreateFolder={f.handleCreateFolder}
                    onUploadAsset={f.handleAssetUpload}
                    onReorder={f.handleReorder}
                    onDropOnFolder={f.handleDropOnFolder}
                    onNewFileInFolder={f.handleNewFileInFolder}
                    onRenameFolder={f.handleRenameFolder}
                    onDeleteFolder={f.handleDeleteFolder}
                />

                <RenameDialog
                    renameTarget={f.renameTarget}
                    renameValue={f.renameValue}
                    onChangeRenameValue={f.setRenameValue}
                    onRename={f.handleRenameFile}
                    onClose={() => { f.setRenameTarget(null); f.setRenameValue(''); }}
                />

                <MoveDialog
                    moveTarget={f.moveTarget}
                    moveValue={f.moveValue}
                    onChangeMoveValue={f.setMoveValue}
                    onMove={f.handleMoveFile}
                    onClose={() => { f.setMoveTarget(null); f.setMoveValue(''); }}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="relative min-w-0 flex-1 overflow-hidden">
                        <EditorPanel
                            activeFile={f.activeFile}
                            content={f.content}
                            language={currentLanguage}
                            onChange={f.setContent}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
