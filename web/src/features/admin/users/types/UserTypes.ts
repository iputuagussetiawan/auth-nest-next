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

export interface IAdminUsersResponse {
    status: string
    message: string
    data: {
        data: IAdminUser[]
        total: number
        page: number
        limit: number
    }
}
