import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: { value: number; label?: string }
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
    const isPositive = trend && trend.value >= 0

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                        {title}
                    </CardTitle>
                    <div className="bg-primary/10 text-primary rounded-lg p-2">
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <div className="mt-1 flex items-center gap-1">
                        {trend && (
                            <span
                                className={cn(
                                    'flex items-center gap-0.5 text-xs font-medium',
                                    isPositive ? 'text-emerald-600' : 'text-red-500',
                                )}
                            >
                                {isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description && (
                            <span className="text-muted-foreground text-xs">{description}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
