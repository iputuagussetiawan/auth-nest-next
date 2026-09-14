import { Skeleton } from '@/components/ui/skeleton'

export function SiteSettingsLoading() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="space-y-4 rounded-xl border p-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
}
