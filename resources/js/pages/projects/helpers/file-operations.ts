import type { ProjectFile } from '@/types/project';

export function generateDuplicatePath(path: string, existingFiles: ProjectFile[]): string {
    const ext = path.includes('.') ? '.' + path.split('.').pop() : '';
    const base = ext ? path.slice(0, -ext.length) : path;
    let newPath = base + '-copy' + ext;
    let i = 1;
    while (existingFiles.some((f) => f.path === newPath)) {
        newPath = base + '-copy-' + i + ext;
        i++;
    }
    return newPath;
}

export function buildMovePath(target: string, dest: string): string {
    return dest.endsWith('/')
        ? dest + target.split('/').pop()
        : dest + '/' + target.split('/').pop();
}

export function getFileGroup(file: ProjectFile): string {
    return file.path.includes('/') ? file.path.split('/')[0] : '/';
}
