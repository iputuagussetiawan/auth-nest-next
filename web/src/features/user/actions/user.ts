'use server'

import { revalidatePath } from 'next/cache'

import { userService } from '../services/user-service'

export async function handleUpdateProfile(formData: FormData) {
    try {
        const result = await userService.update(formData)
        revalidatePath('/dashboard/account')
        return {
            success: true,
            result,
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to update',
        }
    }
}
