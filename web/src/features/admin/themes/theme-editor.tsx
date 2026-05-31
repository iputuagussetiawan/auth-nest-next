'use client'

import { useEffect, useRef, useState } from 'react'
import {
    ChevronDown,
    ChevronRight,
    Loader2,
    Moon,
    Sun,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ITheme, IThemeConfig, IThemeVars } from '../types/admin-types'

// ── Defaults ──────────────────────────────────────────────────────────────────

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
    light: DEFAULT_LIGHT, dark: DEFAULT_DARK,
    radius: '0.625', fontFamily: 'Inter',
    heroVariant: 'centered', heroBackground: 'gradient',
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
    for (const [key, cssVar] of Object.entries(VAR_MAP)) root.style.setProperty(cssVar, (vars as any)[key])
    root.style.setProperty('--radius', `${radius}rem`)
}

function captureCurrentVars(): Record<string, string> {
    const root = document.documentElement
    const snap: Record<string, string> = {}
    for (const cssVar of Object.values(VAR_MAP)) snap[cssVar] = root.style.getPropertyValue(cssVar)
    snap['--radius'] = root.style.getPropertyValue('--radius')
    return snap
}

function restoreVars(snap: Record<string, string>) {
    const root = document.documentElement
    for (const [cssVar, val] of Object.entries(snap)) {
        if (val) root.style.setProperty(cssVar, val)
        else root.style.removeProperty(cssVar)
    }
}

// ── Color group definitions ───────────────────────────────────────────────────

interface PairDef { bg: keyof IThemeVars; fg: keyof IThemeVars; bgLabel: string; fgLabel: string }
interface GroupDef {
    key: string; label: string; desc: string
    pairs: PairDef[]
    singles: { field: keyof IThemeVars; label: string; cssVar: string }[]
}

const COLOR_GROUPS: GroupDef[] = [
    {
        key: 'page', label: 'Page', desc: 'Page background & body text',
        pairs: [{ bg: 'background', fg: 'foreground', bgLabel: 'Background', fgLabel: 'Foreground' }],
        singles: [],
    },
    {
        key: 'surfaces', label: 'Surfaces', desc: 'Cards, dialogs, popovers',
        pairs: [
            { bg: 'card', fg: 'cardForeground', bgLabel: 'Card', fgLabel: 'Card Text' },
            { bg: 'popover', fg: 'popoverForeground', bgLabel: 'Popover', fgLabel: 'Popover Text' },
        ],
        singles: [],
    },
    {
        key: 'brand', label: 'Brand', desc: 'Buttons, links, interactive elements',
        pairs: [
            { bg: 'primary', fg: 'primaryForeground', bgLabel: 'Primary', fgLabel: 'Primary Text' },
            { bg: 'secondary', fg: 'secondaryForeground', bgLabel: 'Secondary', fgLabel: 'Secondary Text' },
            { bg: 'accent', fg: 'accentForeground', bgLabel: 'Accent', fgLabel: 'Accent Text' },
        ],
        singles: [],
    },
    {
        key: 'muted', label: 'Muted & Feedback', desc: 'Subtle content, placeholders, error states',
        pairs: [{ bg: 'muted', fg: 'mutedForeground', bgLabel: 'Muted', fgLabel: 'Muted Text' }],
        singles: [{ field: 'destructive', label: 'Destructive', cssVar: '--destructive' }],
    },
    {
        key: 'structure', label: 'Structure', desc: 'Borders, input outlines, focus rings',
        pairs: [],
        singles: [
            { field: 'border', label: 'Border', cssVar: '--border' },
            { field: 'input', label: 'Input', cssVar: '--input' },
            { field: 'ring', label: 'Ring (focus)', cssVar: '--ring' },
        ],
    },
    {
        key: 'sidebar', label: 'Sidebar', desc: 'Navigation sidebar colors',
        pairs: [
            { bg: 'sidebar', fg: 'sidebarForeground', bgLabel: 'Sidebar Bg', fgLabel: 'Sidebar Text' },
            { bg: 'sidebarPrimary', fg: 'sidebarPrimaryForeground', bgLabel: 'Active Item', fgLabel: 'Active Text' },
            { bg: 'sidebarAccent', fg: 'sidebarAccentForeground', bgLabel: 'Hover Item', fgLabel: 'Hover Text' },
        ],
        singles: [
            { field: 'sidebarBorder', label: 'Sidebar Border', cssVar: '--sidebar-border' },
            { field: 'sidebarRing', label: 'Sidebar Ring', cssVar: '--sidebar-ring' },
        ],
    },
    {
        key: 'charts', label: 'Charts', desc: 'Data visualisation palette',
        pairs: [],
        singles: [
            { field: 'chart1', label: 'Chart 1', cssVar: '--chart-1' },
            { field: 'chart2', label: 'Chart 2', cssVar: '--chart-2' },
            { field: 'chart3', label: 'Chart 3', cssVar: '--chart-3' },
            { field: 'chart4', label: 'Chart 4', cssVar: '--chart-4' },
            { field: 'chart5', label: 'Chart 5', cssVar: '--chart-5' },
        ],
    },
]

// ── Input primitives ──────────────────────────────────────────────────────────

function ColorSwatch({
    value, onChange, compact = false,
}: { value: string; onChange: (v: string) => void; compact?: boolean }) {
    return (
        <div className="flex items-center gap-1.5">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5
                    ${compact ? 'h-6 w-6' : 'h-7 w-7'}`}
            />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`font-mono ${compact ? 'h-6 text-[10px]' : 'h-7 text-xs'}`}
                placeholder="#000000"
            />
        </div>
    )
}

function ColorPairRow({ pair, vars, onChange }: {
    pair: PairDef
    vars: IThemeVars
    onChange: (patch: Partial<IThemeVars>) => void
}) {
    const bgVal = vars[pair.bg]
    const fgVal = vars[pair.fg]
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            {/* Contrast preview strip */}
            <div
                className="flex items-center justify-between px-3 py-2"
                style={{ background: bgVal, color: fgVal }}
            >
                <span className="text-sm font-semibold">Aa</span>
                <span className="font-mono text-[10px] opacity-60">{bgVal}</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border bg-muted/10">
                <div className="space-y-1 p-2">
                    <p className="text-[10px] text-muted-foreground">{pair.bgLabel}</p>
                    <ColorSwatch compact value={bgVal} onChange={(v) => onChange({ [pair.bg]: v })} />
                </div>
                <div className="space-y-1 p-2">
                    <p className="text-[10px] text-muted-foreground">{pair.fgLabel}</p>
                    <ColorSwatch compact value={fgVal} onChange={(v) => onChange({ [pair.fg]: v })} />
                </div>
            </div>
        </div>
    )
}

function SingleColorRow({ field, label, cssVar, value, onChange }: {
    field: keyof IThemeVars; label: string; cssVar: string
    value: string; onChange: (v: string) => void
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/10 px-3 py-2">
            <div
                className="h-8 w-8 shrink-0 rounded-md border border-border"
                style={{ background: value }}
            />
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-medium">{label}</p>
                    <code className="rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">{cssVar}</code>
                </div>
                <ColorSwatch compact value={value} onChange={onChange} />
            </div>
        </div>
    )
}

// ── Collapsible group ─────────────────────────────────────────────────────────

function ColorGroup({ group, vars, onChange }: {
    group: GroupDef
    vars: IThemeVars
    onChange: (patch: Partial<IThemeVars>) => void
}) {
    const [open, setOpen] = useState(true)

    // Color swatches preview for header
    const previewColors = [
        ...group.pairs.map(p => vars[p.bg]),
        ...group.singles.map(s => vars[s.field]),
    ].slice(0, 5)

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center gap-3 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
                {/* Color swatches row */}
                <div className="flex gap-1">
                    {previewColors.map((c, i) => (
                        <span
                            key={i}
                            className="h-4 w-4 rounded-full border border-border/50"
                            style={{ background: c }}
                        />
                    ))}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{group.label}</p>
                    <p className="text-xs text-muted-foreground">{group.desc}</p>
                </div>
                {open
                    ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                }
            </button>

            {open && (
                <div className="space-y-3 p-4">
                    {group.pairs.map(pair => (
                        <ColorPairRow key={pair.bg} pair={pair} vars={vars} onChange={onChange} />
                    ))}
                    {group.singles.length > 0 && (
                        <div className="space-y-2">
                            {group.singles.map(s => (
                                <SingleColorRow
                                    key={s.field}
                                    field={s.field}
                                    label={s.label}
                                    cssVar={s.cssVar}
                                    value={vars[s.field]}
                                    onChange={(v) => onChange({ [s.field]: v })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Preview helpers ───────────────────────────────────────────────────────────

function PreviewSection({ title, vars: cssVars, children }: {
    title: string; vars: string[]; children: React.ReactNode
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
                <div className="flex flex-wrap gap-1">
                    {cssVars.map(v => (
                        <code key={v} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{v}</code>
                    ))}
                </div>
            </div>
            {children}
        </div>
    )
}

// ── Rich live preview ─────────────────────────────────────────────────────────

function ThemePreview() {
    return (
        <div className="h-full overflow-auto bg-background">
            <div className="space-y-6 p-6">

                {/* Mini app layout */}
                <PreviewSection title="App Layout" vars={['--background', '--sidebar', '--sidebar-foreground', '--border']}>
                    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                        <div className="flex h-48">
                            {/* Sidebar */}
                            <div className="flex w-36 flex-col bg-sidebar text-sidebar-foreground">
                                <div className="border-b border-sidebar-border px-3 py-2.5">
                                    <div className="h-2.5 w-16 rounded bg-sidebar-primary" />
                                </div>
                                <nav className="flex-1 space-y-0.5 p-2">
                                    {['Dashboard', 'Users', 'Settings', 'Reports'].map((item, i) => (
                                        <div
                                            key={item}
                                            className={`rounded px-2 py-1.5 text-xs font-medium ${
                                                i === 0
                                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                    : 'text-sidebar-foreground'
                                            }`}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </nav>
                            </div>
                            {/* Content */}
                            <div className="flex-1 space-y-2 p-3">
                                <div className="h-2.5 w-24 rounded bg-foreground/20" />
                                <div className="h-1.5 w-40 rounded bg-muted-foreground/30" />
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {[1,2,3,4].map(n => (
                                        <div key={n} className="rounded-md border border-border bg-card p-2">
                                            <div className="h-1.5 w-12 rounded bg-card-foreground/20 mb-1" />
                                            <div className="h-4 w-8 rounded bg-primary/30" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </PreviewSection>

                <Separator />

                {/* Buttons */}
                <PreviewSection title="Buttons" vars={['--primary', '--secondary', '--accent', '--destructive', '--muted']}>
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm">Primary</Button>
                            <Button size="sm" variant="secondary">Secondary</Button>
                            <Button size="sm" variant="outline">Outline</Button>
                            <Button size="sm" variant="ghost">Ghost</Button>
                            <Button size="sm" variant="destructive">Destructive</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" disabled>Disabled</Button>
                            <Button size="sm" variant="link">Link</Button>
                        </div>
                    </div>
                </PreviewSection>

                <Separator />

                {/* Cards & Surfaces */}
                <PreviewSection title="Cards & Surfaces" vars={['--card', '--card-foreground', '--popover', '--border']}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
                            <p className="text-sm font-semibold">Card Title</p>
                            <p className="mt-1 text-xs text-muted-foreground">Card description using muted-foreground.</p>
                            <div className="mt-3 flex gap-1.5">
                                <span className="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">Primary</span>
                                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">Secondary</span>
                            </div>
                            <div className="mt-3">
                                <Button size="sm" className="w-full">Action</Button>
                            </div>
                        </div>
                        <div className="rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Popover</p>
                            <p className="text-sm font-medium">Popover Content</p>
                            <p className="mt-1 text-xs text-muted-foreground">Uses --popover and --popover-foreground.</p>
                            <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">Cancel</Button>
                                <Button size="sm" className="flex-1 h-7 text-xs">Confirm</Button>
                            </div>
                        </div>
                    </div>
                </PreviewSection>

                <Separator />

                {/* Badges */}
                <PreviewSection title="Badges" vars={['--primary', '--secondary', '--muted', '--destructive']}>
                    <div className="flex flex-wrap gap-2">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">Accent</span>
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Muted</span>
                    </div>
                </PreviewSection>

                <Separator />

                {/* Form elements */}
                <PreviewSection title="Form Elements" vars={['--input', '--border', '--ring', '--background']}>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Text Input</label>
                            <Input placeholder="Enter value…" className="max-w-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Select</label>
                            <div className="flex max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
                                <span className="flex-1 text-muted-foreground">Choose option…</span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-xs font-medium">
                                <div className="h-4 w-4 rounded border border-primary bg-primary flex items-center justify-center">
                                    <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                Checked
                            </label>
                            <label className="flex items-center gap-2 text-xs font-medium">
                                <div className="h-4 w-4 rounded border border-input bg-background" />
                                Unchecked
                            </label>
                            <label className="flex items-center gap-2 text-xs font-medium">
                                <Switch defaultChecked /> Toggle
                            </label>
                        </div>
                    </div>
                </PreviewSection>

                <Separator />

                {/* Typography */}
                <PreviewSection title="Typography" vars={['--foreground', '--muted-foreground', '--destructive']}>
                    <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
                        <p className="text-xl font-bold text-foreground">Heading — foreground</p>
                        <p className="text-sm text-foreground">Body text using <code className="rounded bg-muted px-1 text-xs">--foreground</code>.</p>
                        <p className="text-sm text-muted-foreground">Secondary text using <code className="rounded bg-muted px-1 text-xs">--muted-foreground</code>.</p>
                        <p className="text-sm text-destructive">Error text using <code className="rounded bg-muted px-1 text-xs">--destructive</code>.</p>
                        <div className="mt-2 flex gap-2">
                            <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">border</span>
                            <span className="rounded border-2 border-ring px-2 py-0.5 text-xs text-muted-foreground">ring</span>
                        </div>
                    </div>
                </PreviewSection>

                <Separator />

                {/* Alerts */}
                <PreviewSection title="Alerts & Feedback" vars={['--destructive', '--muted', '--accent']}>
                    <div className="space-y-2">
                        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-destructive">Destructive Alert</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">Uses --destructive for border & text.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Info / Muted Alert</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">Uses --muted background and --border.</p>
                            </div>
                        </div>
                    </div>
                </PreviewSection>

                <Separator />

                {/* Charts */}
                <PreviewSection title="Charts" vars={['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5']}>
                    <div className="space-y-3">
                        {/* Bar chart */}
                        <div className="rounded-lg border border-border bg-card p-4">
                            <p className="mb-3 text-xs font-medium text-muted-foreground">Bar Chart</p>
                            <div className="flex h-24 items-end gap-2">
                                {([
                                    { n: 1, h: '65%' }, { n: 2, h: '85%' }, { n: 3, h: '45%' },
                                    { n: 4, h: '90%' }, { n: 5, h: '60%' },
                                ] as const).map(({ n, h }) => (
                                    <div key={n} className="flex flex-1 flex-col items-center gap-1">
                                        <div
                                            className="w-full rounded-t-sm"
                                            style={{ height: h, backgroundColor: `var(--chart-${n})` }}
                                        />
                                        <span className="text-[10px] text-muted-foreground">{h}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Palette strip */}
                        <div className="overflow-hidden rounded-lg border border-border">
                            {[1,2,3,4,5].map(n => (
                                <div
                                    key={n}
                                    className="flex h-8 items-center px-3"
                                    style={{ backgroundColor: `var(--chart-${n})` }}
                                >
                                    <code className="text-[11px] font-medium text-white/80 drop-shadow">--chart-{n}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </PreviewSection>

                {/* Radius demo */}
                <Separator />
                <PreviewSection title="Border Radius" vars={['--radius']}>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: 'sm', cls: 'rounded-sm' },
                            { label: 'md', cls: 'rounded-md' },
                            { label: 'lg', cls: 'rounded-lg' },
                            { label: 'xl', cls: 'rounded-xl' },
                            { label: '2xl', cls: 'rounded-2xl' },
                            { label: 'full', cls: 'rounded-full' },
                        ].map(({ label, cls }) => (
                            <div
                                key={label}
                                className={`flex h-12 w-16 items-center justify-center border-2 border-primary bg-primary/10 text-xs font-medium text-primary ${cls}`}
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                </PreviewSection>

            </div>
        </div>
    )
}

// ── Main Editor ───────────────────────────────────────────────────────────────

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
            setName(''); setSlug(''); setIsActive(false)
            setConfig(DEFAULT_CONFIG); setPreviewDark(false)
            applyVars(DEFAULT_LIGHT, DEFAULT_CONFIG.radius)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const handleOpenChange = (v: boolean) => {
        if (!v) restoreVars(snapshotRef.current)
        onOpenChange(v)
    }

    const patchVars = (mode: 'light' | 'dark', patch: Partial<IThemeVars>) => {
        setConfig((prev) => {
            const updated = { ...prev, [mode]: { ...prev[mode], ...patch } }
            if (mode === (previewDark ? 'dark' : 'light')) applyVars(updated[mode], updated.radius)
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

    return (
        <Drawer open={open} onOpenChange={handleOpenChange} direction="right" dismissible={false}>
            <DrawerContent className="flex flex-col gap-0 p-0 !w-[50vw] sm:!max-w-[50vw] rounded-l-xl">
                {/* ── Header ── */}
                <DrawerHeader className="flex-row items-center justify-between border-b px-5 py-3">
                    <div className="flex items-center gap-3">
                        <DrawerTitle className="text-base">
                            {theme ? `Edit — ${theme.name}` : 'New Theme'}
                        </DrawerTitle>
                        {previewDark && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <Moon className="h-3 w-3" /> Dark preview
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={togglePreviewDark} className="gap-1.5">
                            {previewDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                            {previewDark ? 'Light' : 'Dark'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button size="sm" onClick={() => onSubmit({ name, slug, isActive, config })} disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                        </Button>
                    </div>
                </DrawerHeader>

                {/* ── Body ── */}
                <div className="flex min-h-0 flex-1 overflow-hidden">

                    {/* Left: controls */}
                    <div className="w-[460px] shrink-0 overflow-auto border-r">
                        <div className="space-y-4 p-5">

                            {/* Identity */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identity</p>
                                <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Theme Name</Label>
                                            <Input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ocean Blue" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Slug</Label>
                                            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ocean-blue" className="font-mono" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                                        <Label htmlFor="isActive" className="cursor-pointer text-xs">Set as active theme on save</Label>
                                    </div>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</p>
                                <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Font Family</Label>
                                            <Input
                                                value={config.fontFamily}
                                                onChange={(e) => setConfig(p => ({ ...p, fontFamily: e.target.value }))}
                                                placeholder="Inter"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Border Radius
                                                <span className="ml-1 font-mono text-muted-foreground">{config.radius}rem</span>
                                            </Label>
                                            <div className="flex items-center gap-2 pt-1">
                                                <span className="text-xs text-muted-foreground">0</span>
                                                <input
                                                    type="range" min={0} max={2} step={0.125}
                                                    value={parseFloat(config.radius) || 0.625}
                                                    onChange={(e) => patchRadius(e.target.value)}
                                                    className="flex-1 accent-primary"
                                                />
                                                <span className="text-xs text-muted-foreground">2</span>
                                            </div>
                                            {/* Radius preview */}
                                            <div className="mt-1 flex gap-1.5">
                                                {['rounded-sm','rounded-md','rounded-lg','rounded-xl'].map(c => (
                                                    <div key={c} className={`h-5 flex-1 border-2 border-primary bg-primary/15 ${c}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Hero Variant</Label>
                                            <Select value={config.heroVariant} onValueChange={(v) => setConfig(p => ({ ...p, heroVariant: v as any }))}>
                                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="centered">Centered</SelectItem>
                                                    <SelectItem value="fullwidth">Full Width</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Hero Background</Label>
                                            <Select value={config.heroBackground} onValueChange={(v) => setConfig(p => ({ ...p, heroBackground: v as any }))}>
                                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="gradient">Gradient</SelectItem>
                                                    <SelectItem value="solid">Solid</SelectItem>
                                                    <SelectItem value="mesh">Mesh</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</p>
                                <Tabs defaultValue="light">
                                    <TabsList className="w-full">
                                        <TabsTrigger value="light" className="flex-1 gap-1.5">
                                            <Sun className="h-3.5 w-3.5" /> Light Mode
                                        </TabsTrigger>
                                        <TabsTrigger value="dark" className="flex-1 gap-1.5">
                                            <Moon className="h-3.5 w-3.5" /> Dark Mode
                                        </TabsTrigger>
                                    </TabsList>
                                    {(['light', 'dark'] as const).map(mode => (
                                        <TabsContent key={mode} value={mode} className="mt-3 space-y-2">
                                            {COLOR_GROUPS.map(group => (
                                                <ColorGroup
                                                    key={group.key}
                                                    group={group}
                                                    vars={config[mode]}
                                                    onChange={(patch) => patchVars(mode, patch)}
                                                />
                                            ))}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>

                        </div>
                    </div>

                    {/* Right: live preview */}
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <ThemePreview />
                    </div>

                </div>
            </DrawerContent>
        </Drawer>
    )
}
