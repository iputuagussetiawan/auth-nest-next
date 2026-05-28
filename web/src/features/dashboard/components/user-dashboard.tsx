'use client'

import { CalendarDays, Mail, ShieldCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { IUserProfile } from '@/features/user/types/user-type'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface UserDashboardProps {
    user: IUserProfile
}

const loginActivityData = [
    { day: 'Mon', logins: 1 },
    { day: 'Tue', logins: 0 },
    { day: 'Wed', logins: 2 },
    { day: 'Thu', logins: 1 },
    { day: 'Fri', logins: 3 },
    { day: 'Sat', logins: 1 },
    { day: 'Sun', logins: 1 },
]

const activityChartConfig = {
    logins: { label: 'Logins', color: 'var(--primary)' },
}

export function UserDashboard({ user }: UserDashboardProps) {
    const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user.firstName}!</h2>
                <p className="text-muted-foreground text-sm">Here is a summary of your account</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold">
                                {initials}
                            </div>
                            <div>
                                <p className="font-semibold">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-muted-foreground text-sm">{user.role ?? '—'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="text-muted-foreground h-4 w-4" />
                                <span>{user.email}</span>
                                {user.isEmailVerified && (
                                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="text-muted-foreground h-4 w-4" />
                                <span>Member since {memberSince}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="text-muted-foreground h-4 w-4" />
                                <span>Signed in via {user.provider}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {user.permissions.map((perm) => (
                                    <Badge key={perm} variant="outline" className="text-xs">
                                        {perm}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No permissions assigned.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Login Activity</CardTitle>
                    <CardDescription>Your logins this week</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={activityChartConfig} className="h-48 w-full">
                        <BarChart data={loginActivityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="logins" fill="var(--color-logins)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
