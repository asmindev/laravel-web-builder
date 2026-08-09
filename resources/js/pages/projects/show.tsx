import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { mapLanguage } from '@/lib/file-utils';
import type { ShowProps } from '@/types/project';
import { Head, router } from '@inertiajs/react';
import { Check, CheckCircle2, Copy, ExternalLink, Loader2, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MoveDialog } from './components/move-dialog';
import { RenameDialog } from './components/rename-dialog';
import { TabBar } from './components/tab-bar';
import { TopBar } from './components/top-bar';
import { useProjectFiles } from './hooks/use-project-files';
import { EditorPanel } from './sections/editor-panel';
import { EditorSidebar } from './sections/editor-sidebar';

export default function ProjectShow({ project }: ShowProps) {
    const f = useProjectFiles(project);
    const currentLanguage = f.currentFile ? mapLanguage(f.currentFile.path) : 'plaintext';

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Prompt Enhancer States
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [appName, setAppName] = useState(project.name);
    const [appDesc, setAppDesc] = useState(project.description || '');
    const [appType, setAppType] = useState('nodejs');
    const [enhancing, setEnhancing] = useState(false);
    const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [enhanceError, setEnhanceError] = useState<string | null>(null);

    const handleDeleteProject = () => {
        setDeleting(true);
        router.delete(route('projects.destroy', project.slug), {
            onFinish: () => setDeleting(false),
        });
    };

    const handleEnhancePrompt = () => {
        if (!appName || !appDesc) return;
        setEnhancing(true);
        setEnhancedPrompt(null);
        setEnhanceError(null);

        router.post(
            route('ai.enhance-prompt'),
            {
                app_name: appName,
                app_description: appDesc,
                app_type: appType,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const result = (page.props as any)?.flash?.enhanced_prompt || (page.props as any)?.enhanced_prompt;
                    if (result) {
                        setEnhancedPrompt(result);
                    }
                },
                onError: (errs) => {
                    console.error('Failed to enhance prompt', errs);
                    const firstMsg = Object.values(errs)[0];
                    setEnhanceError(typeof firstMsg === 'string' ? firstMsg : 'Gagal memproses prompt AI');
                },
                onFinish: () => {
                    setEnhancing(false);
                },
            },
        );
    };

    const copyToClipboard = () => {
        if (enhancedPrompt) {
            navigator.clipboard.writeText(enhancedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

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
                onOpenPromptModal={() => setShowPromptModal(true)}
                onOpenDeleteModal={() => setShowDeleteModal(true)}
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
                    onClose={() => {
                        f.setRenameTarget(null);
                        f.setRenameValue('');
                    }}
                />

                <MoveDialog
                    moveTarget={f.moveTarget}
                    moveValue={f.moveValue}
                    onChangeMoveValue={f.setMoveValue}
                    onMove={f.handleMoveFile}
                    onClose={() => {
                        f.setMoveTarget(null);
                        f.setMoveValue('');
                    }}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    <TabBar openTabs={f.openTabs} activeFile={f.activeFile} onSelect={f.setActiveAndOpen} onClose={f.closeTab} />
                    <div className="relative min-w-0 flex-1 overflow-hidden">
                        <EditorPanel activeFile={f.activeFile} content={f.content} language={currentLanguage} onChange={f.setContent} />
                    </div>
                </div>
            </div>

            {/* Prompt Enhancer Modal */}
            <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
                <DialogContent className="min-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="size-5 text-amber-500" /> Buat Master Prompt AI (Gemini)
                        </DialogTitle>
                        <DialogDescription>
                            Gunakan generator ini untuk membuat Master Prompt komprehensif yang telah dilengkapi aturan otomatisasi Node.js, Session
                            Auth, Tailwind v4, & DB Seeding default.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Nama Proyek</Label>
                            <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Contoh: Toko Online UMKM" />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Deskripsi Fitur / Aplikasi</Label>
                            <Textarea
                                value={appDesc}
                                onChange={(e) => setAppDesc(e.target.value)}
                                placeholder="Jelaskan kebutuhan aplikasi Anda..."
                                className="h-24 resize-none text-xs"
                            />
                        </div>

                        <div className="flex items-center justify-between border-t border-b border-border py-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                <Sparkles className="size-4 text-amber-500" />
                                <span>Gemini Prompt Enhancer</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-bold border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                    asChild
                                >
                                    <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="size-3.5 text-indigo-500" /> Buka Gemini
                                    </a>
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                                    disabled={!appName || !appDesc || enhancing}
                                    onClick={handleEnhancePrompt}
                                >
                                    {enhancing ? (
                                        <>
                                            <Loader2 className="size-3.5 animate-spin" /> Enhancing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="size-3.5 text-amber-500" /> Generate Prompt Master
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {enhanceError && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                                <ShieldAlert className="size-4 shrink-0" />
                                <span>{enhanceError}</span>
                            </div>
                        )}

                        {enhancedPrompt && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="size-3.5" /> Prompt Generated!
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="secondary" size="sm" className="h-7 gap-1 text-xs" onClick={copyToClipboard}>
                                            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                                            {copied ? 'Copied!' : 'Copy Prompt'}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-7 gap-1 bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
                                            asChild
                                        >
                                            <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="size-3" /> Buka Gemini
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                                <Textarea value={enhancedPrompt} readOnly className="h-44 resize-none bg-background font-mono text-xs" />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                            asChild
                        >
                            <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="size-3.5 text-indigo-500" /> Buka Gemini AI
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowPromptModal(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Project Confirmation Dialog */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="size-5" /> Hapus Proyek ini?
                        </DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus proyek <strong>{project.name}</strong>? Tindakan ini tidak dapat dibatalkan dan seluruh
                            file serta aset proyek akan dihapus secara permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
                            {deleting ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Ya, Hapus Proyek
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
