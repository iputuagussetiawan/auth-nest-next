'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { IPermission } from '../types/admin-types'

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
    open, onOpenChange, permission, onSubmit, isPending,
}: PermissionFormDialogProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
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
                    <div className="space-y-1">
                        <Label>Name</Label>
                        <Input {...register('name')} placeholder="e.g. users:read" />
                        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label>Description</Label>
                        <Input {...register('description')} placeholder="What this permission allows" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
