'use server'

import { revalidatePath } from 'next/cache'

import { userService } from '../services/user-service'

export async function handleUpdateProfile(data: { firstName?: string; lastName?: string }) {
    try {
        const result = await userService.updateProfile(data)
        revalidatePath('/dashboard/account')
        return { success: true, result }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update' }
    }
}
