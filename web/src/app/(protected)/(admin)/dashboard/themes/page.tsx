import type { Metadata } from 'next'
import { ThemesPage } from '@/features/admin/themes/themes-page'

export const metadata: Metadata = { title: 'Themes' }

export default function AdminThemesPage() {
    return <ThemesPage />
}
