'use client'

import { EditorContent } from '@tiptap/react'

import { Toolbar } from './components/toolbar'
import { useTiptap } from './hooks/use-tiptap'

interface EditorProps {
    initialContent?: string
    onChange: (html: string) => void
    error?: boolean
}

export const RichTextEditor = ({ initialContent = '', onChange, error }: EditorProps) => {
    const editor = useTiptap(initialContent, onChange)

    // Skeleton loader while initializing
    if (!editor) {
        return (
            <div className="border-input bg-muted/20 h-[200px] w-full animate-pulse rounded-md border" />
        )
    }

    return (
        <div
            className={`relative w-full overflow-hidden rounded-md border shadow-sm transition-all focus-within:ring-1 ${
                error
                    ? 'border-destructive ring-destructive ring-1'
                    : 'border-input bg-background focus-within:ring-ring dark:border-zinc-800 dark:bg-zinc-950'
            }`}
        >
            {/* 1. Main Formatting Toolbar */}
            <Toolbar editor={editor} />

            {/* 2. The Editable Area */}
            <div className="min-h-[150px] cursor-text px-4 py-2">
                <EditorContent
                    editor={editor}
                    className="prose prose-sm dark:prose-invert h-full min-h-[150px] w-full max-w-none focus:outline-none"
                />
            </div>
        </div>
    )
}
