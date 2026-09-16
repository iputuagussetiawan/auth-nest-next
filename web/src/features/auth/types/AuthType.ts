import { z } from 'zod'

export const signupValidation = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signinValidation = z.object({
    email: z.email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const forgotPasswordValidation = z.object({
    email: z.email({ message: 'Please enter a valid email address' }),
})

export const resetPasswordValidation = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignupInputType = z.infer<typeof signupValidation>
export type SigninInputType = z.infer<typeof signinValidation>
export type ForgotPasswordInputType = z.infer<typeof forgotPasswordValidation>
export type ResetPasswordInputType = z.infer<typeof resetPasswordValidation>

export interface ILoginResponse {
    status: string
    message: string
    data: {
        user: {
            id: string
            firstName: string | null
            lastName: string | null
            email: string
            profilePicture: string | null
            isActive: boolean
            isOnboardingCompleted: boolean
        }
        access_token: string
    }
}

export interface IApiResponse<T> {
    status: string
    message: string
    data: T
}

export interface IVerifyInputType {
    code: string
}
