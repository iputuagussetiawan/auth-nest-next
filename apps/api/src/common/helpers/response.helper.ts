export function successResponse<T>(message: string, data?: T) {
    return { status: 'success', message, data: data ?? null }
}
