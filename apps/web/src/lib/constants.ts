export const AUTH_COOKIE_NAME = 'accessToken'
export const REFRESH_COOKIE_NAME = 'refreshToken'
export const SIGNUP_URL = '/signup'
export const SIGNIN_URL = '/signin'
// Clears stale auth cookies, then redirects to sign-in (used when the session was revoked or expired)
export const SESSION_EXPIRED_URL = '/session-expired'
export const SIGNOUT_URL = '/'
export const DASHBOARD_URL = '/dashboard'
export const ONBOARDING_URL = '/onboarding'

export const RESUME_MODE = {
    MANAGE: 'manage',
    PREVIEW: 'preview',
} as const

export type ResumeMode = (typeof RESUME_MODE)[keyof typeof RESUME_MODE]

export const SKELETON_STYLE = 'bg-gray-200/50'
