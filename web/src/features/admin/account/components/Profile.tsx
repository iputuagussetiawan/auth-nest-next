'use client'

import { useAuthContext } from '@/providers/auth-provider'
import { Settings, Share2, User } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'
import DashboardPageHeader from '@/components/layouts/backend/DashboardPageHeader'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import SessionSetting from '@/features/admin/session/components/SessionsSetting'

import PreferencesSettings from './ProfilePreferences'
import ProfileSettings from './ProfileSetting'

const Profile = () => {
    const { user } = useAuthContext()
    const profileLabel = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'User Profile'

    const tabs = [
        { value: 'profile', label: profileLabel, icon: User },
        { value: 'preferences', label: 'Preferences', icon: Settings },
        { value: 'connections', label: 'Session / Connections', icon: Share2 },
    ] as const

    return (
        <DashboardPageMain>
            <DashboardPageHeader title="Account" />

            <DashboardPageCard className="overflow-visible">
                <Tabs
                    defaultValue="profile"
                    orientation="vertical"
                    className="min-w-0 gap-6 lg:flex-row lg:gap-8"
                >
                    <TabsList
                        aria-label="Account sections"
                        className="!flex-row flex-wrap items-center justify-start gap-1 rounded-xl border bg-muted/30 p-1 lg:!flex-col lg:flex-nowrap lg:items-stretch lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
                    >
                        {tabs.map(({ value, label, icon: Icon }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="!w-auto min-w-0 justify-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-xs font-medium transition-colors hover:bg-background/80 data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary sm:px-4 sm:text-sm lg:!w-full lg:justify-start lg:rounded-r-lg lg:rounded-l-none lg:border-l-2 lg:border-y-0 lg:border-r-0 lg:px-4 lg:py-3 lg:data-[state=active]:border-primary lg:data-[state=active]:bg-primary/10"
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="truncate">{label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="min-w-0 flex-1">
                        <TabsContent value="profile" className="mt-0 border-none p-0 focus-visible:outline-none">
                            {user && <ProfileSettings user={user} />}
                        </TabsContent>

                        <TabsContent value="preferences" className="mt-0 border-none p-0 focus-visible:outline-none">
                            <PreferencesSettings />
                        </TabsContent>

                        <TabsContent value="connections" className="mt-0 border-none p-0 focus-visible:outline-none">
                            <SessionSetting />
                        </TabsContent>
                    </div>
                </Tabs>
            </DashboardPageCard>
        </DashboardPageMain>
    )
}

export default Profile
