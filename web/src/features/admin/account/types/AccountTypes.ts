import { z } from 'zod'

import type { ISession } from '@/features/admin/session/types/SessionType'

export const profileNameValidation = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long').trim(),
})

export type profileDTO = z.infer<typeof profileNameValidation>

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
    role: string | null
    roleId: string | null
    permissions: string[]
    sessions: ISession[]
}

export interface IUserProfileResponse {
    status: 'success' | 'error'
    message: string
    data: IUserProfile
}
