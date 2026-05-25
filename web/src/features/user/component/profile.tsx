'use client'

import { useAuthContext } from '@/providers/auth-provider'
import { Settings, Share2, User } from 'lucide-react'

import SessionSetting from '@/features/session/components/sessions-setting'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import PreferencesSettings from './profile-preferences'
import ProfileSettings from './profile-setting'

const Profile = () => {
    const { user } = useAuthContext()
    return (
        <div className="flex flex-col space-y-6 pb-16 md:block">
            <Tabs
                defaultValue="profile"
                orientation="vertical"
                className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12"
            >
                <aside className="m-0 lg:w-1/5">
                    <TabsList className="flex w-full flex-row space-x-2 bg-transparent lg:flex-col lg:space-y-1 lg:space-x-0">
                        <TabsTrigger
                            value="profile"
                            className="data-[state=active]:bg-secondary data-[state=active]:text-primary hover:bg-muted/50 relative flex w-full items-center justify-start gap-3 bg-transparent px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:shadow-none"
                        >
                            <User className="h-4 w-4 shrink-0 opacity-70" />
                            <span className="truncate">
                                {`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
                                    'User Profile'}
                            </span>
                            <div className="bg-primary absolute inset-y-1 left-0 w-1 rounded-full opacity-0 transition-opacity data-[state=active]:group-hover:opacity-100" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="preferences"
                            className="data-[state=active]:bg-secondary relative flex justify-start gap-2 bg-transparent px-4 py-2 text-sm font-normal data-[state=active]:shadow-none"
                        >
                            <Settings className="h-4 w-4" />
                            Preferences
                        </TabsTrigger>

                        <TabsTrigger
                            value="connections"
                            className="data-[state=active]:bg-secondary relative flex justify-start gap-2 bg-transparent px-4 py-2 text-sm font-normal data-[state=active]:shadow-none"
                        >
                            <Share2 className="h-4 w-4" />
                            Session / Connections
                        </TabsTrigger>
                    </TabsList>
                </aside>

                <div className="flex-1 lg:max-w-4xl">
                    <TabsContent value="profile" className="mt-0 border-none p-0">
                        {user && <ProfileSettings user={user} />}
                    </TabsContent>

                    <TabsContent value="preferences">
                        <PreferencesSettings />
                    </TabsContent>

                    <TabsContent value="connections">
                        <SessionSetting />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

export default Profile
