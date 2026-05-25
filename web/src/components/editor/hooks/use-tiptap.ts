import Placeholder from '@tiptap/extension-placeholder'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export const useTiptap = (content: string, onUpdate: (html: string) => void) => {
    return useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write something amazing...',
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content,
        // Keep this to prevent hydration errors in Next.js
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[150px] p-4 max-w-none leading-relaxed',
            },
        },
    })
}
