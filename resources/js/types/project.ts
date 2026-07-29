export interface Project {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    description: string | null;
    template: string;
    config: Record<string, unknown> | null;
    published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    files_count?: number;
    assets_count?: number;
    files?: ProjectFile[];
    folders?: ProjectFolder[];
    assets?: ProjectAsset[];
}

export interface ProjectFile {
    id: number;
    project_id: number;
    path: string;
    content: string | null;
    mime_type: string;
    sort_order?: number;
    created_at: string;
    updated_at: string;
}

export interface ProjectFolder {
    id: number;
    project_id: number;
    name: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface ProjectAsset {
    id: number;
    project_id: number;
    filename: string;
    original_filename: string;
    path: string;
    mime_type: string;
    size: number;
    disk: string;
    created_at: string;
    updated_at: string;
}

export interface ShowProps {
    project: Project;
}
