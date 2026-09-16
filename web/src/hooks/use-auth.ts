'use client'

import { useQuery } from '@tanstack/react-query'

import { accountService } from '@/features/admin/account/services/AccountService'

const useAuth = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: accountService.getMe,
        staleTime: 5 * 60 * 1000,
        retry: 0,
    })
}

export default useAuth
