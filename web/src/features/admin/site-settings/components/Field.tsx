import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'

interface FieldProps {
    label: string
    hint?: string
    error?: string
    children: ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}
