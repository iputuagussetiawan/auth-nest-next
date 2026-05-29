import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Browse Jobs' }

export default function BrowseJobsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Browse Jobs</h2>
                <p className="text-muted-foreground text-sm">Discover available job opportunities</p>
            </div>
        </div>
    )
}
