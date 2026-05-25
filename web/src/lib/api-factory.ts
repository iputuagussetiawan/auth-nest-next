import { AUTH_COOKIE_NAME, SIGNIN_URL } from './constants'

type ApiOptions = RequestInit & {
    next?: NextFetchRequestConfig
    params?: Record<string, string | number | boolean | undefined>
}

class FetchFactory {
    private async getRequestConfig(): Promise<Record<string, string>> {
        const headers: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }

        if (typeof window === 'undefined') {
            const { cookies } = await import('next/headers')
            const cookieStore = await cookies()
            const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

            if (token) headers['Authorization'] = `Bearer ${token}`
            headers['Cookie'] = cookieStore.toString()
        }

        return headers
    }

    async API<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const apiBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL
        const defaultHeaders = await this.getRequestConfig()

        const mergedHeaders: Record<string, string> = {
            ...defaultHeaders,
            ...(options.headers as Record<string, string>),
        }

        if (options.body instanceof FormData) {
            delete mergedHeaders['Content-Type']
        }

        let fullUrl = `${apiBaseUrl}${endpoint}`

        if (options.params) {
            const searchParams = new URLSearchParams()

            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString())
                }
            })

            const queryString = searchParams.toString()
            if (queryString) {
                fullUrl += fullUrl.includes('?') ? `&${queryString}` : `?${queryString}`
            }
        }

        const response = await fetch(fullUrl, {
            ...options,
            headers: mergedHeaders,
            credentials: options.credentials || 'include',
        })

        if (!response.ok) {
            if (response.status === 401 && typeof window !== 'undefined') {
                window.location.href = SIGNIN_URL
            }
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `API Error ${response.status}`)
        }

        return (await response.json()) as T
    }
}

export const api = new FetchFactory()
