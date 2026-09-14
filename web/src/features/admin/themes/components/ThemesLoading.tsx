import { Skeleton } from '@/components/ui/skeleton'

export function ThemesLoading() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-9 w-28" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3 rounded-xl border p-4">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex gap-1.5">
                            {Array.from({ length: 6 }).map((_, j) => (
                                <Skeleton key={j} className="h-4 w-4 rounded-full" />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-7 w-8" />
                            <Skeleton className="h-7 w-8" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
