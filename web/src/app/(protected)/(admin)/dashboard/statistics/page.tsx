import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Statistics' }

export default function StatisticsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Data Statistics</h2>
                <p className="text-muted-foreground text-sm">Visualize and explore your data</p>
            </div>
        </div>
    )
}
