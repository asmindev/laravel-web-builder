export const EXT_ICONS: Record<string, string> = {
    ejs: 'text-orange-500',
    html: 'text-orange-500',
    css: 'text-blue-500',
    js: 'text-yellow-500',
    json: 'text-green-500',
};

export function getExt(path: string): string {
    return path.split('.').pop() || '';
}

export function mapLanguage(path: string): string {
    const ext = getExt(path);
    switch (ext) {
        case 'ejs':
        case 'html':
            return 'html';
        case 'css':
            return 'css';
        case 'js':
            return 'javascript';
        case 'json':
            return 'json';
        default:
            return 'plaintext';
    }
}
