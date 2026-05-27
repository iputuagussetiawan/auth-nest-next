'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Globe,
    Image as ImageIcon,
    Mail,
    Search,
    Settings,
    Share2,
    TriangleAlert,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminSiteSettingsService } from '../services/admin-site-settings-service'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
    siteName: z.string().min(1).max(200),
    tagline: z.string().max(300).optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    logoUrl: z.string().max(500).optional().or(z.literal('')),
    faviconUrl: z.string().max(500).optional().or(z.literal('')),
    contactEmail: z.string().email().optional().or(z.literal('')),
    contactPhone: z.string().max(50).optional().or(z.literal('')),
    contactAddress: z.string().optional().or(z.literal('')),
    socialTwitter: z.string().max(500).optional().or(z.literal('')),
    socialFacebook: z.string().max(500).optional().or(z.literal('')),
    socialInstagram: z.string().max(500).optional().or(z.literal('')),
    socialLinkedin: z.string().max(500).optional().or(z.literal('')),
    socialYoutube: z.string().max(500).optional().or(z.literal('')),
    metaTitle: z.string().max(200).optional().or(z.literal('')),
    metaDescription: z.string().max(500).optional().or(z.literal('')),
    metaKeywords: z.string().max(300).optional().or(z.literal('')),
    googleAnalyticsId: z.string().max(50).optional().or(z.literal('')),
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().max(500).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
    siteName: 'My App',
    tagline: '',
    description: '',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    socialTwitter: '',
    socialFacebook: '',
    socialInstagram: '',
    socialLinkedin: '',
    socialYoutube: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    googleAnalyticsId: '',
    maintenanceMode: false,
    maintenanceMessage: '',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({
    label,
    hint,
    error,
    children,
}: {
    label: string
    hint?: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}

function ImagePreview({ url, alt }: { url: string; alt: string }) {
    if (!url) return null
    return (
        <div className="mt-2 flex items-center gap-3">
            <img
                src={url}
                alt={alt}
                className="h-12 w-12 rounded-md border border-border object-contain bg-muted/30"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{url}</span>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SiteSettingsPage() {
    const qc = useQueryClient()
    const [logoPreview, setLogoPreview] = useState('')
    const [faviconPreview, setFaviconPreview] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['site-settings'],
        queryFn: () => adminSiteSettingsService.get(),
    })

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY,
    })

    useEffect(() => {
        const s = data?.data
        if (!s) return
        reset({
            siteName: s.siteName ?? '',
            tagline: s.tagline ?? '',
            description: s.description ?? '',
            logoUrl: s.logoUrl ?? '',
            faviconUrl: s.faviconUrl ?? '',
            contactEmail: s.contactEmail ?? '',
            contactPhone: s.contactPhone ?? '',
            contactAddress: s.contactAddress ?? '',
            socialTwitter: s.socialTwitter ?? '',
            socialFacebook: s.socialFacebook ?? '',
            socialInstagram: s.socialInstagram ?? '',
            socialLinkedin: s.socialLinkedin ?? '',
            socialYoutube: s.socialYoutube ?? '',
            metaTitle: s.metaTitle ?? '',
            metaDescription: s.metaDescription ?? '',
            metaKeywords: s.metaKeywords ?? '',
            googleAnalyticsId: s.googleAnalyticsId ?? '',
            maintenanceMode: s.maintenanceMode ?? false,
            maintenanceMessage: s.maintenanceMessage ?? '',
        })
        setLogoPreview(s.logoUrl ?? '')
        setFaviconPreview(s.faviconUrl ?? '')
    }, [data, reset])

    const updateMutation = useMutation({
        mutationFn: (values: FormValues) => adminSiteSettingsService.update(values),
        onSuccess: () => {
            toast.success('Settings saved')
            qc.invalidateQueries({ queryKey: ['site-settings'] })
        },
        onError: (e: any) => toast.error(e?.message ?? 'Failed to save settings'),
    })

    const maintenanceMode = watch('maintenanceMode')
    const logoUrl = watch('logoUrl')
    const faviconUrl = watch('faviconUrl')

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your site identity, contact info, and SEO</p>
                </div>
                <div className="flex items-center gap-3">
                    {maintenanceMode && (
                        <Badge variant="destructive" className="gap-1">
                            <TriangleAlert className="h-3 w-3" /> Maintenance Mode ON
                        </Badge>
                    )}
                    <Button
                        onClick={handleSubmit((v) => updateMutation.mutate(v))}
                        disabled={updateMutation.isPending || isLoading}
                    >
                        {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-sm text-muted-foreground animate-pulse">Loading settings…</div>
            ) : (
                <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))}>
                    <Tabs defaultValue="general" className="space-y-5">
                        <TabsList className="w-full justify-start gap-1 h-auto flex-wrap">
                            <TabsTrigger value="general" className="gap-1.5">
                                <Settings className="h-3.5 w-3.5" /> General
                            </TabsTrigger>
                            <TabsTrigger value="branding" className="gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5" /> Branding
                            </TabsTrigger>
                            <TabsTrigger value="contact" className="gap-1.5">
                                <Mail className="h-3.5 w-3.5" /> Contact
                            </TabsTrigger>
                            <TabsTrigger value="social" className="gap-1.5">
                                <Share2 className="h-3.5 w-3.5" /> Social
                            </TabsTrigger>
                            <TabsTrigger value="seo" className="gap-1.5">
                                <Search className="h-3.5 w-3.5" /> SEO
                            </TabsTrigger>
                            <TabsTrigger value="maintenance" className="gap-1.5">
                                <TriangleAlert className="h-3.5 w-3.5" /> Maintenance
                            </TabsTrigger>
                        </TabsList>

                        {/* ── General ── */}
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Globe className="h-4 w-4" /> General Info
                                    </CardTitle>
                                    <CardDescription>Basic site identity shown across the platform</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Field label="Site Name" error={errors.siteName?.message}>
                                        <Input {...register('siteName')} placeholder="My App" />
                                    </Field>
                                    <Field label="Tagline" hint="Short slogan shown under the site name">
                                        <Input {...register('tagline')} placeholder="Build something great" />
                                    </Field>
                                    <Field label="Description" hint="Used in About sections and meta tags">
                                        <Textarea
                                            {...register('description')}
                                            placeholder="A brief description of your site…"
                                            rows={4}
                                            className="resize-none"
                                        />
                                    </Field>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Branding ── */}
                        <TabsContent value="branding">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ImageIcon className="h-4 w-4" /> Branding
                                    </CardTitle>
                                    <CardDescription>Logo and favicon for your site</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <Field label="Logo URL" hint="Full URL to your logo image (PNG, SVG, WebP)">
                                            <Input
                                                {...register('logoUrl')}
                                                placeholder="https://example.com/logo.png"
                                                onChange={(e) => {
                                                    register('logoUrl').onChange(e)
                                                    setLogoPreview(e.target.value)
                                                }}
                                            />
                                        </Field>
                                        {logoPreview && (
                                            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/20 p-4">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="h-16 max-w-[160px] object-contain"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">Logo Preview</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{logoPreview}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <Field label="Favicon URL" hint="32×32 or 64×64 icon shown in browser tabs">
                                            <Input
                                                {...register('faviconUrl')}
                                                placeholder="https://example.com/favicon.ico"
                                                onChange={(e) => {
                                                    register('faviconUrl').onChange(e)
                                                    setFaviconPreview(e.target.value)
                                                }}
                                            />
                                        </Field>
                                        {faviconPreview && (
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={faviconPreview}
                                                    alt="Favicon preview"
                                                    className="h-8 w-8 rounded border border-border object-contain"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                />
                                                <span className="text-xs text-muted-foreground">Favicon preview</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Contact ── */}
                        <TabsContent value="contact">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Mail className="h-4 w-4" /> Contact Information
                                    </CardTitle>
                                    <CardDescription>Displayed on contact pages and footer</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Contact Email" error={errors.contactEmail?.message}>
                                            <Input
                                                {...register('contactEmail')}
                                                type="email"
                                                placeholder="hello@example.com"
                                            />
                                        </Field>
                                        <Field label="Phone Number">
                                            <Input
                                                {...register('contactPhone')}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </Field>
                                    </div>
                                    <Field label="Address">
                                        <Textarea
                                            {...register('contactAddress')}
                                            placeholder="123 Main Street, City, Country"
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </Field>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Social ── */}
                        <TabsContent value="social">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Share2 className="h-4 w-4" /> Social Media
                                    </CardTitle>
                                    <CardDescription>Links to your social profiles</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { key: 'socialTwitter' as const, label: 'X / Twitter', placeholder: 'https://x.com/yourhandle' },
                                        { key: 'socialFacebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
                                        { key: 'socialInstagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
                                        { key: 'socialLinkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourco' },
                                        { key: 'socialYoutube' as const, label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
                                    ].map(({ key, label, placeholder }) => (
                                        <Field key={key} label={label}>
                                            <Input {...register(key)} placeholder={placeholder} />
                                        </Field>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── SEO ── */}
                        <TabsContent value="seo">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Search className="h-4 w-4" /> SEO &amp; Analytics
                                    </CardTitle>
                                    <CardDescription>Search engine optimization and tracking</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Field
                                        label="Meta Title"
                                        hint="Shown in browser tab and search results (50–60 chars recommended)"
                                        error={errors.metaTitle?.message}
                                    >
                                        <Input {...register('metaTitle')} placeholder="My App — Build something great" />
                                        <p className="mt-1 text-right text-xs text-muted-foreground">
                                            {watch('metaTitle')?.length ?? 0}/200
                                        </p>
                                    </Field>
                                    <Field
                                        label="Meta Description"
                                        hint="Search engine snippet (150–160 chars recommended)"
                                        error={errors.metaDescription?.message}
                                    >
                                        <Textarea
                                            {...register('metaDescription')}
                                            placeholder="A short description of your site for search engines…"
                                            rows={3}
                                            className="resize-none"
                                        />
                                        <p className="mt-1 text-right text-xs text-muted-foreground">
                                            {watch('metaDescription')?.length ?? 0}/500
                                        </p>
                                    </Field>
                                    <Field label="Meta Keywords" hint="Comma-separated keywords">
                                        <Input {...register('metaKeywords')} placeholder="app, dashboard, saas" />
                                    </Field>

                                    <Separator />

                                    <Field
                                        label="Google Analytics ID"
                                        hint="e.g. G-XXXXXXXXXX or UA-XXXXXX-X"
                                    >
                                        <Input {...register('googleAnalyticsId')} placeholder="G-XXXXXXXXXX" className="font-mono" />
                                    </Field>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Maintenance ── */}
                        <TabsContent value="maintenance">
                            <Card className={maintenanceMode ? 'border-destructive/50 ring-1 ring-destructive/30' : ''}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <TriangleAlert className={`h-4 w-4 ${maintenanceMode ? 'text-destructive' : ''}`} />
                                        Maintenance Mode
                                    </CardTitle>
                                    <CardDescription>
                                        When enabled, visitors see a maintenance page. Admins can still log in.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-medium text-sm">Enable Maintenance Mode</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Public access will be blocked
                                            </p>
                                        </div>
                                        <Switch
                                            checked={maintenanceMode}
                                            onCheckedChange={(v) => setValue('maintenanceMode', v, { shouldDirty: true })}
                                        />
                                    </div>

                                    {maintenanceMode && (
                                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                                            <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                                                <TriangleAlert className="h-4 w-4" />
                                                Maintenance mode is active
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Your site is currently in maintenance mode. Save to apply changes.
                                            </p>
                                        </div>
                                    )}

                                    <Field
                                        label="Maintenance Message"
                                        hint="Shown to visitors during maintenance"
                                    >
                                        <Textarea
                                            {...register('maintenanceMessage')}
                                            placeholder="We're currently performing maintenance. We'll be back shortly!"
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </Field>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Sticky save bar */}
                    {isDirty && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border bg-background/90 px-5 py-3 shadow-lg backdrop-blur-md">
                            <p className="text-sm text-muted-foreground">You have unsaved changes</p>
                            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </form>
            )}
        </div>
    )
}
