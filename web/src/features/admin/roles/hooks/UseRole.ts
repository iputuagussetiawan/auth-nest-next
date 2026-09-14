'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { adminPermissionService } from '../../permissions/services/PermissionService'
import { adminRoleService } from '../services/RoleService'
import type { IRole, IRoleWithPermissions } from '../types/RoleTypes'

interface RolePayload {
    name: string
    label?: string
    description?: string
}

interface RoleFormValues extends RolePayload {
    permissionIds: string[]
}

interface CreateRoleResponse {
    data?: {
        id?: string
    }
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Request failed'
}

export function useRole() {
    const qc = useQueryClient()
    const [editRole, setEditRole] = useState<IRole | null>(null)
    const [deleteRole, setDeleteRole] = useState<IRole | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [selectedPerms, setSelectedPerms] = useState<string[]>([])

    const { data: rolesData } = useSuspenseQuery({
        queryKey: ['admin-roles-with-permissions'],
        queryFn: () => adminRoleService.getAllWithPermissions(),
    })

    const { data: permsData } = useSuspenseQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminPermissionService.getAll(),
    })

    const roles = (rolesData?.data ?? []) as IRoleWithPermissions[]
    const allPermissions = permsData?.data ?? []

    const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-roles-with-permissions'] })

    const openEdit = (role: IRoleWithPermissions) => {
        setEditRole(role)
        setSelectedPerms(role.permissions.map((p) => p.id))
        setFormOpen(true)
    }

    const openCreate = () => {
        setEditRole(null)
        setSelectedPerms([])
        setFormOpen(true)
    }

    const createMutation = useMutation({
        mutationFn: (data: RolePayload) => adminRoleService.create(data),
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: RolePayload }) => adminRoleService.update(id, data),
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminRoleService.delete(id),
        onSuccess: () => {
            toast.success('Role deleted')
            invalidate()
            setDeleteRole(null)
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })

    const assignMutation = useMutation({
        mutationFn: ({ id, ids }: { id: string; ids: string[] }) =>
            adminRoleService.assignPermissions(id, ids),
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            adminRoleService.uploadImage(id, file),
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })

    const handleSubmit = async (values: RoleFormValues, imageFile: File | null) => {
        const { permissionIds, ...rest } = values
        try {
            if (editRole) {
                await updateMutation.mutateAsync({ id: editRole.id, data: rest })
                await assignMutation.mutateAsync({ id: editRole.id, ids: permissionIds })
                if (imageFile) {
                    await uploadImageMutation.mutateAsync({ id: editRole.id, file: imageFile })
                }
            } else {
                const res: CreateRoleResponse = await createMutation.mutateAsync(rest)
                const newId = res?.data?.id
                if (newId) {
                    if (permissionIds.length) {
                        await assignMutation.mutateAsync({ id: newId, ids: permissionIds })
                    }
                    if (imageFile) {
                        await uploadImageMutation.mutateAsync({ id: newId, file: imageFile })
                    }
                }
            }
            toast.success(editRole ? 'Role updated' : 'Role created')
            invalidate()
            setFormOpen(false)
        } catch {
            // errors handled per-mutation
        }
    }

    return {
        roles,
        allPermissions,
        editRole,
        deleteRole,
        setDeleteRole,
        formOpen,
        setFormOpen,
        selectedPerms,
        openEdit,
        openCreate,
        handleSubmit,
        deleteMutation,
        isPending: createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending,
    }
}
