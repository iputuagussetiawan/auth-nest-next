import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import { Skeleton } from '@/components/ui/skeleton'

export function UsersLoading() {
    return (
        <DashboardPageMain>
            <div className="border-border/60 min-w-0 border-b px-4 pb-4 sm:px-6">
                <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-20" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-40 rounded-full" />
                        <Skeleton className="h-9 w-28 rounded-full" />
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="border-border/60 bg-card rounded-3xl border p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-9 w-9 rounded-2xl" />
                            </div>
                            <Skeleton className="mt-3 h-9 w-16" />
                            <Skeleton className="mt-2 h-3 w-28" />
                        </div>
                    ))}
                </div>
            </div>

            <DashboardPageCard className="overflow-visible">
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Skeleton className="h-10 min-w-0 flex-1 lg:max-w-md" />
                        <Skeleton className="h-4 w-20 shrink-0" />
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Skeleton className="h-9 w-24 rounded-full" />
                        <Skeleton className="h-9 w-24 rounded-full" />
                        <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="border-border/60 overflow-hidden rounded-2xl border shadow-sm">
                        <div className="bg-muted/60 grid h-14 grid-cols-[minmax(180px,2fr)_1fr_1fr_1fr_1fr_1fr_40px] items-center gap-4 px-4">
                            {Array.from({ length: 7 }).map((_, index) => (
                                <Skeleton key={index} className="h-3 w-14" />
                            ))}
                        </div>
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="border-border/40 grid min-h-16 grid-cols-[minmax(180px,2fr)_1fr_1fr_1fr_1fr_1fr_40px] items-center gap-4 border-t px-4"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                                <Skeleton className="h-5 w-10 rounded-full" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </div>
                </div>
            </DashboardPageCard>
        </DashboardPageMain>
    )
}
