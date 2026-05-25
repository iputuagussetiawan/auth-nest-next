export const AUTH_COOKIE_NAME = 'accessToken'
export const SIGNUP_URL = '/signup'
export const SIGNIN_URL = '/signin'
export const SIGNOUT_URL = '/'
export const DASHBOARD_URL = '/dashboard'
export const ONBOARDING_URL = '/onboarding'

export const RESUME_MODE = {
    MANAGE: 'manage',
    PREVIEW: 'preview',
} as const

export type ResumeMode = (typeof RESUME_MODE)[keyof typeof RESUME_MODE]

export const SKELETON_STYLE = 'bg-gray-200/50'
