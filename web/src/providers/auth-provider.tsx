'use client'

import React, { createContext, useContext } from 'react'

import type { IUserProfile } from '@/features/user/types/user-type'
import useAuth from '@/hooks/use-auth'

type AuthContextType = {
    user?: IUserProfile
    error: any
    isLoading: boolean
    isFetching: boolean
    refetch: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data, error, isLoading, isFetching, refetch } = useAuth()
    const user = data?.data

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, error, isLoading, isFetching, refetch }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used within a AuthProvider')
    }
    return context
}
