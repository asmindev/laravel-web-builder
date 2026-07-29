import { X, FileCode } from 'lucide-react';
import { getExt, EXT_ICONS } from '@/lib/file-utils';

interface TabBarProps {
    openTabs: string[];
    activeFile: string | null;
    onSelect: (path: string) => void;
    onClose: (path: string) => void;
}

export function TabBar({ openTabs, activeFile, onSelect, onClose }: TabBarProps) {
    if (openTabs.length === 0) return null;

    return (
        <div className="flex shrink-0 items-center overflow-x-auto border-b bg-muted/20 text-sm">
            {openTabs.map((path) => (
                <button
                    key={path}
                    onClick={() => onSelect(path)}
                    className={`group flex shrink-0 items-center gap-1.5 border-r px-3 py-1.5 text-xs transition-colors hover:bg-muted/50 ${
                        path === activeFile
                            ? 'bg-background font-medium text-foreground'
                            : 'text-muted-foreground'
                    }`}
                >
                    <FileCode className={`size-3 ${EXT_ICONS[getExt(path)] || ''}`} />
                    <span className="max-w-32 truncate">{path.split('/').pop()}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(path); }}
                        className="-mr-0.5 ml-1 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted-foreground/20"
                    >
                        <X className="size-2.5" />
                    </button>
                </button>
            ))}
        </div>
    );
}
