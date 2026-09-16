'use client'

import * as React from 'react'

import { Input as ShadcnInput } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

function UiInput({ className, ...props }: React.ComponentProps<'input'>) {
    return (
        <ShadcnInput
            className={cn(
                'file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 border-transparent bg-muted/30 dark:bg-white/5 dark:hover:bg-white/10 h-9 w-full min-w-0 rounded-full border bg-clip-padding px-2.5 py-1 text-sm outline-none select-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/5 disabled:opacity-50 dark:disabled:bg-white/10',
                className,
            )}
            {...props}
        />
    )
}

function UiTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <ShadcnTextarea
            className={cn(
                'placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 border-transparent bg-muted disabled:bg-black/5 dark:bg-white/5 dark:disabled:bg-white/10 flex field-sizing-content min-h-16 w-full rounded-2xl border bg-clip-padding px-2.5 py-2 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className,
            )}
            {...props}
        />
    )
}

export { UiInput, UiTextarea }
