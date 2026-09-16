import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import { Skeleton } from '@/components/ui/skeleton'

export function RolesLoading() {
    return (
        <DashboardPageMain>
            <div className="border-border/60 min-w-0 border-b px-4 pb-4 sm:px-6">
                <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-16" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24 rounded-full" />
                        <Skeleton className="h-9 w-28 rounded-full" />
                    </div>
                </div>
            </div>

            <DashboardPageCard className="overflow-visible">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-10 w-full sm:max-w-xs" />
                        <Skeleton className="hidden h-4 w-16 sm:block" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div key={index} className="border-border/60 bg-card gap-3 rounded-2xl border p-3 shadow-sm">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-4/5" />
                                </div>
                                <div className="mt-3 flex gap-1.5">
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <Skeleton className="h-4 w-16" />
                        <div className="ml-auto flex items-center gap-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </div>
                </div>
            </DashboardPageCard>
        </DashboardPageMain>
    )
}
