export interface IPermission {
    id: string
    name: string
    description: string | null
    createdAt: string
    updatedAt: string
}

export interface IPermissionsResponse {
    status: string
    message: string
    data: IPermission[]
}
