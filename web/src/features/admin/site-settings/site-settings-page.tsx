'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Globe,
    Image as ImageIcon,
    Loader2,
    Mail,
    Search,
    Settings,
    Share2,
    Trash2,
    TriangleAlert,
    Upload,
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
    ogImageUrl: z.string().max(500).optional().or(z.literal('')),
    googleAnalyticsId: z.string().max(50).optional().or(z.literal('')),
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().max(500).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
    siteName: 'My App', tagline: '', description: '',
    logoUrl: '', faviconUrl: '',
    contactEmail: '', contactPhone: '', contactAddress: '',
    socialTwitter: '', socialFacebook: '', socialInstagram: '', socialLinkedin: '', socialYoutube: '',
    metaTitle: '', metaDescription: '', metaKeywords: '', ogImageUrl: '', googleAnalyticsId: '',
    maintenanceMode: false, maintenanceMessage: '',
}

// ── ImageUploader ─────────────────────────────────────────────────────────────

type UploadMode = 'upload' | 'url'

interface ImageUploaderProps {
    label: string
    hint: string
    value: string
    onChange: (url: string) => void
    previewSize?: 'logo' | 'favicon'
}

function ImageUploader({ label, hint, value, onChange, previewSize = 'logo' }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [mode, setMode] = useState<UploadMode>('upload')
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [urlDraft, setUrlDraft] = useState(value)

    const isLogo = previewSize === 'logo'

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) { toast.error('Only image files are allowed'); return }
        if (file.size > 5 * 1024 * 1024) { toast.error('File too large — max 5 MB'); return }
        setUploading(true)
        try {
            const res = await adminSiteSettingsService.uploadAsset(file, value || undefined)
            onChange(res.data.url)
            setUrlDraft(res.data.url)
            toast.success('Image uploaded')
        } catch (e: any) {
            toast.error(e?.message ?? 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleClear = async () => {
        if (value?.startsWith('http')) {
            try { await adminSiteSettingsService.deleteAsset(value) } catch {}
        }
        onChange('')
        setUrlDraft('')
    }

    const handleUrlApply = () => {
        onChange(urlDraft.trim())
    }

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        e.target.value = ''
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    return (
        <div className="space-y-3">
            {/* Header row: label + mode toggle */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
                </div>
                <div className="flex shrink-0 items-center rounded-lg border bg-muted/40 p-0.5">
                    <button
                        type="button"
                        onClick={() => setMode('upload')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                            ${mode === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Upload className="h-3.5 w-3.5" /> Upload
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('url')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                            ${mode === 'url' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Globe className="h-3.5 w-3.5" /> URL
                    </button>
                </div>
            </div>

            {/* Current image preview (always visible when set) */}
            {value && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                    <img
                        src={value}
                        alt={label}
                        className={`shrink-0 object-contain ${isLogo ? 'max-h-14 max-w-[120px]' : 'h-10 w-10'}`}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">Current image</p>
                        <p className="truncate text-xs text-muted-foreground">{value}</p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={handleClear}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Upload mode */}
            {mode === 'upload' && (
                <div
                    className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors
                        ${dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:border-muted-foreground/40'}
                        ${isLogo ? 'min-h-[130px] p-6' : 'min-h-[90px] p-4'}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => !uploading && inputRef.current?.click()}
                    style={{ cursor: uploading ? 'default' : 'pointer' }}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Uploading to Cloudinary…</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">
                                    {value ? 'Click or drag to replace' : 'Click to upload or drag & drop'}
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, SVG, WebP, ICO — max 5 MB</p>
                            </div>
                        </>
                    )}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileInput}
                    />
                </div>
            )}

            {/* URL mode */}
            {mode === 'url' && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Input
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlApply())}
                            placeholder="https://example.com/logo.png"
                            className="font-mono text-xs"
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={handleUrlApply}
                            disabled={!urlDraft.trim() || urlDraft.trim() === value}
                        >
                            Apply
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Press Enter or click Apply to preview the URL.</p>
                </div>
            )}
        </div>
    )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, hint, error, children }: {
    label: string; hint?: string; error?: string; children: React.ReactNode
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

// ── Page ──────────────────────────────────────────────────────────────────────

export function SiteSettingsPage() {
    const qc = useQueryClient()

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
            ogImageUrl: s.ogImageUrl ?? '',
            googleAnalyticsId: s.googleAnalyticsId ?? '',
            maintenanceMode: s.maintenanceMode ?? false,
            maintenanceMessage: s.maintenanceMessage ?? '',
        })
    }, [data, reset])

    const stripEmpty = (values: FormValues) =>
        Object.fromEntries(
            Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]),
        ) as FormValues

    const updateMutation = useMutation({
        mutationFn: (values: FormValues) => adminSiteSettingsService.update(stripEmpty(values)),
        onSuccess: () => {
            toast.success('Settings saved')
            qc.invalidateQueries({ queryKey: ['site-settings'] })
        },
        onError: (e: any) => toast.error(e?.message ?? 'Failed to save settings'),
    })

    const maintenanceMode = watch('maintenanceMode')
    const logoUrl = watch('logoUrl') ?? ''
    const faviconUrl = watch('faviconUrl') ?? ''
    const ogImageUrl = watch('ogImageUrl') ?? ''

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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading settings…
                </div>
            ) : (
                <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))}>
                    <Tabs defaultValue="general" className="space-y-5">
                        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
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
                                    <CardDescription>
                                        Upload your logo and favicon. Images are stored on Cloudinary.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <ImageUploader
                                        label="Logo"
                                        hint="Shown in the header and emails. PNG, SVG, WebP recommended."
                                        value={logoUrl}
                                        onChange={(url) => setValue('logoUrl', url, { shouldDirty: true })}
                                        previewSize="logo"
                                    />

                                    <Separator />

                                    <ImageUploader
                                        label="Favicon"
                                        hint="32×32 or 64×64 icon shown in browser tabs. ICO, PNG supported."
                                        value={faviconUrl}
                                        onChange={(url) => setValue('faviconUrl', url, { shouldDirty: true })}
                                        previewSize="favicon"
                                    />
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
                                            <Input {...register('contactEmail')} type="email" placeholder="hello@example.com" />
                                        </Field>
                                        <Field label="Phone Number">
                                            <Input {...register('contactPhone')} placeholder="+1 (555) 000-0000" />
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
                                    {([
                                        { key: 'socialTwitter', label: 'X / Twitter', placeholder: 'https://x.com/yourhandle' },
                                        { key: 'socialFacebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
                                        { key: 'socialInstagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
                                        { key: 'socialLinkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourco' },
                                        { key: 'socialYoutube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
                                    ] as const).map(({ key, label, placeholder }) => (
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
                                    <ImageUploader
                                        label="OG Image"
                                        hint="Shown when shared on social media. 1200×630px recommended."
                                        value={ogImageUrl}
                                        onChange={(url) => setValue('ogImageUrl', url, { shouldDirty: true })}
                                        previewSize="logo"
                                    />
                                    <Separator />
                                    <Field label="Google Analytics ID" hint="e.g. G-XXXXXXXXXX or UA-XXXXXX-X">
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
                                            <p className="text-sm font-medium">Enable Maintenance Mode</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">Public access will be blocked</p>
                                        </div>
                                        <Switch
                                            checked={maintenanceMode}
                                            onCheckedChange={(v) => setValue('maintenanceMode', v, { shouldDirty: true })}
                                        />
                                    </div>
                                    {maintenanceMode && (
                                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
                                            <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                                                <TriangleAlert className="h-4 w-4" /> Maintenance mode is active
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Your site is currently in maintenance mode. Save to apply changes.
                                            </p>
                                        </div>
                                    )}
                                    <Field label="Maintenance Message" hint="Shown to visitors during maintenance">
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
                        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border bg-background/90 px-5 py-3 shadow-lg backdrop-blur-md">
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
