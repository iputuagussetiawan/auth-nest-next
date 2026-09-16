'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { UiButton } from '@/components/ui-custom/UiButton'
import { UiFormInput, UiFormTextarea } from '@/components/ui-custom/UiFormInput'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import type { IPermission } from './types/PermissionTypes'

const schema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(255).optional(),
})

type FormValues = z.infer<typeof schema>

interface PermissionFormDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    permission: IPermission | null
    onSubmit: (values: FormValues) => void
    isPending: boolean
}

export function PermissionFormDialog({
    open,
    onOpenChange,
    permission,
    onSubmit,
    isPending,
}: PermissionFormDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', description: '' },
    })

    useEffect(() => {
        reset({
            name: permission?.name ?? '',
            description: permission?.description ?? '',
        })
    }, [permission, reset])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{permission ? 'Edit Permission' : 'New Permission'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <UiFormInput
                        label="Name"
                        {...register('name')}
                        placeholder="e.g. users:read"
                        error={errors.name}
                    />

                    <UiFormTextarea
                        label="Description"
                        {...register('description')}
                        placeholder="What this permission allows"
                        rows={3}
                    />

                    <DialogFooter>
                        <UiButton
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </UiButton>
                        <UiButton type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save'}
                        </UiButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
