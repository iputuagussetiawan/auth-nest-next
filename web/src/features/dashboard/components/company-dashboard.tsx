'use client'

import { Briefcase, CheckCircle, FileText, Users } from 'lucide-react'
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

const applicationStatusData = [
    { status: 'Pending', count: 34 },
    { status: 'Reviewing', count: 28 },
    { status: 'Interview', count: 12 },
    { status: 'Rejected', count: 8 },
    { status: 'Hired', count: 7 },
]

const applicationTrendData = [
    { month: 'Jan', applications: 10, hired: 1 },
    { month: 'Feb', applications: 18, hired: 2 },
    { month: 'Mar', applications: 24, hired: 3 },
    { month: 'Apr', applications: 30, hired: 4 },
    { month: 'May', applications: 42, hired: 5 },
    { month: 'Jun', applications: 89, hired: 7 },
]

const jobsPerRoleData = [
    { role: 'Frontend', jobs: 3 },
    { role: 'Backend', jobs: 4 },
    { role: 'Design', jobs: 2 },
    { role: 'DevOps', jobs: 1 },
    { role: 'QA', jobs: 2 },
]

const statusChartConfig = {
    count: { label: 'Applications', color: 'var(--primary)' },
}

const trendChartConfig = {
    applications: { label: 'Applications', color: 'var(--primary)' },
    hired: { label: 'Hired', color: 'var(--chart-2)' },
}

const jobsChartConfig = {
    jobs: { label: 'Open Jobs', color: 'var(--primary)' },
}

export function CompanyDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Company Dashboard</h2>
                <p className="text-muted-foreground text-sm">Recruitment and hiring overview</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Jobs Posted"
                    value={12}
                    icon={Briefcase}
                    trend={{ value: 8, label: 'vs last month' }}
                    description="vs last month"
                />
                <StatCard
                    title="Total Applications"
                    value={89}
                    icon={FileText}
                    trend={{ value: 24, label: 'vs last month' }}
                    description="vs last month"
                />
                <StatCard
                    title="Open Positions"
                    value={5}
                    icon={Users}
                    description="actively hiring"
                />
                <StatCard
                    title="Hired"
                    value={7}
                    icon={CheckCircle}
                    trend={{ value: 16, label: 'vs last month' }}
                    description="vs last month"
                />
            </div>

            {/* Applications + hired trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Applications &amp; Hires Over Time</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={trendChartConfig} className="h-64 w-full">
                        <AreaChart data={applicationTrendData}>
                            <defs>
                                <linearGradient id="fillApps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-applications)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-applications)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="fillHired" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-hired)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-hired)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Area type="monotone" dataKey="applications" stroke="var(--color-applications)" fill="url(#fillApps)" strokeWidth={2} />
                            <Area type="monotone" dataKey="hired" stroke="var(--color-hired)" fill="url(#fillHired)" strokeWidth={2} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Application Status Breakdown</CardTitle>
                        <CardDescription>Current pipeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={statusChartConfig} className="h-56 w-full">
                            <BarChart data={applicationStatusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="status" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Open Jobs by Role</CardTitle>
                        <CardDescription>Active job postings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={jobsChartConfig} className="h-56 w-full">
                            <BarChart data={jobsPerRoleData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="role" tickLine={false} axisLine={false} width={60} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="jobs" fill="var(--color-jobs)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
