'use client'

import { Activity, ArrowUpRight, ShieldCheck, Users, XCircle } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { adminDashboardService } from '@/features/admin/dashboard/services/DashboardService'
import { StatCard } from './StatCard'

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
        <div className="space-y-8">
            <section className="rounded-[32px] border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm lg:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                            Admin overview
                        </Badge>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">Welcome back to your HR command center</h2>
                            <p className="text-muted-foreground max-w-2xl text-sm leading-6 lg:text-base">
                                Track platform health, user activity, role coverage, and account verification from one unified dashboard.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
                            <div className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Total users</div>
                            <div className="mt-2 text-3xl font-semibold tracking-tight">{stats?.totalUsers ?? 0}</div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                {stats?.activeUsers ?? 0} active now
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
                            <div className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Sessions</div>
                            <div className="mt-2 text-3xl font-semibold tracking-tight">{stats?.activeSessions ?? 0}</div>
                            <div className="mt-2 text-xs text-muted-foreground">Live authenticated activity</div>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
                            <div className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Permissions</div>
                            <div className="mt-2 text-3xl font-semibold tracking-tight">{stats?.totalPermissions ?? 0}</div>
                            <div className="mt-2 text-xs text-muted-foreground">Governance across all roles</div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    <>
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

            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <Card className="rounded-[28px] border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold tracking-tight">User &amp; Session Growth</CardTitle>
                        <CardDescription>New registrations and sessions — last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-72 w-full rounded-2xl" />
                    ) : (
                        <ChartContainer config={growthChartConfig} className="h-72 w-full">
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

                <Card className="rounded-[28px] border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold tracking-tight">Role Distribution</CardTitle>
                        <CardDescription>Registered users by assigned role</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-72 w-full rounded-2xl" />
                    ) : (
                        <ChartContainer config={roleChartConfig} className="h-72 w-full">
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
        </div>
    )
}
