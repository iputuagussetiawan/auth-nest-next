import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Target Achieved' }

export default function TargetAchievedPage() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Target Achieved</h2>
                <p className="text-muted-foreground text-sm">Review your milestones and goals</p>
            </div>
        </div>
    )
}
