import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { Project } from '@/types';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw, Server } from 'lucide-react';

interface PreviewProps {
    project: Project;
}

export default function Preview({ project }: PreviewProps) {
    const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [engineStatus, setEngineStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    const previewUrl = route('app.preview', [project.slug]);

    const fetchPreview = useCallback(async () => {
        if (!project.published) {
            setLoading(false);
            setError(true);
            return;
        }

        setLoading(true);
        setError(false);

        try {
            const res = await fetch(previewUrl);
            if (!res.ok) throw new Error('Not found');
            const html = await res.text();
            setRenderedHtml(html);
            setEngineStatus('online');
        } catch {
            setError(true);
            setEngineStatus('offline');
        } finally {
            setLoading(false);
        }
    }, [previewUrl, project.published]);

    useEffect(() => {
        fetchPreview();
    }, [fetchPreview]);

    // Check engine health
    useEffect(() => {
        fetch(previewUrl)
            .then((r) => r.ok ? setEngineStatus('online') : setEngineStatus('offline'))
            .catch(() => setEngineStatus('offline'));
    }, [previewUrl]);

    return (
        <AdminLayout header={null}>
            <Head title={`Preview - ${project.name}`} />

            <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('projects.show', project.slug)}>
                            <ArrowLeft className="mr-1 size-3" /> Back to Editor
                        </Link>
                    </Button>
                    <h1 className="text-sm font-medium">Preview: {project.name}</h1>
                    <div className="flex items-center gap-1.5">
                        <Server className="size-3 text-muted-foreground" />
                        <span className={`text-xs ${
                            engineStatus === 'online' ? 'text-green-600' :
                            engineStatus === 'offline' ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                            Engine {engineStatus}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchPreview} disabled={loading}>
                        <RefreshCw className={`mr-1 size-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    {project.published && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={previewUrl} target="_blank" rel="noopener">
                                <ExternalLink className="mr-1 size-3" /> Open Live
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-white" style={{ height: 'calc(100vh - 8rem)' }}>
                {loading ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 size-4 animate-spin" /> Rendering...
                    </div>
                ) : error ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <p className="mb-1 font-medium">Preview unavailable</p>
                            <p className="text-sm">
                                {!project.published
                                    ? 'Publish the project first to preview.'
                                    : engineStatus === 'offline'
                                        ? 'Node engine is not running.'
                                        : 'Project not found or not published.'}
                            </p>
                            {engineStatus === 'offline' && project.published && (
                                <Button variant="outline" size="sm" className="mt-4" onClick={fetchPreview}>
                                    <RefreshCw className="mr-1 size-3" /> Retry
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <iframe
                        title="Preview"
                        srcDoc={renderedHtml || ''}
                        className="h-full w-full border-0"
                        sandbox="allow-scripts"
                    />
                )}
            </div>
        </AdminLayout>
    );
}
