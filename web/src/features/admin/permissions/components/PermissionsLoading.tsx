import { Fragment } from 'react'

import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import { Skeleton } from '@/components/ui/skeleton'

export function PermissionsLoading() {
    return (
        <DashboardPageMain>
            <div className="border-border/60 min-w-0 border-b px-4 pb-4 sm:px-6">
                <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-28" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-9 w-40 rounded-full" />
                </div>
            </div>

            <DashboardPageCard className="overflow-visible">
                <div className="min-w-0 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-64" />
                        </div>
                        <Skeleton className="h-10 w-full sm:max-w-sm" />
                    </div>

                    <div className="border-border/60 max-h-[70vh] overflow-hidden rounded-lg border shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="min-w-[260px] border-r px-4 py-3 text-left">
                                        <Skeleton className="h-4 w-24" />
                                    </th>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <th key={index} className="min-w-[130px] px-4 py-3">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <Skeleton className="h-3.5 w-16" />
                                                <Skeleton className="h-5 w-14 rounded-full" />
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Group header rows + permission rows, mirroring the matrix layout */}
                                {Array.from({ length: 2 }).map((_, group) => (
                                    <Fragment key={group}>
                                        <tr className="border-y bg-muted/40">
                                            <td className="border-r py-2 pr-4 pl-4">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-3.5 w-3.5" />
                                                    <Skeleton className="h-3.5 w-3.5" />
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-4 w-8 rounded-full" />
                                                </div>
                                            </td>
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <td key={index} className="px-4 py-2" />
                                            ))}
                                        </tr>
                                        {Array.from({ length: 4 }).map((_, row) => (
                                            <tr key={row} className="border-t">
                                                <td className="border-r py-3 pr-4 pl-8">
                                                    <div className="space-y-1.5">
                                                        <Skeleton className="h-4 w-40" />
                                                        <Skeleton className="h-3 w-28" />
                                                    </div>
                                                </td>
                                                {Array.from({ length: 5 }).map((_, col) => (
                                                    <td key={col} className="px-4 py-3 text-center">
                                                        <Skeleton className="mx-auto h-4 w-4 rounded" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DashboardPageCard>
        </DashboardPageMain>
    )
}
