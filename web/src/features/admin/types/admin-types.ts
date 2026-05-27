export interface IAdminUser {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    profilePicture: string | null
    isEmailVerified: boolean
    isActive: boolean
    provider: string
    lastLogin: string | null
    createdAt: string
    role: string | null
}

export interface IAdminUsersResponse {
    status: string
    message: string
    data: {
        data: IAdminUser[]
        total: number
        page: number
        limit: number
    }
}

export interface IRole {
    id: string
    name: string
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
}

export interface IRolesWithPermissionsResponse {
    status: string
    message: string
    data: IRoleWithPermissions[]
}

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

export interface IAppModule {
    id: string
    name: string
    slug: string
    path: string
    icon: string | null
    description: string | null
    order: number
    isActive: boolean
    roleIds: string[]
    permissionIds: string[]
    createdAt: string
    updatedAt: string
}

export interface IAppModulesResponse {
    status: string
    message: string
    data: IAppModule[]
}

export interface IThemeConfig {
    primaryColor: string
    accentColor: string
    backgroundColor: string
    foregroundColor: string
    cardColor: string
    borderRadius: string
    fontFamily: string
    heroVariant: 'centered' | 'fullwidth'
    heroBackground: 'gradient' | 'solid' | 'mesh'
    darkMode: boolean
}

export interface ITheme {
    id: string
    name: string
    slug: string
    isActive: boolean
    config: IThemeConfig
    createdAt: string
    updatedAt: string
}

export interface IThemesResponse {
    status: string
    message: string
    data: ITheme[]
}

export interface IThemeResponse {
    status: string
    message: string
    data: ITheme
}
