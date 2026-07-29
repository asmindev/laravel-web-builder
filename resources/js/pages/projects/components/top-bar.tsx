import { Save, Eye, Globe, Loader2, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { getExt, EXT_ICONS } from '@/lib/file-utils';
import type { Project } from '@/types/project';

interface TopBarProps {
    project: Project;
    activeFile: string | null;
    saving: boolean;
    publishing: boolean;
    onSave: () => void;
    onPublish: () => void;
}

export function TopBar({ project, activeFile, saving, publishing, onSave, onPublish }: TopBarProps) {
    return (
        <div className="-mx-4 -mt-4 mb-0 flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold">{project.name}</h1>
                {activeFile && (
                    <div className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                        <span className="text-xs text-muted-foreground/50">/</span>
                        <FileCode className={`size-3.5 ${EXT_ICONS[getExt(activeFile)] || ''}`} />
                        <span>{activeFile}</span>
                    </div>
                )}
                <Badge variant={project.published ? 'default' : 'secondary'}>
                    {project.published ? 'Published' : 'Draft'}
                </Badge>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Save className="mr-1 size-3" />}
                    Save
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href={route('projects.preview', project.slug)}>
                        <Eye className="mr-1 size-3" /> Preview
                    </Link>
                </Button>
                <Button size="sm" onClick={onPublish} disabled={publishing}>
                    {publishing ? (
                        <Loader2 className="mr-1 size-3 animate-spin" />
                    ) : (
                        <Globe className="mr-1 size-3" />
                    )}
                    Publish
                </Button>
            </div>
        </div>
    );
}
