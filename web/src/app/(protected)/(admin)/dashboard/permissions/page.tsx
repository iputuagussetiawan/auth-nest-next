import type { Metadata } from 'next'
import { PermissionsPage } from '@/features/admin/permissions/permissions-page'

export const metadata: Metadata = { title: 'Permissions' }

export default function AdminPermissionsPage() {
    return <PermissionsPage />
}
