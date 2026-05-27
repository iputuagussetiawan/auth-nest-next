'use client'

import { Activity, ShieldCheck, Users, XCircle } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

import { StatCard } from './stat-card'

const roleData = [
    { role: 'Admin', count: 3 },
    { role: 'Company', count: 28 },
    { role: 'Jobseeker', count: 89 },
    { role: 'User', count: 30 },
]

const userGrowthData = [
    { month: 'Jan', users: 80, sessions: 210 },
    { month: 'Feb', users: 95, sessions: 245 },
    { month: 'Mar', users: 108, sessions: 280 },
    { month: 'Apr', users: 120, sessions: 310 },
    { month: 'May', users: 138, sessions: 340 },
    { month: 'Jun', users: 150, sessions: 390 },
]

const sessionWeekData = [
    { day: 'Mon', active: 18, new: 4 },
    { day: 'Tue', active: 22, new: 6 },
    { day: 'Wed', active: 19, new: 3 },
    { day: 'Thu', active: 25, new: 8 },
    { day: 'Fri', active: 23, new: 5 },
    { day: 'Sat', active: 10, new: 2 },
    { day: 'Sun', active: 7, new: 1 },
]

const roleChartConfig = {
    count: { label: 'Users', color: 'hsl(var(--primary))' },
}

const growthChartConfig = {
    users: { label: 'Total Users', color: 'hsl(var(--primary))' },
    sessions: { label: 'Sessions', color: 'hsl(var(--chart-2, 160 60% 45%))' },
}

const sessionChartConfig = {
    active: { label: 'Active', color: 'hsl(var(--primary))' },
    new: { label: 'New', color: 'hsl(var(--chart-2, 160 60% 45%))' },
}

export function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground text-sm">Platform overview and user statistics</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={150}
                    icon={Users}
                    trend={{ value: 12, label: 'vs last month' }}
                    description="vs last month"
                />
                <StatCard
                    title="Active Sessions"
                    value={23}
                    icon={Activity}
                    description="right now"
                />
                <StatCard
                    title="Total Roles"
                    value={4}
                    icon={ShieldCheck}
                    description="admin, company, jobseeker, user"
                />
                <StatCard
                    title="Unverified Emails"
                    value={8}
                    icon={XCircle}
                    trend={{ value: -3, label: 'vs last week' }}
                    description="vs last week"
                />
            </div>

            {/* User growth + sessions trend */}
            <Card>
                <CardHeader>
                    <CardTitle>User &amp; Session Growth</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={growthChartConfig} className="h-64 w-full">
                        <AreaChart data={userGrowthData}>
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
                            <Area
                                type="monotone"
                                dataKey="sessions"
                                stroke="var(--color-sessions)"
                                fill="url(#fillSessions)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="var(--color-users)"
                                fill="url(#fillUsers)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Role distribution + weekly sessions side by side */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Role Distribution</CardTitle>
                        <CardDescription>All registered users by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={roleChartConfig} className="h-56 w-full">
                            <BarChart data={roleData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="role" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Sessions</CardTitle>
                        <CardDescription>Active vs new sessions this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={sessionChartConfig} className="h-56 w-full">
                            <BarChart data={sessionWeekData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="active" fill="var(--color-active)" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="new" fill="var(--color-new)" radius={[4, 4, 0, 0]} stackId="a" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
