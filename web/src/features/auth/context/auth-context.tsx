'use client'

import { createContext, ReactNode, useContext } from 'react'

import type { IUserResponse } from '@/features/user/types/user-type'

interface AuthContextType {
    user: IUserResponse | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
    user,
    children,
}: {
    user: IUserResponse | null
    children: ReactNode
}) {
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
