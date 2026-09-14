import { Skeleton } from '@/components/ui/skeleton'

export function UsersLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-9 w-28" />
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-10 w-full sm:max-w-xs" />
                    <Skeleton className="hidden h-4 w-16 sm:block" />
                </div>
                <div className="rounded-xl border">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 border-b p-3 last:border-b-0">
                            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
