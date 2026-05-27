'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { IAppModule } from '../types/admin-types'

interface ModuleDeleteDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    module: IAppModule | null
    onConfirm: () => void
    isPending: boolean
}

export function ModuleDeleteDialog({ open, onOpenChange, module, onConfirm, isPending }: ModuleDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Module</AlertDialogTitle>
                    <AlertDialogDescription>
                        Permanently delete module <strong>{module?.name}</strong>? The generated page file
                        at <code className="text-xs">/dashboard/{module?.slug}</code> will also be removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
