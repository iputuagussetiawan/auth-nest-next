import { Transform } from 'class-transformer'

/** Emails are stored and compared lowercased so `Ann@x.com` and `ann@x.com` are one account */
export function normalizeEmail(email: string) {
    return email.trim().toLowerCase()
}

export const NormalizeEmail = () =>
    Transform(({ value }) => (typeof value === 'string' ? normalizeEmail(value) : value))
