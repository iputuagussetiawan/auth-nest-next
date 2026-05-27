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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { IAdminUser, IRole } from '../types/admin-types'

const editSchema = z.object({
    firstName: z.string().min(1, 'Required').max(100),
    lastName: z.string().min(1, 'Required').max(100),
    isActive: z.boolean(),
    roleId: z.string().uuid('Select a role'),
})

const createSchema = editSchema.extend({
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'Min 8 characters'),
})

type EditValues = z.infer<typeof editSchema>
type CreateValues = z.infer<typeof createSchema>
type FormValues = CreateValues

interface UserFormDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    user: IAdminUser | null
    roles: IRole[]
    onSubmit: (values: FormValues) => void
    isPending: boolean
}

export function UserFormDialog({ open, onOpenChange, user, roles, onSubmit, isPending }: UserFormDialogProps) {
    const isEdit = !!user
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(isEdit ? editSchema : createSchema) as any,
        defaultValues: { email: '', password: '', firstName: '', lastName: '', isActive: true, roleId: '' },
    })

    useEffect(() => {
        if (user) {
            reset({
                email: user.email,
                password: '',
                firstName: user.firstName ?? '',
                lastName: user.lastName ?? '',
                isActive: user.isActive,
                roleId: roles.find((r) => r.name === user.role)?.id ?? '',
            })
        } else {
            reset({ email: '', password: '', firstName: '', lastName: '', isActive: true, roleId: '' })
        }
    }, [user, roles, reset])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit User' : 'New User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {!isEdit && (
                        <>
                            <div className="space-y-1">
                                <Label>Email</Label>
                                <Input {...register('email')} type="email" placeholder="john@example.com" />
                                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Password</Label>
                                <Input {...register('password')} type="password" placeholder="Min 8 characters" />
                                {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>First Name</Label>
                            <Input {...register('firstName')} placeholder="John" />
                            {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Last Name</Label>
                            <Input {...register('lastName')} placeholder="Doe" />
                            {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Role</Label>
                        <Select value={watch('roleId')} onValueChange={(v) => setValue('roleId', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.roleId && <p className="text-destructive text-xs">{errors.roleId.message}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch
                            id="isActive"
                            checked={watch('isActive')}
                            onCheckedChange={(v) => setValue('isActive', v)}
                        />
                        <Label htmlFor="isActive">Active account</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
