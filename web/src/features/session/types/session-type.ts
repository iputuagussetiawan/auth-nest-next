import type { IApiResponse } from '@/features/auth/types/auth-type'

export interface ISession {
    id: string
    isCurrent: boolean
    ipAddress: string | null
    userAgent: string | null
    expiredAt: string
    lastActiveAt: string
    createdAt: string
    browser: string
    os: string
    device: 'desktop' | 'mobile' | 'tablet' | string
}

export type ISessionResponse = IApiResponse<ISession[]>
export type ISessionDeleteResponse = IApiResponse<null>
