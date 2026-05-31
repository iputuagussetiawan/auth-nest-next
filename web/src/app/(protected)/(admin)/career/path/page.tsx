import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Career Path' }

export default function CareerPathPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Career Path</h2>
                <p className="text-muted-foreground text-sm">Plan and visualize your career journey</p>
            </div>
        </div>
    )
}
