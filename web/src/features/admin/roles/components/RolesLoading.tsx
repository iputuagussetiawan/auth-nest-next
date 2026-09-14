import { Skeleton } from '@/components/ui/skeleton'

export function RolesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-10 w-full sm:max-w-xs" />
                    <Skeleton className="hidden h-4 w-16 sm:block" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-xl border p-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <div className="mt-3 space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
