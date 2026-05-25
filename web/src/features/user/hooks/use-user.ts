import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { userService } from '@/features/user/services/user-service'
import type { IUserProfileResponse, updateProfileDTO } from '@/features/user/types/user-type'

export function useUser(initialData?: IUserProfileResponse) {
    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: () => userService.getMe(),
        initialData,
    })

    return { user, isLoading }
}

export function useUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: updateProfileDTO) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] })
            toast.success('Profile updated')
        },
        onError: (error: Error) => {
            toast.error(error.message ?? 'Failed to update profile')
        },
    })
}

export function useUpdateAvatar() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (formData: FormData) => userService.updateAvatar(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] })
            toast.success('Avatar updated')
        },
        onError: (error: Error) => {
            toast.error(error.message ?? 'Failed to update avatar')
        },
    })
}
