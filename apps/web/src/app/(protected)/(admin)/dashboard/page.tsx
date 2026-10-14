import type { Metadata } from 'next'

import { DashboardContent } from '@/features/admin/dashboard/components/DashboardContent'

export const metadata: Metadata = { title: 'Overview' }

export default function DashboardPage() {
    return <DashboardContent />
}
