export interface ApiResponse<T> {
    status: string
    message: string
    data: T
}

export interface Paginated<T> {
    data: T[]
    total: number
    page: number
    limit: number
}
