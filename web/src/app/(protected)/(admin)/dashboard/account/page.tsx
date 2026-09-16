import type { Metadata } from 'next'
import Profile from '@/features/admin/account/components/Profile'

export const metadata: Metadata = { title: 'Account' }

const AccountPage = () => {
    return (
        <div>
            <Profile />
        </div>
    )
}

export default AccountPage
