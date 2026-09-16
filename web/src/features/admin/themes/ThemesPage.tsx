'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { CheckCircle, Pencil, Plus, Trash2, Zap } from 'lucide-react'
import { toast } from 'sonner'

import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'
import DashboardPageHeader from '@/components/layouts/backend/DashboardPageHeader'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import { UiButton } from '@/components/ui-custom/UiButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { adminThemeService } from './services/ThemeService'
import { ThemeDeleteDialog } from './ThemeDeleteDialog'
import { ThemeEditor } from './ThemeEditor'
import type { ITheme, IThemeConfig } from './types/ThemeTypes'

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback
}

function ColorSwatch({ color }: { color: string }) {
    return (
        <span
            className="border-border inline-block h-4 w-4 rounded-full border"
            style={{ backgroundColor: color }}
        />
    )
}

function PaletteRow({ label, colors }: { label: string; colors: (string | undefined)[] }) {
    const filtered = colors.filter(Boolean) as string[]
    if (filtered.length === 0) return null
    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-12 shrink-0 text-[10px] font-medium uppercase">
                {label}
            </span>
            <div className="flex flex-wrap items-center gap-1">
                {filtered.map((c, i) => (
                    <ColorSwatch key={i} color={c} />
                ))}
            </div>
        </div>
    )
}

function ThemeCard({
    theme,
    onEdit,
    onDelete,
    onActivate,
    activatePending,
}: {
    theme: ITheme
    onEdit: (t: ITheme) => void
    onDelete: (t: ITheme) => void
    onActivate: (t: ITheme) => void
    activatePending: boolean
}) {
    const { config } = theme
    const light = config.light ?? ({} as Partial<NonNullable<ITheme['config']>['light']>)
    const dark = config.dark
    return (
        <Card
            className={`group cursor-pointer rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${theme.isActive ? 'ring-primary shadow-sm ring-2' : 'border-border/60 hover:border-border shadow-sm'}`}
        >
            <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            {theme.name}
                            {theme.isActive && (
                                <Badge className="h-5 gap-1 px-1.5 text-[10px]">
                                    <CheckCircle className="h-2.5 w-2.5" /> Active
                                </Badge>
                            )}
                        </CardTitle>
                        <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                            {theme.slug}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2.5 px-4 pb-4">
                <PaletteRow
                    label="Light palette"
                    colors={[
                        light.background,
                        light.foreground,
                        light.primary,
                        light.secondary,
                        light.accent,
                        light.destructive,
                        light.chart1,
                        light.chart2,
                    ]}
                />
                <PaletteRow
                    label="Dark palette"
                    colors={
                        dark
                            ? [
                                  dark.background,
                                  dark.foreground,
                                  dark.primary,
                                  dark.secondary,
                                  dark.accent,
                                  dark.destructive,
                                  dark.chart1,
                                  dark.chart2,
                              ]
                            : []
                    }
                />
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    {config.fontFamily && (
                        <span className="text-muted-foreground truncate">{config.fontFamily}</span>
                    )}
                    {config.radius && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                            {config.radius}rem
                        </Badge>
                    )}
                    {config.heroVariant && (
                        <Badge variant="outline" className="h-4 px-1.5 text-[9px]">
                            {config.heroVariant}
                        </Badge>
                    )}
                </div>
                <div className="-mx-1 flex items-center gap-1 border-t pt-2">
                    {!theme.isActive && (
                        <UiButton
                            size="sm"
                            variant="secondary"
                            className="h-6 gap-1 rounded-full px-2.5 text-[11px]"
                            onClick={() => onActivate(theme)}
                            disabled={activatePending}
                        >
                            <Zap className="h-3 w-3" />
                            Activate
                        </UiButton>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => onEdit(theme)}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive h-6 w-6"
                            onClick={() => onDelete(theme)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function ThemesPage() {
    const qc = useQueryClient()
    const [editorOpen, setEditorOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [editTheme, setEditTheme] = useState<ITheme | null>(null)
    const [deleteTheme, setDeleteTheme] = useState<ITheme | null>(null)

    const { data } = useSuspenseQuery({
        queryKey: ['admin-themes'],
        queryFn: () => adminThemeService.getAll(),
    })
    const themes = data?.data ?? []

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ['admin-themes'] })
        qc.invalidateQueries({ queryKey: ['my-theme'] })
    }

    const createMutation = useMutation({
        mutationFn: (values: {
            name: string
            slug: string
            isActive: boolean
            config: IThemeConfig
        }) => adminThemeService.create(values),
        onSuccess: () => {
            toast.success('Theme created')
            invalidate()
            setEditorOpen(false)
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, 'Failed to create theme')),
    })

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            values,
        }: {
            id: string
            values: Parameters<typeof adminThemeService.update>[1]
        }) => adminThemeService.update(id, values),
        onSuccess: () => {
            toast.success('Theme updated')
            invalidate()
            setEditorOpen(false)
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, 'Failed to update theme')),
    })

    const activateMutation = useMutation({
        mutationFn: (id: string) => adminThemeService.activate(id),
        onSuccess: () => {
            toast.success('Theme activated')
            invalidate()
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, 'Failed to activate theme')),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminThemeService.delete(id),
        onSuccess: () => {
            toast.success('Theme deleted')
            invalidate()
            setDeleteOpen(false)
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, 'Failed to delete theme')),
    })

    const handleEditorSubmit = (values: {
        name: string
        slug: string
        isActive: boolean
        config: IThemeConfig
    }) => {
        if (editTheme) {
            updateMutation.mutate({ id: editTheme.id, values })
        } else {
            createMutation.mutate(values)
        }
    }

    const openEdit = (t: ITheme) => {
        setEditTheme(t)
        setEditorOpen(true)
    }
    const openDelete = (t: ITheme) => {
        setDeleteTheme(t)
        setDeleteOpen(true)
    }
    const openCreate = () => {
        setEditTheme(null)
        setEditorOpen(true)
    }

    const editorPending = createMutation.isPending || updateMutation.isPending

    return (
        <DashboardPageMain>
            <DashboardPageHeader
                title="Themes"
                description={<>Manage and customize application color themes</>}
                actions={
                    <UiButton onClick={openCreate} className="rounded-full px-5 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> New Theme
                    </UiButton>
                }
            />

            <DashboardPageCard>
                {themes.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 text-center">
                        <p className="text-muted-foreground text-sm">
                            No themes yet. Create your first theme to customize the look of the
                            application.
                        </p>
                        <Button
                            onClick={openCreate}
                            variant="outline"
                            className="gap-2 rounded-full"
                        >
                            <Plus className="h-4 w-4" /> Create your first theme
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {themes.map((t) => (
                            <ThemeCard
                                key={t.id}
                                theme={t}
                                onEdit={openEdit}
                                onDelete={openDelete}
                                onActivate={(th) => activateMutation.mutate(th.id)}
                                activatePending={activateMutation.isPending}
                            />
                        ))}
                    </div>
                )}
            </DashboardPageCard>

            <ThemeEditor
                open={editorOpen}
                onOpenChange={setEditorOpen}
                theme={editTheme}
                onSubmit={handleEditorSubmit}
                isPending={editorPending}
            />

            <ThemeDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                theme={deleteTheme}
                onConfirm={() => deleteTheme && deleteMutation.mutate(deleteTheme.id)}
                isPending={deleteMutation.isPending}
            />
        </DashboardPageMain>
    )
}
