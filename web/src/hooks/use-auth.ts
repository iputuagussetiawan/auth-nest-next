'use client'

import { useQuery } from '@tanstack/react-query'

import { userService } from '@/features/user/services/user-service'

const useAuth = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: userService.getMe,
        staleTime: Infinity,
    })
}

export default useAuth
