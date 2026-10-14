'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import type { FallbackProps } from 'react-error-boundary'

import { Button } from '@/components/ui/button'

export function UsersError({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed">
            <div className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">Failed to load users</p>
            </div>
            <p className="text-muted-foreground max-w-sm text-center text-xs">
                {(error as Error).message}
            </p>
            <Button size="sm" variant="outline" onClick={resetErrorBoundary}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" /> Try again
            </Button>
        </div>
    )
}
