import type { IPermission } from '../../permissions/types/PermissionTypes'

export interface IRole {
    id: string
    name: string
    label: string | null
    description: string | null
    icon: string | null
    createdAt: string
    updatedAt: string
}

export interface IRolesResponse {
    status: string
    message: string
    data: IRole[]
}

export interface IRoleWithPermissions extends IRole {
    permissions: IPermission[]
    userCount: number
}

export interface IRolesWithPermissionsResponse {
    status: string
    message: string
    data: IRoleWithPermissions[]
}
