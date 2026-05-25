import { z } from 'zod'

import type { IRole } from '@/features/role/types/role-type'
import type { ISession } from '@/features/session/types/session-type'

export const profileNameValidation = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long').trim(),
})

export type profileDTO = z.infer<typeof profileNameValidation>

export const updateProfileValidation = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
})

export type UpdateProfileDTO = z.infer<typeof updateProfileValidation>

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
