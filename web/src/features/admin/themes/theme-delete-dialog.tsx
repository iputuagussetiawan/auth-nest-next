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
import type { ITheme } from '../types/admin-types'

interface ThemeDeleteDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    theme: ITheme | null
    onConfirm: () => void
    isPending: boolean
}

export function ThemeDeleteDialog({ open, onOpenChange, theme, onConfirm, isPending }: ThemeDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Theme</AlertDialogTitle>
                    <AlertDialogDescription>
                        Permanently delete theme <strong>{theme?.name}</strong>? This action cannot be undone.
                        {theme?.isActive && (
                            <span className="mt-1 block text-destructive font-medium">
                                Warning: this is the active theme. Deleting it will revert to the default theme.
                            </span>
                        )}
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
