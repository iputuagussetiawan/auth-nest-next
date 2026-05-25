import { z } from 'zod'

import type { IRole } from '@/features/role/types/role-type'
import type { ISession } from '@/features/session/types/session-type'

export const profileValidation = z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long').trim(),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long').trim(),
})

export type updateProfileDTO = z.infer<typeof profileValidation>

export interface IUserProfile {
    id: string
    email: string
    firstName: string
    lastName: string
    profilePicture: string | null
    isEmailVerified: boolean
    isActive: boolean
    provider: 'email' | 'google' | 'github' | string
    lastLogin: string | null
    createdAt: string
    updatedAt: string
    role: IRole
    permissions: string[]
    sessions: ISession[]
}

export interface IUserProfileResponse {
    status: 'success' | 'error'
    message: string
    data: IUserProfile
}
