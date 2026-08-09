import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import type { Project, ProjectFile, ProjectFolder } from '@/types/project';
import { generateDuplicatePath, buildMovePath, getFileGroup } from '../helpers/file-operations';

export function useProjectFiles(project: Project) {
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [files, setFiles] = useState<ProjectFile[]>(project.files || []);
    const [folders, setFolders] = useState<ProjectFolder[]>(project.folders || []);
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [openTabs, setOpenTabs] = useState<string[]>(() => (project.files || []).map((f) => f.path));
    const [renameTarget, setRenameTarget] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [moveTarget, setMoveTarget] = useState<string | null>(null);
    const [moveValue, setMoveValue] = useState('');

    // Auto-select first file when files are loaded
    useEffect(() => {
        if (files.length > 0 && !activeFile) {
            const first = files[0].path;
            setActiveFile(first);
            setOpenTabs((prev) => (prev.includes(first) ? prev : [...prev, first]));
        }
    }, [files]);

    // Sync content when activeFile or files change
    useEffect(() => {
        const file = files.find((f) => f.path === activeFile);
        if (file) {
            setContent(file.content ?? '');
        }
    }, [activeFile, files]);

    const setActiveAndOpen = (path: string) => {
        setActiveFile(path);
        setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    };

    const closeTab = (path: string) => {
        setOpenTabs((prev) => {
            const next = prev.filter((p) => p !== path);
            if (path === activeFile) {
                if (next.length > 0) {
                    const idx = prev.indexOf(path);
                    const fallback = next[Math.min(idx, next.length - 1)];
                    setActiveFile(fallback);
                } else {
                    setActiveFile(null);
                }
            }
            return next;
        });
    };

    // ponytail: activeFile / content accessed via refs to avoid re-subscribing handler on every change
    const handleSave = useCallback(() => {
        if (!activeFile) return;
        setSaving(true);
        router.post(route('projects.files.store', project.slug), {
            path: activeFile,
            content,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Saved!');
                setFiles((prev) =>
                    prev.map((f) => (f.path === activeFile ? { ...f, content } : f)),
                );
                setSaving(false);
            },
            onError: () => {
                toast.error('Failed to save');
                setSaving(false);
            },
        });
    }, [activeFile, content, project.slug]);

    // Ctrl+S keyboard shortcut
    useEffect(() => {
        const handler = (e: globalThis.KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    const handleDeleteFile = (path: string) => {
        router.delete(route('projects.files.destroy', [project.slug, path]), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setFiles((prev) => {
                    const remaining = prev.filter((f) => f.path !== path);
                    if (activeFile === path) {
                        const fallback = remaining.find(() => true)?.path ?? null;
                        setActiveFile(fallback);
                    }
                    return remaining;
                });
                toast.success('File deleted');
            },
            onError: () => toast.error('Failed to delete file'),
        });
    };

    const handleCreateFile = () => {
        if (!newFileName) return;

        const path = newFileName;
        router.post(route('projects.files.store', project.slug), {
            path,
            content: '',
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedFiles = (page.props.project as Project)?.files ?? [];
                setFiles(updatedFiles);
                setActiveAndOpen(path);
                setNewFileName('');
                toast.success('File created');
            },
            onError: () => {
                toast.error('Failed to create file');
            },
        });
    };

    const handleCreateFolder = () => {
        if (!newFileName) return;

        const name = newFileName.replace(/\/$/, '').replace(/\.gitkeep$/, '');
        router.post(route('projects.folders.store', project.slug), { name }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedFolders = (page.props.project as Project)?.folders ?? [];
                setFolders(updatedFolders);
                setNewFileName('');
                toast.success('Folder created');
            },
            onError: () => {
                toast.error('Failed to create folder');
            },
        });
    };

    const handlePublish = () => {
        setPublishing(true);
        router.post(route('projects.publish', project.slug), undefined, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Project published!');
                router.reload({ only: ['project'] });
                setPublishing(false);
            },
            onError: () => {
                toast.error('Publish failed');
                setPublishing(false);
            },
        });
    };

    const handleDuplicateFile = (path: string) => {
        const source = files.find((f) => f.path === path);
        if (!source) return;

        const newPath = generateDuplicatePath(path, files);
        router.post(route('projects.files.store', project.slug), {
            path: newPath,
            content: source.content,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedFiles = (page.props.project as Project)?.files ?? [];
                setFiles(updatedFiles);
                toast.success('Duplicated');
            },
            onError: () => toast.error('Failed to duplicate'),
        });
    };

    const handleRenameFile = () => {
        if (!renameTarget || !renameValue) return;
        if (files.some((f) => f.path === renameValue && f.path !== renameTarget)) {
            toast.error('File already exists');
            return;
        }
        const source = files.find((f) => f.path === renameTarget);
        if (!source) return;

        router.post(route('projects.files.store', project.slug), {
            path: renameValue,
            content: source.content,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                router.delete(route('projects.files.destroy', [project.slug, renameTarget]), {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setFiles((prev) =>
                            prev
                                .filter((f) => f.path !== renameTarget)
                                .concat({ ...source, path: renameValue }),
                        );
                        setOpenTabs((prev) => prev.map((p) => (p === renameTarget ? renameValue : p)));
                        if (activeFile === renameTarget) setActiveAndOpen(renameValue);
                        setRenameTarget(null);
                        setRenameValue('');
                        toast.success('Renamed');
                    },
                    onError: () => toast.error('Failed to rename'),
                });
            },
            onError: () => toast.error('Failed to rename'),
        });
    };

    const handleMoveFile = () => {
        if (!moveTarget || !moveValue) return;
        const newPath = buildMovePath(moveTarget, moveValue);
        if (files.some((f) => f.path === newPath)) {
            toast.error('File already exists at destination');
            return;
        }
        const source = files.find((f) => f.path === moveTarget);
        if (!source) return;

        router.post(route('projects.files.store', project.slug), {
            path: newPath,
            content: source.content,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                router.delete(route('projects.files.destroy', [project.slug, moveTarget]), {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setFiles((prev) =>
                            prev
                                .filter((f) => f.path !== moveTarget)
                                .concat({ ...source, path: newPath }),
                        );
                        setOpenTabs((prev) => prev.map((p) => (p === moveTarget ? newPath : p)));
                        if (activeFile === moveTarget) setActiveAndOpen(newPath);
                        setMoveTarget(null);
                        setMoveValue('');
                        toast.success('Moved');
                    },
                    onError: () => toast.error('Failed to move'),
                });
            },
            onError: () => toast.error('Failed to move'),
        });
    };

    const handleReorder = (dir: string, reordered: ProjectFile[]) => {
        const prev = files;
        setFiles((prev2) => {
            const others = prev2.filter((f) => getFileGroup(f) !== dir);
            return [...others, ...reordered];
        });

        const payload = reordered.map((f, i) => ({
            path: f.path,
            sort_order: i,
        }));

        router.post(route('projects.files.reorder', project.slug), { files: payload }, {
            preserveState: true,
            preserveScroll: true,
            onError: () => {
                setFiles(prev);
                toast.error('Failed to reorder');
            },
        });
    };

    const handleDropOnFolder = (filePath: string, targetDir: string) => {
        const source = files.find((f) => f.path === filePath);
        if (!source) return;
        const currentDir = getFileGroup(source);
        if (currentDir === targetDir) return;

        const newPath = targetDir === '/'
            ? filePath.split('/').pop()!
            : `${targetDir}/${filePath.split('/').pop()}`;

        if (files.some((f) => f.path === newPath)) {
            toast.error('File already exists at destination');
            return;
        }

        // Optimistic update — move file locally first
        const prev = files;
        const movedFile = { ...source, path: newPath };
        setFiles((prev2) =>
            prev2
                .filter((f) => f.path !== filePath)
                .concat(movedFile),
        );
        setOpenTabs((prev2) => prev2.map((p) => (p === filePath ? newPath : p)));
        if (activeFile === filePath) setActiveFile(newPath);

        // Server: create new path + delete old path
        router.post(route('projects.files.store', project.slug), {
            path: newPath,
            content: source.content,
        }, {
            preserveState: true,
            preserveScroll: true,
            onError: () => {
                setFiles(prev);
                setOpenTabs((prev2) => prev2.map((p) => (p === newPath ? filePath : p)));
                if (activeFile === newPath) setActiveFile(filePath);
                toast.error('Failed to move');
            },
            onSuccess: () => {
                router.delete(route('projects.files.destroy', [project.slug, filePath]), {
                    preserveState: true,
                    preserveScroll: true,
                    onError: () => {
                        toast.error('Moved but old file could not be deleted');
                        router.reload({ only: ['project'] });
                    },
                });
            },
        });
    };

    const handleNewFileInFolder = (dir: string) => {
        setNewFileName(dir === '/' ? '' : `${dir}/`);
    };

    const handleRenameFolderByName = (folderName: string, newName: string) => {
        if (!newName || newName === folderName) return;
        const dbFolder = folders.find((f) => f.name === folderName);

        if (dbFolder) {
            router.put(route('projects.folders.update', [project.slug, dbFolder.id]), { name: newName }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedFolders = (page.props.project as Project)?.folders ?? [];
                    const updatedFiles = (page.props.project as Project)?.files ?? [];
                    setFolders(updatedFolders);
                    setFiles(updatedFiles);
                    setOpenTabs((prev) => prev.map((p) => p.startsWith(folderName + '/') ? p.replace(folderName + '/', newName + '/') : p));
                    if (activeFile?.startsWith(folderName + '/')) {
                        setActiveFile(activeFile.replace(folderName + '/', newName + '/'));
                    }
                    toast.success('Folder renamed');
                },
                onError: () => toast.error('Failed to rename folder'),
            });
        } else {
            const folderFiles = files.filter((f) => f.path.startsWith(folderName + '/'));
            folderFiles.forEach((file) => {
                const newPath = file.path.replace(folderName + '/', newName + '/');
                router.post(route('projects.files.store', project.slug), { path: newPath, content: file.content }, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        router.delete(route('projects.files.destroy', [project.slug, file.path]), {
                            preserveState: true,
                            preserveScroll: true,
                        });
                    },
                });
            });
            toast.success('Folder renamed');
            router.reload({ only: ['project'] });
        }
    };

    const handleDeleteFolderByName = (folderName: string) => {
        const dbFolder = folders.find((f) => f.name === folderName);

        if (dbFolder) {
            router.delete(route('projects.folders.destroy', [project.slug, dbFolder.id]), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedFolders = (page.props.project as Project)?.folders ?? [];
                    const updatedFiles = (page.props.project as Project)?.files ?? [];
                    setFolders(updatedFolders);
                    setFiles(updatedFiles);
                    const prefix = folderName + '/';
                    setOpenTabs((prev) => prev.filter((p) => !p.startsWith(prefix)));
                    if (activeFile?.startsWith(prefix)) {
                        setActiveFile(updatedFiles[0]?.path ?? null);
                    }
                    toast.success(`Folder "${folderName}" deleted`);
                },
                onError: () => toast.error('Failed to delete folder'),
            });
        } else {
            const folderFiles = files.filter((f) => f.path.startsWith(folderName + '/'));
            folderFiles.forEach((file) => {
                router.delete(route('projects.files.destroy', [project.slug, file.path]), {
                    preserveState: true,
                    preserveScroll: true,
                });
            });
            const prefix = folderName + '/';
            setOpenTabs((prev) => prev.filter((p) => !p.startsWith(prefix)));
            if (activeFile?.startsWith(prefix)) {
                setActiveFile(files.filter((f) => !f.path.startsWith(prefix))[0]?.path ?? null);
            }
            toast.success(`Folder "${folderName}" deleted`);
            router.reload({ only: ['project'] });
        }
    };

    const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('file', file);
        router.post(route('projects.assets.store', project.slug), form, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Asset uploaded');
                router.reload({ only: ['project'] });
            },
            onError: () => toast.error('Upload failed'),
        });
    };

    return {
        // state
        activeFile,
        files,
        folders,
        content,
        saving,
        newFileName,
        publishing,
        openTabs,
        renameTarget,
        renameValue,
        moveTarget,
        moveValue,
        currentFile: files.find((f) => f.path === activeFile),
        // setters
        setContent,
        setNewFileName,
        setRenameTarget,
        setRenameValue,
        setMoveTarget,
        setMoveValue,
        // handlers
        setActiveAndOpen,
        closeTab,
        handleSave,
        handleDeleteFile,
        handleCreateFile,
        handleCreateFolder,
        handlePublish,
        handleDuplicateFile,
        handleRenameFile,
        handleMoveFile,
        handleReorder,
        handleDropOnFolder,
        handleRenameFolderByName,
        handleDeleteFolderByName,
        handleAssetUpload,
    };
}
