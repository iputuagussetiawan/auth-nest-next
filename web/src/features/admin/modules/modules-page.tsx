'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { adminRoleService } from '../services/admin-role-service'
import { adminPermissionService } from '../services/admin-permission-service'
import type { IAppModule } from '../types/admin-types'
import { PermissionName } from '../permissions/permission-name'
import { ModuleDeleteDialog } from './module-delete-dialog'
import { ModuleFormDialog } from './module-form-dialog'

// ── Sortable row ─────────────────────────────────────────────────────────────

interface SortableRowProps {
    module: IAppModule
    roleMap: Record<string, string>
    permMap: Record<string, string>
    onEdit: (m: IAppModule) => void
    onDelete: (m: IAppModule) => void
}

function SortableRow({ module, roleMap, permMap, onEdit, onDelete }: SortableRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-card flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm"
        >
            {/* drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
                aria-label="Drag to reorder"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            {/* name + badges */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{module.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">{module.slug}</Badge>
                    {!module.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">{module.path}</p>
                {module.description && (
                    <p className="text-muted-foreground text-xs">{module.description}</p>
                )}
            </div>

            {/* assigned roles */}
            <div className="hidden flex-col gap-1 sm:flex">
                <div className="flex flex-wrap gap-1">
                    {module.roleIds.length ? (
                        module.roleIds.map((rid) => (
                            <Badge key={rid} variant="secondary" className="text-xs capitalize">
                                {roleMap[rid] ?? rid}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground text-xs">No roles</span>
                    )}
                </div>
                {module.permissionIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                        {module.permissionIds.map((pid) => {
                            const permName = permMap[pid]
                            const isAuto = permName?.startsWith(`${module.slug}:`)
                            return permName ? (
                                <span
                                    key={pid}
                                    className={`rounded border px-1.5 py-0.5 text-[10px] ${isAuto ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/40'}`}
                                >
                                    <PermissionName name={permName} />
                                </span>
                            ) : null
                        })}
                    </div>
                )}
            </div>

            {/* actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(module)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onDelete(module)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ModulesPage() {
    const qc = useQueryClient()
    const [editModule, setEditModule] = useState<IAppModule | null>(null)
    const [deleteModule, setDeleteModule] = useState<IAppModule | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [items, setItems] = useState<IAppModule[]>([])

    const { data: modulesData, isLoading } = useQuery({
        queryKey: ['admin-modules'],
        queryFn: () => adminModuleService.getAll(),
    })

    const { data: rolesData } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminRoleService.getAll(),
    })

    const { data: permsData } = useQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminPermissionService.getAll(),
    })

    const modules: IAppModule[] = modulesData?.data ?? []
    const roles = rolesData?.data ?? []
    const permissions = permsData?.data ?? []

    const roleMap: Record<string, string> = Object.fromEntries(roles.map((r) => [r.id, r.name]))
    const permMap: Record<string, string> = Object.fromEntries(permissions.map((p) => [p.id, p.name]))

    useEffect(() => { setItems(modules) }, [modulesData])

    const sensors = useSensors(useSensor(PointerSensor))

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
        mutationFn: (ids: string[]) => adminModuleService.reorder(ids),
        onError: (e: any) => toast.error(e.message),
    })

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setItems((prev) => {
            const oldIdx = prev.findIndex((m) => m.id === active.id)
            const newIdx = prev.findIndex((m) => m.id === over.id)
            const reordered = arrayMove(prev, oldIdx, newIdx)
            reorderMutation.mutate(reordered.map((m) => m.id))
            return reordered
        })
    }

    const handleSubmit = (values: any) => {
        if (editModule) {
            updateMutation.mutate({ id: editModule.id, data: values })
        } else {
            createMutation.mutate(values)
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
                    <p className="text-muted-foreground text-sm">
                        Manage app modules, role & permission access — {modules.length} total
                    </p>
                </div>
                <Button onClick={() => { setEditModule(null); setFormOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                </div>
            ) : items.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-muted-foreground text-sm">No modules yet. Add one to get started.</p>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {items.map((m) => (
                                <SortableRow
                                    key={m.id}
                                    module={m}
                                    roleMap={roleMap}
                                    permMap={permMap}
                                    onEdit={(mod) => { setEditModule(mod); setFormOpen(true) }}
                                    onDelete={setDeleteModule}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <ModuleFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                module={editModule}
                roles={roles}
                permissions={permissions}
                onSubmit={handleSubmit}
                isPending={isPending}
            />

            <ModuleDeleteDialog
                open={!!deleteModule}
                onOpenChange={(v) => !v && setDeleteModule(null)}
                module={deleteModule}
                onConfirm={() => deleteModule && deleteMutation.mutate(deleteModule.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
