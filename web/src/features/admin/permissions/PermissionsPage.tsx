'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { adminPermissionService } from './services/PermissionService'
import type { IPermission } from './types/PermissionTypes'
import { PermissionDeleteDialog } from './PermissionDeleteDialog'
import { PermissionFormDialog } from './PermissionFormDialog'
import { RolePermissionMatrix } from './RolePermissionMatrix'

export function PermissionsPage() {
    const qc = useQueryClient()
    const [editPerm, setEditPerm] = useState<IPermission | null>(null)
    const [deletePerm, setDeletePerm] = useState<IPermission | null>(null)
    const [formOpen, setFormOpen] = useState(false)

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ['admin-permissions'] })
        qc.invalidateQueries({ queryKey: ['admin-roles-with-permissions'] })
    }

    const createMutation = useMutation({
        mutationFn: (data: any) => adminPermissionService.create(data),
        onSuccess: () => {
            toast.success('Permission created')
            invalidate()
            setFormOpen(false)
        },
        onError: (e: any) => toast.error(e.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminPermissionService.update(id, data),
        onSuccess: () => {
            toast.success('Permission updated')
            invalidate()
            setFormOpen(false)
        },
        onError: (e: any) => toast.error(e.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminPermissionService.delete(id),
        onSuccess: () => {
            toast.success('Permission deleted')
            invalidate()
            setDeletePerm(null)
        },
        onError: (e: any) => toast.error(e.message),
    })

    const handleSubmit = (values: any) => {
        if (editPerm) {
            updateMutation.mutate({ id: editPerm.id, data: values })
        } else {
            createMutation.mutate(values)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/8 via-background to-background px-6 py-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight">Permissions</h2>
                        <p className="text-muted-foreground text-sm leading-6">Assign permissions to roles</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditPerm(null)
                            setFormOpen(true)
                        }}
                        className="rounded-full px-5 shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Permission
                    </Button>
                </div>
            </div>

            <div className="rounded-[28px] border border-border/60 bg-background p-4 shadow-sm md:p-5">
                <RolePermissionMatrix
                    onEdit={(perm) => {
                        setEditPerm(perm)
                        setFormOpen(true)
                    }}
                    onDelete={(perm) => setDeletePerm(perm)}
                />
            </div>

            <PermissionFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                permission={editPerm}
                onSubmit={handleSubmit}
                isPending={createMutation.isPending || updateMutation.isPending}
            />

            <PermissionDeleteDialog
                open={!!deletePerm}
                onOpenChange={(v) => !v && setDeletePerm(null)}
                permission={deletePerm}
                onConfirm={() => deletePerm && deleteMutation.mutate(deletePerm.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
