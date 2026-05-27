'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { userService } from '../../services/user-service'

const schema = z.object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

interface ManagePasswordProps {
    onSuccess: () => void
}

export default function ManagePassword({ onSuccess }: ManagePasswordProps) {
    const qc = useQueryClient()
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: FormValues) => userService.updatePassword(data),
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
                <DialogDescription>Choose a strong password of at least 8 characters.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-4 py-2">
                <div className="space-y-1">
                    <Label>Current Password</Label>
                    <Input {...register('currentPassword')} type="password" placeholder="Current password" />
                    {errors.currentPassword && <p className="text-destructive text-xs">{errors.currentPassword.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label>New Password</Label>
                    <Input {...register('newPassword')} type="password" placeholder="New password" />
                    {errors.newPassword && <p className="text-destructive text-xs">{errors.newPassword.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Confirm New Password</Label>
                    <Input {...register('confirmPassword')} type="password" placeholder="Confirm password" />
                    {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                </DialogFooter>
            </form>
        </>
    )
}
