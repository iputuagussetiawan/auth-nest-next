import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { IUser } from '@/features/session/types/session-type'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UiFormInput } from '@/components/ui/UiFormInput'

import { handleUpdateProfile } from '../../actions/user'
import { updateProfileValidation, type UpdateProfileDTO } from '../../types/user-type'

interface ProfileSettingsProps {
    user: IUser
    onSuccess: () => void
}

export default function ManageEmail({ user, onSuccess }: ProfileSettingsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }, // Destructure formState for cleaner code
    } = useForm<UpdateProfileDTO>({
        resolver: zodResolver(updateProfileValidation),
        defaultValues: {
            email: user.email,
        },
    })

    const onSubmit = async (values: UpdateProfileDTO) => {
        if (!values.email || values.email === user.email) return
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('email', values.email)
            await handleUpdateProfile(formData) // Your Server Action

            await new Promise((resolve) => setTimeout(resolve, 1500))

            toast.success('Email updated! Please verify your new address.')

            // ✅ Close the dialog after success
            onSuccess()
            reset(values) // Reset dirty state
        } catch (error) {
            toast.error('Update failed')
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <>
            <DialogHeader>
                <DialogTitle>Manage Emails</DialogTitle>
                <DialogDescription>Update your primary email address here.</DialogDescription>
            </DialogHeader>
            <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="py-4">
                        <UiFormInput
                            label="Email Address"
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            {...register('email')}
                            error={errors.email}
                            disabled={isLoading}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading || !isDirty}
                            className="w-full sm:w-auto"
                        >
                            {isLoading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Save Email' : 'Save Email'}
                        </Button>
                    </DialogFooter>
                </form>
            </div>
        </>
    )
}
