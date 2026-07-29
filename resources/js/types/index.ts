export interface Flash {
    content?: string;
    type?: 'success' | 'error' | 'info';
}

export interface PageProps {
    flash: Flash;
    [key: string]: unknown;
}
