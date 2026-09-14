'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { adminRoleService } from '../../roles/services/RoleService'
import { adminUserService } from '../services/UserService'
import type { IAdminUser } from '../types/UserTypes'

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Request failed'
}

export function useUser() {
    const qc = useQueryClient()
    const [editUser, setEditUser] = useState<IAdminUser | null>(null)
    const [deleteUser, setDeleteUser] = useState<IAdminUser | null>(null)
    const [formOpen, setFormOpen] = useState(false)

    const { data: usersData } = useSuspenseQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminUserService.getAll(),
    })
    const { data: rolesData } = useSuspenseQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminRoleService.getAll(),
    })

    const users: IAdminUser[] = usersData?.data?.data ?? []
    const roles = rolesData?.data ?? []

    const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'] })

    const createMutation = useMutation({
        mutationFn: (data: any) => adminUserService.create(data),
        onSuccess: () => { toast.success('User created'); invalidate(); setFormOpen(false) },
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminUserService.update(id, data),
        onSuccess: () => { toast.success('User updated'); invalidate(); setFormOpen(false) },
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminUserService.delete(id),
        onSuccess: () => { toast.success('User deleted'); invalidate(); setDeleteUser(null) },
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })
    const assignRoleMutation = useMutation({
        mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
            adminUserService.assignRole(userId, roleId),
        onSuccess: () => invalidate(),
    })

    const handleFormSubmit = async (values: any) => {
        const { roleId, email, password, ...rest } = values
        if (editUser) {
            updateMutation.mutate({ id: editUser.id, data: rest })
            if (roleId) assignRoleMutation.mutate({ userId: editUser.id, roleId })
        } else {
            createMutation.mutate({ email, password, roleId: roleId || undefined, ...rest })
        }
    }

    return {
        users,
        roles,
        editUser,
        setEditUser,
        deleteUser,
        setDeleteUser,
        formOpen,
        setFormOpen,
        handleFormSubmit,
        deleteMutation,
        isPending: createMutation.isPending || updateMutation.isPending,
    }
}
