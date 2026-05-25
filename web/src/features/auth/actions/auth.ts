'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decodeJwt } from 'jose'

import { AUTH_COOKIE_NAME, SIGNIN_URL } from '@/lib/constants'

import { authService } from '../services/auth-service'
import type {
    ForgotPasswordInputType,
    IUserProfile,
    IUserResponse,
    IVerifyInputType,
    SigninInputType,
    SignupInputType,
} from '../types/auth-type'

export async function handleRegister(data: SignupInputType) {
    try {
        const user = await authService.register(data)
        return { success: true, user }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to register' }
    }
}

export async function handleVerifyEmail(data: IVerifyInputType) {
    try {
        const user = await authService.verify(data)
        return { success: true, user }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to verify' }
    }
}

export async function handleLogin(data: SigninInputType) {
    try {
        // 1. Call the service layer (which uses your new LoginResponse interface)
        const response = await authService.login(data)

        // 2. Extract the token and user data
        const { access_token, user } = response.data

        // 3. Store the JWT in a secure HTTP-only cookie
        // This ensures the token cannot be stolen via JavaScript (XSS)
        const cookieStore = await cookies()
        cookieStore.set(AUTH_COOKIE_NAME, access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })

        // 4. Return success to the client-side form
        return { success: true, message: response.message, user }
    } catch (error: any) {
        // 🗝️ Pro Tip: Log the full error on the server, but send a clean message to the client
        console.error('Login Error:', error)

        return {
            success: false,
            error: error.message || 'Invalid email or password. Please try again.',
        }
    }
}

export async function handleForgotPassword(data: ForgotPasswordInputType) {
    try {
        // 2. Call your backend service
        // Ensure 'forgotPassword' is implemented in your userService
        await authService.forgotPassword(data)

        return {
            success: true,
            message: 'If an account exists with that email, a reset link has been sent.',
        }
    } catch (error: any) {
        // 🗝️ Security Tip: Often better to return success even if email isn't found
        // to prevent "Email Enumeration" attacks.
        return {
            success: false,
            error: error.message || 'Failed to send reset email. Please try again later.',
        }
    }
}

export async function handleResetPassword(data: any) {
    try {
        await authService.resetPassword(data)
        return {
            success: true,
            message: 'Your password has been successfully updated. You can now log in.',
        }
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message || error.message || 'Failed to update password'
        console.error('[RESET_PASSWORD_ERROR]:', error)
        return {
            success: false,
            error: errorMessage,
        }
    }
}

// export async function getCurrentUser(
//     shouldRedirect: boolean = false,
// ): Promise<IUserProfile | null> {
//     const cookieStore = await cookies()
//     const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

//     // 1. Jika tidak ada token
//     if (!token) {
//         if (shouldRedirect) redirect('/signin')
//         return null
//     }

//     try {
//         // 2. Dekode Payload JWT tanpa verifikasi signature (cepat & efisien untuk cek expiry)
//         const payload = decodeJwt(token)

//         // 3. Cek apakah ada field 'exp' (expiration)
//         if (payload.exp) {
//             const expirationTime = payload.exp * 1000 // JWT exp dalam detik, JS Date dalam milidetik
//             const now = Date.now()

//             if (now >= expirationTime) {
//                 console.warn('Sesi telah berakhir (Token Expired)')

//                 // Hapus token dari browser
//                 cookieStore.delete(AUTH_COOKIE_NAME)

//                 if (shouldRedirect) redirect('/signin')
//                 return null
//             }
//         }

//         // 4. Jika token masih valid, panggil API backend
//         const result: IUserResponse = await authService.getMe()

//         if (!result || !result.user) {
//             // Jika backend bilang user tidak ditemukan meski token belum expired
//             cookieStore.delete(AUTH_COOKIE_NAME)
//             if (shouldRedirect) redirect('/signin')
//             return null
//         }

//         return result.user
//     } catch (error: any) {
//         console.error('Gagal memproses user:', error.message)

//         // Jika error dari API adalah 401 (Unauthorized), hapus token
//         if (error.response?.status === 401) {
//             cookieStore.delete(AUTH_COOKIE_NAME)
//         }

//         if (shouldRedirect) redirect('/signin')
//         return null
//     }
// }

export async function handleLogout() {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (token) {
        try {
            await authService.logout()
        } catch (error) {
            console.error('Backend logout notice failed:', error)
        }
    }
    cookieStore.delete(AUTH_COOKIE_NAME)
    redirect(SIGNIN_URL)
}
