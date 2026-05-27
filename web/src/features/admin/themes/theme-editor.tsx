'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Moon, Sun, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ITheme, IThemeConfig, IThemeVars } from '../types/admin-types'

// ── defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_LIGHT: IThemeVars = {
    background: '#ffffff', foreground: '#0a0a0a',
    card: '#ffffff', cardForeground: '#0a0a0a',
    popover: '#ffffff', popoverForeground: '#0a0a0a',
    primary: '#171717', primaryForeground: '#fafafa',
    secondary: '#f5f5f5', secondaryForeground: '#171717',
    muted: '#f5f5f5', mutedForeground: '#737373',
    accent: '#f5f5f5', accentForeground: '#171717',
    destructive: '#ef4444',
    border: '#e5e5e5', input: '#e5e5e5', ring: '#a3a3a3',
    chart1: '#e76e50', chart2: '#2a9d8f', chart3: '#264653', chart4: '#e9c46a', chart5: '#f4a261',
    sidebar: '#fafafa', sidebarForeground: '#3f3f46',
    sidebarPrimary: '#18181b', sidebarPrimaryForeground: '#fafafa',
    sidebarAccent: '#f4f4f5', sidebarAccentForeground: '#18181b',
    sidebarBorder: '#e4e4e7', sidebarRing: '#3b82f6',
}

export const DEFAULT_DARK: IThemeVars = {
    background: '#0a0a0a', foreground: '#fafafa',
    card: '#171717', cardForeground: '#fafafa',
    popover: '#171717', popoverForeground: '#fafafa',
    primary: '#fafafa', primaryForeground: '#171717',
    secondary: '#262626', secondaryForeground: '#fafafa',
    muted: '#262626', mutedForeground: '#a3a3a3',
    accent: '#404040', accentForeground: '#fafafa',
    destructive: '#7f1d1d',
    border: '#262626', input: '#262626', ring: '#d4d4d4',
    chart1: '#e76e50', chart2: '#2a9d8f', chart3: '#264653', chart4: '#e9c46a', chart5: '#f4a261',
    sidebar: '#18181b', sidebarForeground: '#a1a1aa',
    sidebarPrimary: '#3b82f6', sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#27272a', sidebarAccentForeground: '#fafafa',
    sidebarBorder: '#27272a', sidebarRing: '#3b82f6',
}

export const DEFAULT_CONFIG: IThemeConfig = {
    light: DEFAULT_LIGHT,
    dark: DEFAULT_DARK,
    radius: '0.625',
    fontFamily: 'Inter',
    heroVariant: 'centered',
    heroBackground: 'gradient',
}

// ── CSS var helpers ────────────────────────────────────────────────────────────

const VAR_MAP: Record<keyof IThemeVars, string> = {
    background: '--background', foreground: '--foreground',
    card: '--card', cardForeground: '--card-foreground',
    popover: '--popover', popoverForeground: '--popover-foreground',
    primary: '--primary', primaryForeground: '--primary-foreground',
    secondary: '--secondary', secondaryForeground: '--secondary-foreground',
    muted: '--muted', mutedForeground: '--muted-foreground',
    accent: '--accent', accentForeground: '--accent-foreground',
    destructive: '--destructive',
    border: '--border', input: '--input', ring: '--ring',
    chart1: '--chart-1', chart2: '--chart-2', chart3: '--chart-3', chart4: '--chart-4', chart5: '--chart-5',
    sidebar: '--sidebar', sidebarForeground: '--sidebar-foreground',
    sidebarPrimary: '--sidebar-primary', sidebarPrimaryForeground: '--sidebar-primary-foreground',
    sidebarAccent: '--sidebar-accent', sidebarAccentForeground: '--sidebar-accent-foreground',
    sidebarBorder: '--sidebar-border', sidebarRing: '--sidebar-ring',
}

function applyVars(vars: IThemeVars, radius: string) {
    const root = document.documentElement
    for (const [key, cssVar] of Object.entries(VAR_MAP)) {
        root.style.setProperty(cssVar, (vars as any)[key])
    }
    root.style.setProperty('--radius', `${radius}rem`)
}

function captureCurrentVars(): Record<string, string> {
    const root = document.documentElement
    const snapshot: Record<string, string> = {}
    for (const cssVar of Object.values(VAR_MAP)) {
        snapshot[cssVar] = root.style.getPropertyValue(cssVar)
    }
    snapshot['--radius'] = root.style.getPropertyValue('--radius')
    return snapshot
}

function restoreVars(snapshot: Record<string, string>) {
    const root = document.documentElement
    for (const [cssVar, val] of Object.entries(snapshot)) {
        if (val) root.style.setProperty(cssVar, val)
        else root.style.removeProperty(cssVar)
    }
}

// ── Color groups for editor ────────────────────────────────────────────────────

type ColorGroup = { label: string; fields: (keyof IThemeVars)[] }

const COLOR_GROUPS: ColorGroup[] = [
    { label: 'Base', fields: ['background', 'foreground'] },
    { label: 'Card', fields: ['card', 'cardForeground'] },
    { label: 'Popover', fields: ['popover', 'popoverForeground'] },
    { label: 'Primary', fields: ['primary', 'primaryForeground'] },
    { label: 'Secondary', fields: ['secondary', 'secondaryForeground'] },
    { label: 'Muted', fields: ['muted', 'mutedForeground'] },
    { label: 'Accent', fields: ['accent', 'accentForeground'] },
    { label: 'Destructive', fields: ['destructive'] },
    { label: 'Border & Input', fields: ['border', 'input', 'ring'] },
    { label: 'Charts', fields: ['chart1', 'chart2', 'chart3', 'chart4', 'chart5'] },
    {
        label: 'Sidebar',
        fields: [
            'sidebar', 'sidebarForeground',
            'sidebarPrimary', 'sidebarPrimaryForeground',
            'sidebarAccent', 'sidebarAccentForeground',
            'sidebarBorder', 'sidebarRing',
        ],
    },
]

const FIELD_LABELS: Record<keyof IThemeVars, string> = {
    background: 'Background', foreground: 'Foreground',
    card: 'Card', cardForeground: 'Card Foreground',
    popover: 'Popover', popoverForeground: 'Popover Foreground',
    primary: 'Primary', primaryForeground: 'Primary Foreground',
    secondary: 'Secondary', secondaryForeground: 'Secondary Foreground',
    muted: 'Muted', mutedForeground: 'Muted Foreground',
    accent: 'Accent', accentForeground: 'Accent Foreground',
    destructive: 'Destructive',
    border: 'Border', input: 'Input', ring: 'Ring',
    chart1: 'Chart 1', chart2: 'Chart 2', chart3: 'Chart 3', chart4: 'Chart 4', chart5: 'Chart 5',
    sidebar: 'Sidebar', sidebarForeground: 'Sidebar Foreground',
    sidebarPrimary: 'Sidebar Primary', sidebarPrimaryForeground: 'Sidebar Primary Fg',
    sidebarAccent: 'Sidebar Accent', sidebarAccentForeground: 'Sidebar Accent Fg',
    sidebarBorder: 'Sidebar Border', sidebarRing: 'Sidebar Ring',
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ColorRow({
    field,
    value,
    onChange,
}: {
    field: keyof IThemeVars
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted-foreground">{FIELD_LABELS[field]}</p>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-7 font-mono text-xs"
                    placeholder="#000000"
                />
            </div>
        </div>
    )
}

function VarsEditor({
    vars,
    onChange,
}: {
    vars: IThemeVars
    onChange: (patch: Partial<IThemeVars>) => void
}) {
    return (
        <div className="space-y-5">
            {COLOR_GROUPS.map((group) => (
                <div key={group.label}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.label}
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {group.fields.map((field) => (
                            <ColorRow
                                key={field}
                                field={field}
                                value={vars[field]}
                                onChange={(v) => onChange({ [field]: v })}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── ThemePreview ───────────────────────────────────────────────────────────────

function ThemePreview() {
    return (
        <div className="flex h-full flex-col gap-3 overflow-auto p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">Secondary</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="ghost">Ghost</Button>
                <Button size="sm" variant="destructive">Destructive</Button>
            </div>

            {/* Card */}
            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <p className="font-semibold">Card Title</p>
                <p className="mt-1 text-sm text-muted-foreground">Card description with muted foreground text.</p>
                <div className="mt-3 flex gap-2">
                    <span className="rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">Badge</span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">Secondary</span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">Muted</span>
                </div>
            </div>

            {/* Input */}
            <div className="space-y-1">
                <label className="text-sm font-medium">Input field</label>
                <Input placeholder="Type something..." />
            </div>

            {/* Sidebar preview */}
            <div className="overflow-hidden rounded-lg border bg-sidebar text-sidebar-foreground">
                <div className="border-b border-sidebar-border bg-sidebar-primary px-3 py-2 text-xs font-semibold text-sidebar-primary-foreground">
                    Sidebar Header
                </div>
                <div className="space-y-1 p-2">
                    {['Dashboard', 'Users', 'Settings'].map((item, i) => (
                        <div
                            key={item}
                            className={`rounded px-3 py-1.5 text-xs ${
                                i === 0
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            }`}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Color swatches for charts */}
            <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Chart colors</p>
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div
                            key={n}
                            className="h-6 flex-1 rounded"
                            style={{ backgroundColor: `var(--chart-${n})` }}
                        />
                    ))}
                </div>
            </div>

            {/* Typography */}
            <div className="space-y-1">
                <p className="text-lg font-bold">Heading text</p>
                <p className="text-sm text-foreground">Regular foreground text looks like this.</p>
                <p className="text-sm text-muted-foreground">Muted foreground text for secondary content.</p>
                <p className="text-sm text-destructive">Destructive / error text.</p>
            </div>

            {/* Border / Ring */}
            <div className="flex gap-2">
                <div className="flex-1 rounded-md border border-border p-3 text-xs text-muted-foreground">border</div>
                <div className="flex-1 rounded-md border-2 border-ring p-3 text-xs text-muted-foreground">ring</div>
            </div>
        </div>
    )
}

// ── Main Editor ────────────────────────────────────────────────────────────────

interface ThemeEditorProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    theme: ITheme | null
    onSubmit: (values: { name: string; slug: string; isActive: boolean; config: IThemeConfig }) => void
    isPending: boolean
}

export function ThemeEditor({ open, onOpenChange, theme, onSubmit, isPending }: ThemeEditorProps) {
    const snapshotRef = useRef<Record<string, string>>({})
    const isDarkPage = useRef(false)

    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [isActive, setIsActive] = useState(false)
    const [config, setConfig] = useState<IThemeConfig>(DEFAULT_CONFIG)
    const [previewDark, setPreviewDark] = useState(false)

    // Reset state when dialog opens
    useEffect(() => {
        if (!open) return
        snapshotRef.current = captureCurrentVars()
        isDarkPage.current = document.documentElement.classList.contains('dark')

        if (theme) {
            setName(theme.name)
            setSlug(theme.slug)
            setIsActive(theme.isActive)
            const raw = theme.config
            const cfg: IThemeConfig = {
                light: { ...DEFAULT_LIGHT, ...(raw.light ?? {}) },
                dark: { ...DEFAULT_DARK, ...(raw.dark ?? {}) },
                radius: raw.radius ?? DEFAULT_CONFIG.radius,
                fontFamily: raw.fontFamily ?? DEFAULT_CONFIG.fontFamily,
                heroVariant: raw.heroVariant ?? DEFAULT_CONFIG.heroVariant,
                heroBackground: raw.heroBackground ?? DEFAULT_CONFIG.heroBackground,
            }
            setConfig(cfg)
            setPreviewDark(isDarkPage.current)
            applyVars(isDarkPage.current ? cfg.dark : cfg.light, cfg.radius)
        } else {
            setName('')
            setSlug('')
            setIsActive(false)
            setConfig(DEFAULT_CONFIG)
            setPreviewDark(false)
            applyVars(DEFAULT_LIGHT, DEFAULT_CONFIG.radius)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Restore on close without save
    const handleOpenChange = (v: boolean) => {
        if (!v) restoreVars(snapshotRef.current)
        onOpenChange(v)
    }

    const patchVars = (mode: 'light' | 'dark', patch: Partial<IThemeVars>) => {
        setConfig((prev) => {
            const updated = { ...prev, [mode]: { ...prev[mode], ...patch } }
            if (mode === (previewDark ? 'dark' : 'light')) {
                applyVars(updated[mode], updated.radius)
            }
            return updated
        })
    }

    const patchRadius = (v: string) => {
        setConfig((prev) => {
            applyVars(previewDark ? prev.dark : prev.light, v)
            return { ...prev, radius: v }
        })
    }

    const togglePreviewDark = () => {
        setPreviewDark((prev) => {
            const next = !prev
            applyVars(next ? config.dark : config.light, config.radius)
            return next
        })
    }

    const handleNameChange = (v: string) => {
        setName(v)
        if (!theme) setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }

    const handleSubmit = () => {
        onSubmit({ name, slug, isActive, config })
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-[95vw]"
            >
                {/* Header */}
                <SheetHeader className="flex-row items-center justify-between border-b px-5 py-3">
                    <SheetTitle className="text-base">
                        {theme ? `Edit theme — ${theme.name}` : 'New Theme'}
                    </SheetTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={togglePreviewDark}
                            className="gap-1.5"
                        >
                            {previewDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                            {previewDark ? 'Light' : 'Dark'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSubmit} disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                        </Button>
                    </div>
                </SheetHeader>

                {/* Body: left controls + right preview */}
                <div className="flex min-h-0 flex-1 overflow-hidden">
                    {/* Left: controls */}
                    <div className="w-[420px] shrink-0 overflow-auto border-r">
                        <div className="space-y-5 p-5">
                            {/* Meta */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Name</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="Ocean Blue"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Slug</Label>
                                    <Input
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="ocean-blue"
                                        className="font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Font Family</Label>
                                    <Input
                                        value={config.fontFamily}
                                        onChange={(e) => setConfig((p) => ({ ...p, fontFamily: e.target.value }))}
                                        placeholder="Inter"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Radius <span className="text-muted-foreground">(rem)</span></Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min={0}
                                            max={2}
                                            step={0.125}
                                            value={parseFloat(config.radius) || 0.625}
                                            onChange={(e) => patchRadius(e.target.value)}
                                            className="flex-1"
                                        />
                                        <span className="w-10 text-right text-xs font-mono text-muted-foreground">
                                            {config.radius}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Hero Variant</Label>
                                    <Select
                                        value={config.heroVariant}
                                        onValueChange={(v) => setConfig((p) => ({ ...p, heroVariant: v as any }))}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="centered">Centered</SelectItem>
                                            <SelectItem value="fullwidth">Full Width</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Hero Background</Label>
                                    <Select
                                        value={config.heroBackground}
                                        onValueChange={(v) => setConfig((p) => ({ ...p, heroBackground: v as any }))}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gradient">Gradient</SelectItem>
                                            <SelectItem value="solid">Solid</SelectItem>
                                            <SelectItem value="mesh">Mesh</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 cursor-pointer"
                                />
                                <Label htmlFor="isActive" className="cursor-pointer text-xs">
                                    Set as active theme on save
                                </Label>
                            </div>

                            <Separator />

                            {/* Color tabs */}
                            <Tabs defaultValue="light">
                                <TabsList className="w-full">
                                    <TabsTrigger value="light" className="flex-1">
                                        <Sun className="mr-1.5 h-3.5 w-3.5" /> Light
                                    </TabsTrigger>
                                    <TabsTrigger value="dark" className="flex-1">
                                        <Moon className="mr-1.5 h-3.5 w-3.5" /> Dark
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="light" className="mt-4">
                                    <VarsEditor
                                        vars={config.light}
                                        onChange={(patch) => patchVars('light', patch)}
                                    />
                                </TabsContent>
                                <TabsContent value="dark" className="mt-4">
                                    <VarsEditor
                                        vars={config.dark}
                                        onChange={(patch) => patchVars('dark', patch)}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Right: live preview */}
                    <div className="min-w-0 flex-1 overflow-hidden bg-background">
                        <ThemePreview />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
