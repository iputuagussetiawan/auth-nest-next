'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'
import DashboardPageHeader from '@/components/layouts/backend/DashboardPageHeader'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import { UiButton } from '@/components/ui-custom/UiButton'

import { PermissionDeleteDialog } from './PermissionDeleteDialog'
import { PermissionFormDialog } from './PermissionFormDialog'
import { RolePermissionMatrix } from './RolePermissionMatrix'
import { adminPermissionService } from './services/PermissionService'
import type { IPermission } from './types/PermissionTypes'

type PermissionInput = Parameters<typeof adminPermissionService.create>[0]

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
        mutationFn: (data: PermissionInput) => adminPermissionService.create(data),
        onSuccess: () => {
            toast.success('Permission created')
            invalidate()
            setFormOpen(false)
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Request failed'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: PermissionInput }) =>
            adminPermissionService.update(id, data),
        onSuccess: () => {
            toast.success('Permission updated')
            invalidate()
            setFormOpen(false)
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Request failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminPermissionService.delete(id),
        onSuccess: () => {
            toast.success('Permission deleted')
            invalidate()
            setDeletePerm(null)
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Request failed'),
    })

    const handleSubmit = (values: PermissionInput) => {
        if (editPerm) updateMutation.mutate({ id: editPerm.id, data: values })
        else createMutation.mutate(values)
    }

    const openCreate = () => {
        setEditPerm(null)
        setFormOpen(true)
    }

    return (
        <DashboardPageMain>
            <DashboardPageHeader
                title="Permissions"
                description={<>Assign permissions to roles</>}
                actions={
                    <UiButton onClick={openCreate} className="rounded-full px-5 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Permission
                    </UiButton>
                }
            />

            <DashboardPageCard className="overflow-visible">
                <RolePermissionMatrix
                    onEdit={(perm) => {
                        setEditPerm(perm)
                        setFormOpen(true)
                    }}
                    onDelete={setDeletePerm}
                />
            </DashboardPageCard>

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
        </DashboardPageMain>
    )
}
