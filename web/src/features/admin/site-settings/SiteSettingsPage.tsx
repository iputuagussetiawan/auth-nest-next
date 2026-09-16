'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Image as ImageIcon, Mail, Search, Settings, Share2, TriangleAlert } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'
import DashboardPageHeader from '@/components/layouts/backend/DashboardPageHeader'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import { UiButton } from '@/components/ui-custom/UiButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
    BrandingTab,
    ContactTab,
    EMPTY,
    GeneralTab,
    MaintenanceTab,
    schema,
    SeoTab,
    SocialTab,
    type FormValues,
} from './index'
import { adminSiteSettingsService } from './services/SiteSettingsService'

const TABS = [
    { value: 'general', icon: Settings, label: 'General' },
    { value: 'branding', icon: ImageIcon, label: 'Branding' },
    { value: 'contact', icon: Mail, label: 'Contact' },
    { value: 'social', icon: Share2, label: 'Social' },
    { value: 'seo', icon: Search, label: 'SEO' },
    { value: 'maintenance', icon: TriangleAlert, label: 'Maintenance' },
] as const

export function SiteSettingsPage() {
    const queryClient = useQueryClient()
    const { data } = useSuspenseQuery({
        queryKey: ['site-settings'],
        queryFn: () => adminSiteSettingsService.get(),
    })
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors, isDirty },
    } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })

    useEffect(() => {
        const settings = data?.data
        if (!settings) return
        reset({
            siteName: settings.siteName ?? '',
            tagline: settings.tagline ?? '',
            description: settings.description ?? '',
            logoUrl: settings.logoUrl ?? '',
            faviconUrl: settings.faviconUrl ?? '',
            contactEmail: settings.contactEmail ?? '',
            contactPhone: settings.contactPhone ?? '',
            contactAddress: settings.contactAddress ?? '',
            socialTwitter: settings.socialTwitter ?? '',
            socialFacebook: settings.socialFacebook ?? '',
            socialInstagram: settings.socialInstagram ?? '',
            socialLinkedin: settings.socialLinkedin ?? '',
            socialYoutube: settings.socialYoutube ?? '',
            metaTitle: settings.metaTitle ?? '',
            metaDescription: settings.metaDescription ?? '',
            metaKeywords: settings.metaKeywords ?? '',
            ogImageUrl: settings.ogImageUrl ?? '',
            googleAnalyticsId: settings.googleAnalyticsId ?? '',
            maintenanceMode: settings.maintenanceMode ?? false,
            maintenanceMessage: settings.maintenanceMessage ?? '',
        })
    }, [data, reset])

    const updateMutation = useMutation({
        mutationFn: (values: FormValues) =>
            adminSiteSettingsService.update(
                Object.fromEntries(
                    Object.entries(values).map(([key, value]) => [
                        key,
                        value === '' ? undefined : value,
                    ]),
                ) as FormValues,
            ),
        onSuccess: () => {
            toast.success('Settings saved')
            queryClient.invalidateQueries({ queryKey: ['site-settings'] })
        },
        onError: (error: unknown) =>
            toast.error(error instanceof Error ? error.message : 'Failed to save settings'),
    })

    const values = useWatch({ control })
    const submit = handleSubmit((formValues) => updateMutation.mutate(formValues))

    return (
        <DashboardPageMain>
            <DashboardPageHeader
                title="Site Settings"
                actions={
                    <div className="flex items-center gap-3">
                        {values.maintenanceMode && (
                            <Badge variant="destructive" className="gap-1 rounded-full px-3 py-1">
                                <TriangleAlert className="h-3 w-3" /> Maintenance Mode ON
                            </Badge>
                        )}
                        <UiButton
                            onClick={submit}
                            disabled={updateMutation.isPending}
                            className="rounded-full px-5 shadow-sm"
                        >
                            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                        </UiButton>
                    </div>
                }
            />

            <DashboardPageCard className="overflow-visible">
                <form onSubmit={submit}>
                    <Tabs
                        defaultValue="general"
                        orientation="vertical"
                        className="gap-6 lg:flex-row lg:gap-8"
                    >
                        <TabsList
                            aria-label="Site settings sections"
                            className="bg-muted/30 !flex-row flex-wrap items-center justify-start gap-1 rounded-xl border p-1 lg:!flex-col lg:flex-nowrap lg:items-stretch lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
                        >
                            {TABS.map(({ value, icon: Icon, label }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    className="hover:bg-background/80 data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary lg:data-[state=active]:border-l-primary! lg:data-[state=active]:bg-primary/10 !w-auto justify-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm lg:!w-full lg:justify-start lg:rounded-l-none lg:rounded-r-lg lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:px-4 lg:py-3"
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="general" className="mt-0 focus-visible:outline-none">
                            <GeneralTab register={register} errors={errors} />
                        </TabsContent>
                        <TabsContent value="branding" className="mt-0 focus-visible:outline-none">
                            <BrandingTab
                                logoUrl={values.logoUrl ?? ''}
                                faviconUrl={values.faviconUrl ?? ''}
                                setValue={setValue}
                            />
                        </TabsContent>
                        <TabsContent value="contact" className="mt-0 focus-visible:outline-none">
                            <ContactTab register={register} errors={errors} />
                        </TabsContent>
                        <TabsContent value="social" className="mt-0 focus-visible:outline-none">
                            <SocialTab register={register} />
                        </TabsContent>
                        <TabsContent value="seo" className="mt-0 focus-visible:outline-none">
                            <SeoTab
                                register={register}
                                setValue={setValue}
                                control={control}
                                errors={errors}
                                ogImageUrl={values.ogImageUrl ?? ''}
                            />
                        </TabsContent>
                        <TabsContent
                            value="maintenance"
                            className="mt-0 focus-visible:outline-none"
                        >
                            <MaintenanceTab
                                register={register}
                                setValue={setValue}
                                maintenanceMode={values.maintenanceMode ?? false}
                            />
                        </TabsContent>
                    </Tabs>

                    {isDirty && (
                        <div className="bg-background/90 fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3 shadow-lg backdrop-blur-md">
                            <p className="text-muted-foreground text-sm">
                                You have unsaved changes
                            </p>
                            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </form>
            </DashboardPageCard>
        </DashboardPageMain>
    )
}
