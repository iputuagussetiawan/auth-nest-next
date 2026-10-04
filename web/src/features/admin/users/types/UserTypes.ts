import type { ApiResponse, Paginated } from '@nest-auth/shared'

export interface IAdminUser {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    profilePicture: string | null
    isEmailVerified: boolean
    isActive: boolean
    provider: string
    lastLogin: string | null
    createdAt: string
    role: string | null
}

export type IAdminUsersResponse = ApiResponse<Paginated<IAdminUser>>
