import { Editor } from '@tiptap/react'
import { Bold, Heading2, Italic, List } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Toolbar = ({ editor }: { editor: Editor }) => {
    return (
        <div className="flex items-center gap-1 border-b p-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted' : ''}
            >
                <Bold className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted' : ''}
            >
                <Italic className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
    )
}
