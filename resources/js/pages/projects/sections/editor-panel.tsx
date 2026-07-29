import { FileCode } from 'lucide-react';
import { MonacoEditor } from '../components/monaco-editor';

interface EditorPanelProps {
    activeFile: string | null;
    content: string;
    language: string;
    onChange: (val: string) => void;
}

export function EditorPanel({ activeFile, content, language, onChange }: EditorPanelProps) {
    if (!activeFile) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <FileCode className="mx-auto mb-2 size-8" />
                    <p>Select a file to edit</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-border">
            <MonacoEditor
                key={activeFile}
                value={content}
                onChange={onChange}
                language={language}
            />
        </div>
    );
}
