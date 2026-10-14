import {
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    type ApiResponse,
    type LoginResult,
} from '@nest-auth/shared'
import { z } from 'zod'

const passwordField = () =>
    z
        .string()
        .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
        .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)

export const signupValidation = z.object({
    firstName: z.string().min(NAME_MIN_LENGTH, 'First name is required').max(NAME_MAX_LENGTH),
    lastName: z.string().min(NAME_MIN_LENGTH, 'Last name is required').max(NAME_MAX_LENGTH),
    email: z.email({ message: 'Please enter a valid email address' }),
    password: passwordField(),
})

export const signinValidation = z.object({
    email: z.email({ message: 'Please enter a valid email address' }),
    password: passwordField(),
})

export const forgotPasswordValidation = z.object({
    email: z.email({ message: 'Please enter a valid email address' }),
})

export const resetPasswordValidation = z.object({
    password: passwordField(),
})

export type SignupInputType = z.infer<typeof signupValidation>
export type SigninInputType = z.infer<typeof signinValidation>
export type ForgotPasswordInputType = z.infer<typeof forgotPasswordValidation>
export type ResetPasswordInputType = z.infer<typeof resetPasswordValidation>

export type ILoginResponse = ApiResponse<LoginResult>

export type IApiResponse<T> = ApiResponse<T>

export interface IVerifyInputType {
    code: string
}
