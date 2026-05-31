import type { Metadata } from 'next'
import { RolesPage } from '@/features/admin/roles/roles-page'

export const metadata: Metadata = { title: 'Roles' }

export default function AdminRolesPage() {
    return <RolesPage />
}
