import type { Metadata } from 'next'
import { ModulesPage } from '@/features/admin/modules/modules-page'

export const metadata: Metadata = { title: 'Modules' }

export default function AdminModulesPage() {
    return <ModulesPage />
}
