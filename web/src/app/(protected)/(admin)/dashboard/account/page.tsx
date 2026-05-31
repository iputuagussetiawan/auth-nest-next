import type { Metadata } from 'next'
import Profile from '@/features/user/component/profile'

export const metadata: Metadata = { title: 'Account' }

const AccountPage = () => {
    return (
        <div>
            <Profile />
        </div>
    )
}

export default AccountPage
