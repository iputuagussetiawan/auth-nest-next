'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { UiButton } from '@/components/ui-custom/UiButton'
import { UiFormInput, UiFormPassword, UiFormSwitch } from '@/components/ui-custom/UiFormInput'
import { UiFormSearchSelect } from '@/components/ui-custom/UiFormSearchSelect'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import type { IRole } from '../../roles/types/RoleTypes'
import type { IAdminUser } from '../types/UserTypes'

const editSchema = z.object({
    firstName: z.string().min(1, 'Required').max(100),
    lastName: z.string().min(1, 'Required').max(100),
    isActive: z.boolean(),
    roleId: z.string().uuid('Select a role'),
})

const createSchema = editSchema.extend({
    email: z.email('Valid email required'),
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

export function UserFormDialog({
    open,
    onOpenChange,
    user,
    roles,
    onSubmit,
    isPending,
}: UserFormDialogProps) {
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
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            isActive: true,
            roleId: '',
        },
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
            reset({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                isActive: true,
                roleId: '',
            })
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
                            <UiFormInput
                                label="Email"
                                {...register('email')}
                                type="email"
                                placeholder="john@example.com"
                                error={errors.email}
                            />
                            <UiFormPassword
                                label="Password"
                                {...register('password')}
                                placeholder="Min 8 characters"
                                error={errors.password}
                            />
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <UiFormInput
                            label="First Name"
                            {...register('firstName')}
                            placeholder="John"
                            error={errors.firstName}
                        />
                        <UiFormInput
                            label="Last Name"
                            {...register('lastName')}
                            placeholder="Doe"
                            error={errors.lastName}
                        />
                    </div>

                    <UiFormSearchSelect
                        label="Role"
                        value={watch('roleId')}
                        onChange={(v) => setValue('roleId', v)}
                        options={roles.map((r) => ({ value: r.id, label: r.name }))}
                        placeholder="Select role"
                        searchPlaceholder="Search roles..."
                        error={errors.roleId}
                    />

                    <UiFormSwitch
                        label="Active account"
                        id="isActive"
                        checked={watch('isActive')}
                        onCheckedChange={(v) => setValue('isActive', v)}
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
