'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminPermissionService } from '../services/admin-permission-service'
import { adminRoleService } from '../services/admin-role-service'
import type { IRole } from '../types/admin-types'
import { RoleDeleteDialog } from './role-delete-dialog'
import { RoleFormDialog } from './role-form-dialog'

export function RolesPage() {
    const qc = useQueryClient()
    const [editRole, setEditRole] = useState<IRole | null>(null)
    const [deleteRole, setDeleteRole] = useState<IRole | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [selectedPerms, setSelectedPerms] = useState<string[]>([])

    const { data: rolesData, isLoading } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminRoleService.getAll(),
    })

    const { data: permsData } = useQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminPermissionService.getAll(),
    })

    const roles = rolesData?.data ?? []
    const allPermissions = permsData?.data ?? []

    const openEdit = async (role: IRole) => {
        setEditRole(role)
        try {
            const res = await adminRoleService.getPermissions(role.id)
            setSelectedPerms((res.data as any[]).map((p: any) => p.id))
        } catch {
            setSelectedPerms([])
        }
        setFormOpen(true)
    }

    const openCreate = () => {
        setEditRole(null)
        setSelectedPerms([])
        setFormOpen(true)
    }

    const createMutation = useMutation({
        mutationFn: (data: any) => adminRoleService.create(data),
        onError: (e: any) => toast.error(e.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminRoleService.update(id, data),
        onError: (e: any) => toast.error(e.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminRoleService.delete(id),
        onSuccess: () => { toast.success('Role deleted'); qc.invalidateQueries({ queryKey: ['admin-roles'] }); setDeleteRole(null) },
        onError: (e: any) => toast.error(e.message),
    })

    const assignMutation = useMutation({
        mutationFn: ({ id, ids }: { id: string; ids: string[] }) =>
            adminRoleService.assignPermissions(id, ids),
        onError: (e: any) => toast.error(e.message),
    })

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            adminRoleService.uploadImage(id, file),
        onError: (e: any) => toast.error(e.message),
    })

    const handleSubmit = async (values: any, imageFile: File | null) => {
        const { permissionIds, ...rest } = values
        try {
            if (editRole) {
                await updateMutation.mutateAsync({ id: editRole.id, data: rest })
                await assignMutation.mutateAsync({ id: editRole.id, ids: permissionIds })
                if (imageFile) {
                    await uploadImageMutation.mutateAsync({ id: editRole.id, file: imageFile })
                }
            } else {
                const res = await createMutation.mutateAsync(rest)
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
            qc.invalidateQueries({ queryKey: ['admin-roles'] })
            setFormOpen(false)
        } catch {
            // errors handled per-mutation
        }
    }

    const columns: ColumnDef<IRole>[] = [
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Role',
            cell: ({ row }) => {
                const { icon, name } = row.original
                const isUrl = icon?.startsWith('http')
                return (
                    <div className="flex items-center gap-2.5">
                        <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                            {isUrl
                                ? <img src={icon!} alt={name} className="h-full w-full object-cover" />
                                : <span className="text-primary text-sm font-bold">{name[0].toUpperCase()}</span>
                            }
                        </div>
                        <span className="font-medium">{name}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            meta: { className: 'hidden sm:table-cell' },
            cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted-foreground">—</span>,
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            meta: { className: 'hidden md:table-cell' },
            cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setDeleteRole(row.original)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const isPending = createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
                    <p className="text-muted-foreground text-sm">Manage roles and their permissions</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Role
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                </div>
            ) : (
                <DataTable columns={columns} data={roles} searchPlaceholder="Search roles…" />
            )}

            <RoleFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                role={editRole}
                allPermissions={allPermissions}
                selectedPermissions={selectedPerms}
                onSubmit={handleSubmit}
                isPending={isPending}
            />

            <RoleDeleteDialog
                open={!!deleteRole}
                onOpenChange={(v) => !v && setDeleteRole(null)}
                role={deleteRole}
                onConfirm={() => deleteRole && deleteMutation.mutate(deleteRole.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
