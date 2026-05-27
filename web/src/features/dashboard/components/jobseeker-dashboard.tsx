'use client'

import { CheckCircle2, Clock, Eye, Send } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

import { StatCard } from './stat-card'

const recentApplications = [
    { company: 'Acme Corp', role: 'Frontend Engineer', status: 'Interview', date: '2 days ago' },
    { company: 'Startup XYZ', role: 'React Developer', status: 'Under Review', date: '5 days ago' },
    { company: 'Tech Giants', role: 'UI Engineer', status: 'Pending', date: '1 week ago' },
    { company: 'Innovate Inc', role: 'Full Stack Dev', status: 'Rejected', date: '2 weeks ago' },
    { company: 'Build Co', role: 'Software Engineer', status: 'Offer', date: '3 weeks ago' },
]

const statusPieData = [
    { name: 'Pending', value: 6, fill: 'hsl(var(--chart-1, 220 70% 50%))' },
    { name: 'Under Review', value: 5, fill: 'hsl(var(--chart-2, 160 60% 45%))' },
    { name: 'Interview', value: 2, fill: 'hsl(var(--chart-3, 30 80% 55%))' },
    { name: 'Rejected', value: 1, fill: 'hsl(var(--destructive))' },
    { name: 'Offer', value: 1, fill: 'hsl(var(--chart-4, 280 65% 60%))' },
]

const monthlyData = [
    { month: 'Feb', applied: 2 },
    { month: 'Mar', applied: 3 },
    { month: 'Apr', applied: 4 },
    { month: 'May', applied: 3 },
    { month: 'Jun', applied: 5 },
    { month: 'Jul', applied: 14 },
]

const pieChartConfig = Object.fromEntries(
    statusPieData.map((d) => [d.name, { label: d.name, color: d.fill }]),
)

const monthlyChartConfig = {
    applied: { label: 'Applications', color: 'hsl(var(--primary))' },
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    Interview: 'default',
    'Under Review': 'secondary',
    Pending: 'outline',
    Rejected: 'destructive',
    Offer: 'default',
}

export function JobseekerDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">My Job Search</h2>
                <p className="text-muted-foreground text-sm">Track your applications and progress</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Applications Sent"
                    value={14}
                    icon={Send}
                    trend={{ value: 5, label: 'vs last month' }}
                    description="vs last month"
                />
                <StatCard
                    title="Under Review"
                    value={5}
                    icon={Eye}
                    description="awaiting response"
                />
                <StatCard
                    title="Interviews"
                    value={2}
                    icon={Clock}
                    description="scheduled"
                />
                <StatCard
                    title="Offers"
                    value={1}
                    icon={CheckCircle2}
                    description="pending decision"
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Status pie chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Application Status</CardTitle>
                        <CardDescription>Breakdown of all 15 applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={pieChartConfig} className="h-64 w-full">
                            <PieChart>
                                <Pie
                                    data={statusPieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={3}
                                >
                                    {statusPieData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Monthly applications trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Applications</CardTitle>
                        <CardDescription>Jobs applied per month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={monthlyChartConfig} className="h-64 w-full">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="applied" fill="var(--color-applied)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent applications list */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Your latest job applications</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentApplications.map((app, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-lg border px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm font-medium">{app.role}</p>
                                    <p className="text-muted-foreground text-xs">{app.company} · {app.date}</p>
                                </div>
                                <Badge variant={statusVariant[app.status] ?? 'outline'}>
                                    {app.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
