import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import { Skeleton } from '@/components/ui/skeleton'

export function SiteSettingsLoading() {
    return (
        <DashboardPageMain>
            <div className="border-border/60 min-w-0 border-b px-4 pb-4 sm:px-6">
                <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-28" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="h-9 w-32 rounded-full" />
                </div>
            </div>

            <DashboardPageCard className="overflow-visible">
                <div className="gap-6 lg:flex lg:flex-row lg:gap-8">
                    <div className="bg-muted/30 flex flex-wrap items-center gap-1 rounded-xl border p-1 lg:w-44 lg:shrink-0 lg:flex-col lg:flex-nowrap lg:items-stretch lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 lg:w-full lg:px-4 lg:py-3"
                            >
                                <Skeleton className="h-4 w-4 shrink-0 rounded" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 min-w-0 flex-1 space-y-6 lg:mt-0">
                        <div className="space-y-1.5">
                            <Skeleton className="h-6 w-36" />
                            <Skeleton className="h-4 w-72 max-w-full" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-24 w-full" />
                        </div>

                        <div className="border-border/60 rounded-2xl border p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-64 max-w-full" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardPageCard>
        </DashboardPageMain>
    )
}
