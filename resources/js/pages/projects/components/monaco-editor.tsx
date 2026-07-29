import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
    value: string;
    onChange: (val: string) => void;
    language: string;
}

export function MonacoEditor({ value, onChange, language }: MonacoEditorProps) {
    return (
        <Editor
            value={value}
            onChange={(val) => onChange(val ?? '')}
            language={language}
            theme="vs-dark"
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
            }}
        />
    );
}
