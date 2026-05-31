'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragMoveEvent,
    type DragOverEvent,
    type DragStartEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminModuleService } from '../services/admin-module-service'
import { adminPermissionService } from '../services/admin-permission-service'
import type { IAppModule } from '../types/admin-types'
import { PermissionName } from '../permissions/permission-name'
import { ModuleDeleteDialog } from './module-delete-dialog'
import { ModuleFormDialog } from './module-form-dialog'

// ─────────────────────────────────────────────────────────────────────────────
// Tree helpers
// ─────────────────────────────────────────────────────────────────────────────

const INDENT = 32 // px per depth level

interface FlatItem {
    id: string
    module: IAppModule
    depth: number
    parentId: string | null
    hasChildren: boolean
}

function flattenTree(
    modules: IAppModule[],
    parentId: string | null = null,
    depth = 0,
    collapsed: Set<string> = new Set(),
): FlatItem[] {
    return modules
        .filter(m => (m.parentId ?? null) === parentId)
        .sort((a, b) => a.order - b.order)
        .flatMap(m => {
            const hasChildren = modules.some(c => (c.parentId ?? null) === m.id)
            const item: FlatItem = { id: m.id, module: m, depth, parentId, hasChildren }
            if (collapsed.has(m.id)) return [item]
            return [item, ...flattenTree(modules, m.id, depth + 1, collapsed)]
        })
}

function getProjection(
    items: FlatItem[],
    activeId: string,
    overId: string,
    deltaX: number,
): { parentId: string | null; depth: number } {
    const aIdx = items.findIndex(i => i.id === activeId)
    const oIdx = items.findIndex(i => i.id === overId)
    if (aIdx < 0 || oIdx < 0) return { parentId: null, depth: 0 }

    const activeItem = items[aIdx]
    const moved = arrayMove(items, aIdx, oIdx)
    const prev = moved[oIdx - 1]
    const next = moved[oIdx + 1]

    const depthDelta = Math.round(deltaX / INDENT)
    let depth = activeItem.depth + depthDelta
    const maxDepth = prev ? prev.depth + 1 : 0
    const minDepth = next ? next.depth : 0
    depth = Math.min(Math.max(depth, minDepth), maxDepth)

    if (depth === 0) return { parentId: null, depth: 0 }

    for (let i = oIdx - 1; i >= 0; i--) {
        if (moved[i].depth === depth - 1) return { parentId: moved[i].id, depth }
        if (moved[i].depth < depth - 1) break
    }
    return { parentId: null, depth: 0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Row UI
// ─────────────────────────────────────────────────────────────────────────────

interface ModuleRowProps {
    item: FlatItem
    depth: number
    permMap: Record<string, string>
    collapsed: Set<string>
    onToggle: (id: string) => void
    onEdit: (m: IAppModule) => void
    onDelete: (m: IAppModule) => void
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
    isOverlay?: boolean
}

function ModuleRow({
    item, depth, permMap, collapsed, onToggle, onEdit, onDelete, dragHandleProps, isOverlay,
}: ModuleRowProps) {
    return (
        <div
            className={`flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 shadow-sm ${isOverlay ? 'shadow-lg ring-1 ring-primary/30' : ''}`}
            style={{ marginLeft: depth * INDENT }}
        >
            {/* drag handle */}
            <button
                {...dragHandleProps}
                className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
                aria-label="Drag to reorder"
                tabIndex={-1}
            >
                <GripVertical className="h-4 w-4" />
            </button>

            {/* collapse toggle */}
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {item.hasChildren ? (
                    <button
                        onClick={e => { e.stopPropagation(); onToggle(item.id) }}
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                    >
                        {collapsed.has(item.id)
                            ? <ChevronRight className="h-3.5 w-3.5" />
                            : <ChevronDown className="h-3.5 w-3.5" />
                        }
                    </button>
                ) : (
                    /* indent guide dot for children */
                    depth > 0 && <span className="h-1 w-1 rounded-full bg-border" />
                )}
            </div>

            {/* content */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium">{item.module.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">{item.module.slug}</Badge>
                    {!item.module.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.module.path}</p>
            </div>

            {/* permission pills (compact) */}
            {!isOverlay && item.module.permissionIds.length > 0 && (
                <div className="hidden flex-wrap items-center gap-1 sm:flex">
                    {item.module.permissionIds.slice(0, 3).map(pid => {
                        const name = permMap[pid]
                        return name ? (
                            <span key={pid} className="rounded border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[10px]">
                                <PermissionName name={name} />
                            </span>
                        ) : null
                    })}
                    {item.module.permissionIds.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{item.module.permissionIds.length - 3}</span>
                    )}
                </div>
            )}

            {/* actions */}
            {!isOverlay && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 shrink-0 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item.module)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(item.module)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}

interface SortableRowProps extends Omit<ModuleRowProps, 'dragHandleProps' | 'depth'> {
    projection: { parentId: string | null; depth: number } | null
    activeId: UniqueIdentifier | null
}

function SortableRow({ item, projection, activeId, ...rest }: SortableRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
    const isActive = item.id === activeId
    const depth = isActive && projection ? projection.depth : item.depth

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.25 : 1 }}
        >
            <ModuleRow
                {...rest}
                item={item}
                depth={depth}
                dragHandleProps={{ ...attributes, ...listeners } as any}
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export function ModulesPage() {
    const qc = useQueryClient()
    const [editModule, setEditModule] = useState<IAppModule | null>(null)
    const [deleteModule, setDeleteModule] = useState<IAppModule | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [items, setItems] = useState<IAppModule[]>([])
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

    // DnD state
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [overId, setOverId] = useState<UniqueIdentifier | null>(null)
    const [deltaX, setDeltaX] = useState(0)
    // track which items were auto-collapsed at drag start (so we restore on drop)
    const autoCollapsedRef = useRef<string | null>(null)

    const { data: modulesData, isLoading } = useQuery({
        queryKey: ['admin-modules'],
        queryFn: () => adminModuleService.getAll(),
    })

    const { data: permsData } = useQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminPermissionService.getAll(),
    })

    const permissions = permsData?.data ?? []
    const permMap: Record<string, string> = Object.fromEntries(permissions.map(p => [p.id, p.name]))

    useEffect(() => {
        if (modulesData?.data) setItems(modulesData.data)
    }, [modulesData])

    // Flatten tree — during drag, active item is temporarily collapsed so its
    // children don't interfere with depth projection
    const flatItems = useMemo(() => {
        const tempCollapsed = new Set(collapsed)
        if (activeId) tempCollapsed.add(activeId as string)
        return flattenTree(items, null, 0, tempCollapsed)
    }, [items, collapsed, activeId])

    const projection = useMemo(() => {
        if (!activeId || !overId) return null
        return getProjection(flatItems, activeId as string, overId as string, deltaX)
    }, [flatItems, activeId, overId, deltaX])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    )

    // ── mutations ──────────────────────────────────────────────────────────────

    const createMutation = useMutation({
        mutationFn: (data: any) => adminModuleService.create(data),
        onSuccess: () => { toast.success('Module created'); qc.invalidateQueries({ queryKey: ['admin-modules'] }); setFormOpen(false) },
        onError: (e: any) => toast.error(e.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminModuleService.update(id, data),
        onSuccess: () => { toast.success('Module updated'); qc.invalidateQueries({ queryKey: ['admin-modules'] }); setFormOpen(false) },
        onError: (e: any) => toast.error(e.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminModuleService.delete(id),
        onSuccess: () => { toast.success('Module deleted'); qc.invalidateQueries({ queryKey: ['admin-modules'] }); setDeleteModule(null) },
        onError: (e: any) => toast.error(e.message),
    })

    const reorderMutation = useMutation({
        mutationFn: (reorderItems: { id: string; parentId: string | null; order: number }[]) =>
            adminModuleService.reorder(reorderItems),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-modules'] }),
        onError: (e: any) => toast.error(e.message),
    })

    // ── DnD handlers ───────────────────────────────────────────────────────────

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveId(active.id)
        setDeltaX(0)
        // Auto-collapse active item so its children are excluded from flat list
        const hasChildren = items.some(m => (m.parentId ?? null) === active.id)
        if (hasChildren && !collapsed.has(active.id as string)) {
            autoCollapsedRef.current = active.id as string
            setCollapsed(prev => new Set([...prev, active.id as string]))
        }
    }

    const handleDragMove = ({ delta }: DragMoveEvent) => {
        setDeltaX(delta.x)
    }

    const handleDragOver = ({ over }: DragOverEvent) => {
        setOverId(over?.id ?? null)
    }

    const handleDragEnd = ({ active, over, delta }: DragEndEvent) => {
        const aId = active.id as string
        const oId = over?.id as string | undefined

        // Restore auto-collapsed item
        if (autoCollapsedRef.current) {
            const toRestore = autoCollapsedRef.current
            autoCollapsedRef.current = null
            setCollapsed(prev => {
                const next = new Set(prev)
                next.delete(toRestore)
                return next
            })
        }

        setActiveId(null)
        setOverId(null)
        setDeltaX(0)

        if (!oId) return

        // Recompute flat items synchronously — do NOT rely on the stale memo.
        // Keep active item collapsed so its children are excluded (same as during drag).
        const dragCollapsed = new Set(collapsed)
        dragCollapsed.add(aId)
        const currentFlat = flattenTree(items, null, 0, dragCollapsed)

        // Use delta.x directly from the event — avoids the stale-state bug where
        // React batches the last onDragMove setState with onDragEnd, leaving
        // deltaX one frame behind.
        const proj = getProjection(currentFlat, aId, oId, delta.x)

        const aIdx = currentFlat.findIndex(f => f.id === aId)
        const oIdx = currentFlat.findIndex(f => f.id === oId)
        if (aIdx < 0 || oIdx < 0) return

        const activeFlat = currentFlat[aIdx]
        const oldParentId = activeFlat.module.parentId ?? null

        // When dropped on itself with no horizontal change → nothing to do
        if (aId === oId && proj.parentId === oldParentId) return

        // Same vertical position (horizontal-only reparent) → keep order, change parent only
        const reordered = aId === oId ? [...currentFlat] : arrayMove(currentFlat, aIdx, oIdx)

        const parentCounter = new Map<string | null, number>()
        const updates: { id: string; parentId: string | null; order: number }[] = []

        for (const fi of reordered) {
            const pid = fi.id === aId ? proj.parentId : (fi.module.parentId ?? null)
            const order = parentCounter.get(pid) ?? 0
            parentCounter.set(pid, order + 1)
            updates.push({ id: fi.id, parentId: pid, order })
        }

        setItems(prev =>
            prev.map(m => {
                const u = updates.find(u => u.id === m.id)
                return u ? { ...m, parentId: u.parentId, order: u.order } : m
            }),
        )

        reorderMutation.mutate(updates)
    }

    const handleDragCancel = () => {
        const toRestore = autoCollapsedRef.current
        autoCollapsedRef.current = null
        setActiveId(null)
        setOverId(null)
        setDeltaX(0)
        if (toRestore) {
            setCollapsed(prev => {
                const next = new Set(prev)
                next.delete(toRestore)
                return next
            })
        }
    }

    const toggleCollapse = (id: string) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleSubmit = (values: any) => {
        if (editModule) updateMutation.mutate({ id: editModule.id, data: values })
        else createMutation.mutate(values)
    }

    const activeItem = flatItems.find(f => f.id === activeId)
    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
                    <p className="text-sm text-muted-foreground">
                        Drag to reorder · drag left/right to change depth · {items.length} total
                    </p>
                </div>
                {items.length > 0 && (
                    <Button onClick={() => { setEditModule(null); setFormOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Module
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : flatItems.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No modules yet.</p>
                    <Button onClick={() => { setEditModule(null); setFormOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Module
                    </Button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <SortableContext items={flatItems.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-1.5">
                            {flatItems.map(fi => (
                                <React.Fragment key={fi.id}>
                                    {/* drop indicator line */}
                                    {activeId && overId === fi.id && projection && (
                                        <div
                                            className="pointer-events-none my-0.5 h-0.5 rounded-full bg-primary transition-all"
                                            style={{ marginLeft: projection.depth * INDENT + 56 }}
                                        />
                                    )}
                                    <SortableRow
                                        item={fi}
                                        projection={projection}
                                        activeId={activeId}
                                        permMap={permMap}
                                        collapsed={collapsed}
                                        onToggle={toggleCollapse}
                                        onEdit={mod => { setEditModule(mod); setFormOpen(true) }}
                                        onDelete={setDeleteModule}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay dropAnimation={null}>
                        {activeItem ? (
                            <ModuleRow
                                item={activeItem}
                                depth={projection?.depth ?? activeItem.depth}
                                permMap={permMap}
                                collapsed={collapsed}
                                onToggle={() => {}}
                                onEdit={() => {}}
                                onDelete={() => {}}
                                isOverlay
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            <ModuleFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                module={editModule}
                onSubmit={handleSubmit}
                isPending={isPending}
            />

            <ModuleDeleteDialog
                open={!!deleteModule}
                onOpenChange={v => !v && setDeleteModule(null)}
                module={deleteModule}
                onConfirm={() => deleteModule && deleteMutation.mutate(deleteModule.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
