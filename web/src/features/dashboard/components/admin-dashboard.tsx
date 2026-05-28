'use client'

import { Activity, Layers, ShieldCheck, Users, XCircle } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { adminDashboardService } from '@/features/admin/services/admin-dashboard-service'
import { StatCard } from './stat-card'

const growthChartConfig = {
    users: { label: 'New Users', color: 'var(--primary)' },
    sessions: { label: 'Sessions', color: 'var(--chart-2)' },
}

const roleChartConfig = {
    count: { label: 'Users', color: 'var(--primary)' },
}

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-24" />
            </CardContent>
        </Card>
    )
}

export function AdminDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminDashboardService.getStats(),
    })

    const stats = data?.data

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground text-sm">Platform overview and live statistics</p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    <>
                        <StatCard
                            title="Total Users"
                            value={stats?.totalUsers ?? 0}
                            icon={Users}
                            description={`${stats?.activeUsers ?? 0} active`}
                        />
                        <StatCard
                            title="Active Sessions"
                            value={stats?.activeSessions ?? 0}
                            icon={Activity}
                            description="currently open"
                        />
                        <StatCard
                            title="Total Roles"
                            value={stats?.totalRoles ?? 0}
                            icon={ShieldCheck}
                            description={`${stats?.totalPermissions ?? 0} permissions`}
                        />
                        <StatCard
                            title="Unverified Emails"
                            value={stats?.unverifiedEmails ?? 0}
                            icon={XCircle}
                            description="pending verification"
                        />
                    </>
                )}
            </div>

            {/* Secondary stat row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    <>
                        <StatCard
                            title="App Modules"
                            value={stats?.totalModules ?? 0}
                            icon={Layers}
                            description="registered routes"
                        />
                        <StatCard
                            title="Inactive Users"
                            value={(stats?.totalUsers ?? 0) - (stats?.activeUsers ?? 0)}
                            icon={Users}
                            description="disabled accounts"
                        />
                        <StatCard
                            title="Permissions"
                            value={stats?.totalPermissions ?? 0}
                            icon={ShieldCheck}
                            description="across all roles"
                        />
                    </>
                )}
            </div>

            {/* User & session growth */}
            <Card>
                <CardHeader>
                    <CardTitle>User &amp; Session Growth</CardTitle>
                    <CardDescription>New registrations and sessions — last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <ChartContainer config={growthChartConfig} className="h-64 w-full">
                            <AreaChart data={stats?.userGrowth ?? []}>
                                <defs>
                                    <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area type="monotone" dataKey="sessions" stroke="var(--color-sessions)" fill="url(#fillSessions)" strokeWidth={2} />
                                <Area type="monotone" dataKey="users" stroke="var(--color-users)" fill="url(#fillUsers)" strokeWidth={2} />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Role distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>User Role Distribution</CardTitle>
                    <CardDescription>Registered users by assigned role</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-56 w-full" />
                    ) : (
                        <ChartContainer config={roleChartConfig} className="h-56 w-full">
                            <BarChart data={stats?.usersByRole ?? []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="role" tickLine={false} axisLine={false} tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)} />
                                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
