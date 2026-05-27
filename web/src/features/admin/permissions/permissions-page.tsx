'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { LayoutList, MoreHorizontal, Pencil, Plus, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { adminPermissionService } from '../services/admin-permission-service'
import { adminRoleService } from '../services/admin-role-service'
import type { IPermission, IRoleWithPermissions } from '../types/admin-types'
import { PermissionDeleteDialog } from './permission-delete-dialog'
import { PermissionFormDialog } from './permission-form-dialog'
import { PermissionName } from './permission-name'

type View = 'flat' | 'grouped'

export function PermissionsPage() {
    const qc = useQueryClient()
    const [editPerm, setEditPerm] = useState<IPermission | null>(null)
    const [deletePerm, setDeletePerm] = useState<IPermission | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [view, setView] = useState<View>('flat')
    const [roleFilter, setRoleFilter] = useState<string>('all')

    const { data: permsData, isLoading: permsLoading } = useQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminPermissionService.getAll(),
    })

    const { data: rolesWithPermsData, isLoading: rolesLoading } = useQuery({
        queryKey: ['admin-roles-with-permissions'],
        queryFn: () => adminRoleService.getAllWithPermissions(),
    })

    const allPermissions = permsData?.data ?? []
    const rolesWithPerms: IRoleWithPermissions[] = rolesWithPermsData?.data ?? []

    // IDs in selected role's permission set (for flat view filter)
    const filteredPermissions = roleFilter === 'all'
        ? allPermissions
        : allPermissions.filter((p) => {
            const role = rolesWithPerms.find((r) => r.id === roleFilter)
            return role?.permissions.some((rp) => rp.id === p.id) ?? false
        })

    const createMutation = useMutation({
        mutationFn: (data: any) => adminPermissionService.create(data),
        onSuccess: () => {
            toast.success('Permission created')
            qc.invalidateQueries({ queryKey: ['admin-permissions'] })
            qc.invalidateQueries({ queryKey: ['admin-roles-with-permissions'] })
            setFormOpen(false)
        },
        onError: (e: any) => toast.error(e.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminPermissionService.update(id, data),
        onSuccess: () => {
            toast.success('Permission updated')
            qc.invalidateQueries({ queryKey: ['admin-permissions'] })
            qc.invalidateQueries({ queryKey: ['admin-roles-with-permissions'] })
            setFormOpen(false)
        },
        onError: (e: any) => toast.error(e.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminPermissionService.delete(id),
        onSuccess: () => {
            toast.success('Permission deleted')
            qc.invalidateQueries({ queryKey: ['admin-permissions'] })
            qc.invalidateQueries({ queryKey: ['admin-roles-with-permissions'] })
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

    const actionCell = (perm: IPermission) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setEditPerm(perm); setFormOpen(true) }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setDeletePerm(perm)}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    const columns: ColumnDef<IPermission>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ getValue }) => <PermissionName name={getValue<string>()} />,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            meta: { className: 'hidden sm:table-cell' },
            cell: ({ getValue }) => getValue<string | null>() ?? (
                <span className="text-muted-foreground">—</span>
            ),
        },
        {
            id: 'roles',
            header: 'Assigned to Roles',
            meta: { className: 'hidden md:table-cell' },
            cell: ({ row }) => {
                const assigned = rolesWithPerms.filter((r) =>
                    r.permissions.some((p) => p.id === row.original.id)
                )
                return assigned.length ? (
                    <div className="flex flex-wrap gap-1">
                        {assigned.map((r) => (
                            <Badge key={r.id} variant="secondary" className="text-xs">{r.name}</Badge>
                        ))}
                    </div>
                ) : <span className="text-muted-foreground text-xs">—</span>
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            meta: { className: 'hidden lg:table-cell' },
            cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => actionCell(row.original),
        },
    ]

    const isLoading = permsLoading || rolesLoading

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Permissions</h2>
                    <p className="text-muted-foreground text-sm">
                        Manage granular permissions — {allPermissions.length} total
                    </p>
                </div>
                <Button onClick={() => { setEditPerm(null); setFormOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Permission
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* View toggle */}
                <div className="flex rounded-md border">
                    <Button
                        variant={view === 'flat' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-r-none"
                        onClick={() => setView('flat')}
                    >
                        <LayoutList className="mr-1.5 h-4 w-4" /> All
                    </Button>
                    <Button
                        variant={view === 'grouped' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-l-none"
                        onClick={() => setView('grouped')}
                    >
                        <Shield className="mr-1.5 h-4 w-4" /> By Role
                    </Button>
                </div>

                {/* Role filter — only in flat view */}
                {view === 'flat' && (
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            {rolesWithPerms.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                    {r.name}
                                    <span className="text-muted-foreground ml-1.5 text-xs">
                                        ({r.permissions.length})
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                </div>
            ) : view === 'flat' ? (
                /* Flat table view */
                <DataTable
                    columns={columns}
                    data={filteredPermissions}
                    searchPlaceholder="Search permissions…"
                />
            ) : (
                /* Grouped by role view */
                <div className="grid gap-4 md:grid-cols-2">
                    {rolesWithPerms.length === 0 ? (
                        <p className="text-muted-foreground col-span-2 py-10 text-center text-sm">
                            No roles found.
                        </p>
                    ) : (
                        rolesWithPerms.map((role) => (
                            <Card key={role.id}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-base">
                                        <span className="flex items-center gap-2">
                                            <Shield className="text-primary h-4 w-4" />
                                            {role.name}
                                        </span>
                                        <Badge variant="outline" className="font-normal">
                                            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                                        </Badge>
                                    </CardTitle>
                                    {role.description && (
                                        <p className="text-muted-foreground text-xs">{role.description}</p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {role.permissions.length === 0 ? (
                                        <p className="text-muted-foreground text-xs">No permissions assigned.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {role.permissions.map((p) => (
                                                <div key={p.id} className="rounded-md border bg-muted/40 px-2 py-1">
                                                    <PermissionName name={p.name} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

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
