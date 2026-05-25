'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, SIGNIN_URL } from '@/lib/constants'

import { authService } from '../services/auth-service'

export async function handleLogout() {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (token) {
        try {
            await authService.logout()
        } catch (error) {
            console.error('Backend logout failed:', error)
        }
    }
    cookieStore.delete(AUTH_COOKIE_NAME)
    cookieStore.delete(REFRESH_COOKIE_NAME)
    redirect(SIGNIN_URL)
}
