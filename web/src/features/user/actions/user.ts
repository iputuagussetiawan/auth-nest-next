'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decodeJwt } from 'jose'

import { AUTH_COOKIE_NAME } from '@/lib/constants'

import { userService } from '../services/user-service'
import type { IUserResponse } from '../types/user-type'

export async function getCurrentUser(
    shouldRedirect: boolean = false,
): Promise<IUserResponse | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    // 1. Jika tidak ada token
    if (!token) {
        if (shouldRedirect) redirect('/signin')
        return null
    }
    try {
        // 2. Dekode Payload JWT tanpa verifikasi signature (cepat & efisien untuk cek expiry)
        const payload = decodeJwt(token)

        // 3. Cek apakah ada field 'exp' (expiration)
        if (payload.exp) {
            const expirationTime = payload.exp * 1000 // JWT exp dalam detik, JS Date dalam milidetik
            const now = Date.now()

            if (now >= expirationTime) {
                console.warn('Sesi telah berakhir (Token Expired)')

                // Hapus token dari browser
                cookieStore.delete(AUTH_COOKIE_NAME)

                if (shouldRedirect) redirect('/signin')
                return null
            }
        }

        // 4. Jika token masih valid, panggil API backend
        const result = await userService.getMe()

        if (!result || !result.user) {
            // Jika backend bilang user tidak ditemukan meski token belum expired
            cookieStore.delete(AUTH_COOKIE_NAME)
            if (shouldRedirect) redirect('/signin')
            return null
        }

        return result
    } catch (error: any) {
        console.error('Gagal memproses user:', error.message)

        // Jika error dari API adalah 401 (Unauthorized), hapus token
        if (error.response?.status === 401) {
            cookieStore.delete(AUTH_COOKIE_NAME)
            shouldRedirect = true
        }

        if (error.status === 401) {
            // Clear the cookie client-side or redirect
            redirect('/signin')
        }

        if (shouldRedirect) redirect('/signin')
        return null
    }
}

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
