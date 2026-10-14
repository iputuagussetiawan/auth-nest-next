// Validation limits shared by the API DTOs and every client form.
// The API is the source of truth; clients mirror these so users see errors before submitting.

export const PASSWORD_MIN_LENGTH = 8
// bcrypt only uses the first 72 bytes, so longer passwords would be silently truncated.
export const PASSWORD_MAX_LENGTH = 72

export const NAME_MIN_LENGTH = 1
export const NAME_MAX_LENGTH = 50

export const VERIFICATION_CODE_MAX_LENGTH = 64

export interface AuthUser {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    profilePicture: string | null
    isActive: boolean
    isOnboardingCompleted: boolean
}

export interface LoginResult {
    user: AuthUser
    access_token: string
}
