'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { UiButton } from '@/components/ui-custom/UiButton'
import { UiFormPassword } from '@/components/ui-custom/UiFormInput'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { accountService } from '../../services/AccountService'

const schema = z
    .object({
        currentPassword: z.string().min(1, 'Required'),
        newPassword: z.string().min(8, 'Min 8 characters'),
        confirmPassword: z.string().min(1, 'Required'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

type FormValues = z.infer<typeof schema>

interface ManagePasswordProps {
    onSuccess: () => void
}

export default function ManagePassword({ onSuccess }: ManagePasswordProps) {
    const qc = useQueryClient()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: FormValues) => accountService.updatePassword(data),
        onSuccess: () => {
            toast.success('Password updated')
            qc.invalidateQueries({ queryKey: ['user'] })
            reset()
            onSuccess()
        },
        onError: (e: any) => toast.error(e.message || 'Failed to update password'),
    })

    return (
        <>
            <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                    Choose a strong password of at least 8 characters.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-4 py-2">
                <UiFormPassword
                    label="Current Password"
                    {...register('currentPassword')}
                    placeholder="Current password"
                    error={errors.currentPassword}
                />
                <UiFormPassword
                    label="New Password"
                    {...register('newPassword')}
                    placeholder="New password"
                    error={errors.newPassword}
                />
                <UiFormPassword
                    label="Confirm New Password"
                    {...register('confirmPassword')}
                    placeholder="Confirm password"
                    error={errors.confirmPassword}
                />
                <DialogFooter>
                    <UiButton type="button" variant="outline" onClick={onSuccess}>
                        Cancel
                    </UiButton>
                    <UiButton type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                        Update Password
                    </UiButton>
                </DialogFooter>
            </form>
        </>
    )
}
