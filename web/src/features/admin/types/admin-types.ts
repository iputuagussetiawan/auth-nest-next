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
    parentId: string | null
    name: string
    slug: string
    path: string
    icon: string | null
    description: string | null
    order: number
    isActive: boolean
    permissionIds: string[]
    createdAt: string
    updatedAt: string
}

export interface IAppModulesResponse {
    status: string
    message: string
    data: IAppModule[]
}

export interface IThemeVars {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    border: string
    input: string
    ring: string
    chart1: string
    chart2: string
    chart3: string
    chart4: string
    chart5: string
    sidebar: string
    sidebarForeground: string
    sidebarPrimary: string
    sidebarPrimaryForeground: string
    sidebarAccent: string
    sidebarAccentForeground: string
    sidebarBorder: string
    sidebarRing: string
}

export interface IThemeConfig {
    light: IThemeVars
    dark: IThemeVars
    radius: string
    fontFamily: string
    heroVariant: 'centered' | 'fullwidth'
    heroBackground: 'gradient' | 'solid' | 'mesh'
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

export interface ISiteSettings {
    id: string | null
    siteName: string
    tagline: string | null
    description: string | null
    logoUrl: string | null
    faviconUrl: string | null
    contactEmail: string | null
    contactPhone: string | null
    contactAddress: string | null
    socialTwitter: string | null
    socialFacebook: string | null
    socialInstagram: string | null
    socialLinkedin: string | null
    socialYoutube: string | null
    metaTitle: string | null
    metaDescription: string | null
    metaKeywords: string | null
    ogImageUrl: string | null
    googleAnalyticsId: string | null
    maintenanceMode: boolean
    maintenanceMessage: string | null
    createdAt: string
    updatedAt: string
}

export interface ISiteSettingsResponse {
    status: string
    message: string
    data: ISiteSettings
}

export interface IDashboardStats {
    totalUsers: number
    activeUsers: number
    unverifiedEmails: number
    activeSessions: number
    totalRoles: number
    totalModules: number
    totalPermissions: number
    usersByRole: { role: string; count: number }[]
    userGrowth: { month: string; users: number; sessions: number }[]
}

export interface IDashboardStatsResponse {
    status: string
    message: string
    data: IDashboardStats
}
