import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage CV' }

export default function CvManagePage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Manage CV</h2>
                <p className="text-muted-foreground text-sm">Edit and update your resume</p>
            </div>
        </div>
    )
}
