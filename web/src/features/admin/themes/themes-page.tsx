'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, Pencil, Plus, Trash2, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminThemeService } from '../services/admin-theme-service'
import type { ITheme, IThemeConfig } from '../types/admin-types'
import { ThemeEditor } from './theme-editor'
import { ThemeDeleteDialog } from './theme-delete-dialog'

function ColorSwatch({ color }: { color: string }) {
    return (
        <span
            className="inline-block h-4 w-4 rounded-full border border-border"
            style={{ backgroundColor: color }}
        />
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
    const light = config.light ?? {} as any
    return (
        <Card className={theme.isActive ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-base">{theme.name}</CardTitle>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{theme.slug}</p>
                    </div>
                    {theme.isActive && (
                        <Badge className="gap-1 text-xs">
                            <CheckCircle className="h-3 w-3" /> Active
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Color swatches for main vars */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {[light.background, light.foreground, light.primary, light.secondary, light.accent, light.destructive, light.chart1, light.chart2, light.chart3]
                        .filter(Boolean)
                        .map((c, i) => <ColorSwatch key={i} color={c} />)}
                    <span className="ml-1 text-xs text-muted-foreground">{config.fontFamily}</span>
                </div>

                {/* Config badges */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                    {config.heroVariant && <Badge variant="outline">{config.heroVariant}</Badge>}
                    {config.heroBackground && <Badge variant="outline">{config.heroBackground}</Badge>}
                    {(config.radius) && <Badge variant="outline">r={config.radius}rem</Badge>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    {!theme.isActive && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs"
                            onClick={() => onActivate(theme)}
                            disabled={activatePending}
                        >
                            <Zap className="h-3 w-3" />
                            Activate
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => onEdit(theme)}>
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(theme)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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

    const { data, isLoading } = useQuery({
        queryKey: ['admin-themes'],
        queryFn: () => adminThemeService.getAll(),
    })
    const themes = data?.data ?? []

    const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-themes'] })

    const createMutation = useMutation({
        mutationFn: (values: { name: string; slug: string; isActive: boolean; config: IThemeConfig }) =>
            adminThemeService.create(values),
        onSuccess: () => { toast.success('Theme created'); invalidate(); setEditorOpen(false) },
        onError: (e: any) => toast.error(e?.message ?? 'Failed to create theme'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: any }) =>
            adminThemeService.update(id, values),
        onSuccess: () => { toast.success('Theme updated'); invalidate(); setEditorOpen(false) },
        onError: (e: any) => toast.error(e?.message ?? 'Failed to update theme'),
    })

    const activateMutation = useMutation({
        mutationFn: (id: string) => adminThemeService.activate(id),
        onSuccess: () => { toast.success('Theme activated'); invalidate() },
        onError: (e: any) => toast.error(e?.message ?? 'Failed to activate theme'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminThemeService.delete(id),
        onSuccess: () => { toast.success('Theme deleted'); invalidate(); setDeleteOpen(false) },
        onError: (e: any) => toast.error(e?.message ?? 'Failed to delete theme'),
    })

    const handleEditorSubmit = (values: { name: string; slug: string; isActive: boolean; config: IThemeConfig }) => {
        if (editTheme) {
            updateMutation.mutate({ id: editTheme.id, values })
        } else {
            createMutation.mutate(values)
        }
    }

    const openEdit = (t: ITheme) => { setEditTheme(t); setEditorOpen(true) }
    const openDelete = (t: ITheme) => { setDeleteTheme(t); setDeleteOpen(true) }
    const openCreate = () => { setEditTheme(null); setEditorOpen(true) }

    const editorPending = createMutation.isPending || updateMutation.isPending

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Themes</h1>
                    <p className="text-sm text-muted-foreground">Manage shadcn CSS variable themes</p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> New Theme
                </Button>
            </div>

            {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
            ) : themes.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <p className="text-sm text-muted-foreground">No themes yet.</p>
                    <Button onClick={openCreate} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" /> Create your first theme
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
    )
}
