import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { DashboardLayoutClient } from './dashboard/layout-client'

export const metadata: Metadata = {
    title: { absolute: 'Dashboard', template: '%s | Dashboard' },
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
