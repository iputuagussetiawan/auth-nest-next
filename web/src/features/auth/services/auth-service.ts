import { api } from '@/lib/api-factory'

import type { IUserProfile } from '@/features/user/types/user-type'

import type {
    ForgotPasswordInputType,
    IVerifyInputType,
    SigninInputType,
    SignupInputType,
} from '../types/auth-type'

export const authService = {
    register: (data: SignupInputType) =>
        api.API<any>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),
    verify: (data: IVerifyInputType) =>
        api.API<IUserProfile>('/api/auth/verify/email', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),
    login: (data: SigninInputType) =>
        api.API<any>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),
    forgotPassword: (data: ForgotPasswordInputType) =>
        api.API<any>('/api/auth/password/forgot', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),
    resetPassword: (data: any) =>
        api.API<any>('/api/auth/password/reset', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),
    logout: () =>
        api.API<any>('/api/auth/logout', {
            method: 'POST',
            cache: 'no-store',
        }),
}
