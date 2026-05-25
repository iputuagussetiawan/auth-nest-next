'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'

import { handleLogout } from '@/features/auth/actions/auth'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function LogoutMenuItem() {
    const [isPending, startTransition] = useTransition()
    const handleLogoutAction = () => {
        startTransition(async () => {
            await handleLogout()
        })
    }

    return (
        <DropdownMenuItem
            onClick={handleLogoutAction}
            disabled={isPending}
            className="text-destructive focus:text-destructive cursor-pointer"
        >
            <LogOut className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            <span>{isPending ? 'Logging out...' : 'Log out'}</span>
        </DropdownMenuItem>
    )
}
