import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics' }

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/8 via-background to-background px-6 py-5 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-3xl font-semibold tracking-tight">Analytics</h2>
                    <p className="text-muted-foreground text-sm leading-6">Track your key metrics and performance</p>
                </div>
            </div>
        </div>
    )
}
