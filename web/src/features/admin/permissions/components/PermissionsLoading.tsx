import { Skeleton } from '@/components/ui/skeleton'

export function PermissionsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-10 w-full sm:max-w-sm" />
                <div className="rounded-lg border">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 border-b p-3 last:border-b-0">
                            <Skeleton className="h-4 w-48" />
                            <div className="ml-auto flex gap-2">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-4 w-4 rounded" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
