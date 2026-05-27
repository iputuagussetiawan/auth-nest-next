'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { LayoutList, Layers, MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { UserAvatar } from '@/components/user-avatar'
import { adminRoleService } from '../services/admin-role-service'
import { adminUserService } from '../services/admin-user-service'
import type { IAdminUser } from '../types/admin-types'
import { UserDeleteDialog } from './user-delete-dialog'
import { UserFormDialog } from './user-form-dialog'

const ALL = 'all'

// role → border-left color class
const ROLE_COLORS: Record<string, string> = {
    admin:     'border-l-violet-500',
    company:   'border-l-blue-500',
    jobseeker: 'border-l-emerald-500',
    user:      'border-l-orange-400',
}
const ROLE_BG: Record<string, string> = {
    admin:     'bg-violet-50 dark:bg-violet-950/30',
    company:   'bg-blue-50 dark:bg-blue-950/30',
    jobseeker: 'bg-emerald-50 dark:bg-emerald-950/30',
    user:      'bg-orange-50 dark:bg-orange-950/30',
}

interface Filters {
    role: string
    provider: string
    status: string
    verified: string
}
const defaultFilters: Filters = { role: ALL, provider: ALL, status: ALL, verified: ALL }

export function UsersPage() {
    const qc = useQueryClient()
    const [editUser, setEditUser] = useState<IAdminUser | null>(null)
    const [deleteUser, setDeleteUser] = useState<IAdminUser | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [filters, setFilters] = useState<Filters>(defaultFilters)
    const [view, setView] = useState<'flat' | 'grouped'>('flat')

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminUserService.getAll(),
    })
    const { data: rolesData } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminRoleService.getAll(),
    })

    const users: IAdminUser[] = usersData?.data?.data ?? []
    const roles = rolesData?.data ?? []

    const providers = useMemo(
        () => [...new Set(users.map((u) => u.provider).filter(Boolean))],
        [users],
    )

    const isFiltered = Object.values(filters).some((v) => v !== ALL)

    const filtered = useMemo(() => users.filter((u) => {
        if (filters.role !== ALL) {
            if (filters.role === 'none' && u.role != null) return false
            if (filters.role !== 'none' && u.role !== filters.role) return false
        }
        if (filters.provider !== ALL && u.provider !== filters.provider) return false
        if (filters.status !== ALL && u.isActive !== (filters.status === 'active')) return false
        if (filters.verified !== ALL && u.isEmailVerified !== (filters.verified === 'verified')) return false
        return true
    }), [users, filters])

    // grouped: sort role names alphabetically, no-role last
    const grouped = useMemo(() => {
        const map = new Map<string, IAdminUser[]>()
        for (const u of filtered) {
            const key = u.role ?? '— No role'
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(u)
        }
        return [...map.entries()].sort(([a], [b]) => {
            if (a === '— No role') return 1
            if (b === '— No role') return -1
            return a.localeCompare(b)
        })
    }, [filtered])

    const set = (key: keyof Filters) => (val: string) =>
        setFilters((prev) => ({ ...prev, [key]: val }))

    const createMutation = useMutation({
        mutationFn: (data: any) => adminUserService.create(data),
        onSuccess: () => { toast.success('User created'); qc.invalidateQueries({ queryKey: ['admin-users'] }); setFormOpen(false) },
        onError: (e: any) => toast.error(e.message),
    })
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminUserService.update(id, data),
        onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }); setFormOpen(false) },
        onError: (e: any) => toast.error(e.message),
    })
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminUserService.delete(id),
        onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['admin-users'] }); setDeleteUser(null) },
        onError: (e: any) => toast.error(e.message),
    })
    const assignRoleMutation = useMutation({
        mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
            adminUserService.assignRole(userId, roleId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
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

    const actionCell = (u: IAdminUser) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setEditUser(u); setFormOpen(true) }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setDeleteUser(u)}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    // flat DataTable columns
    const columns: ColumnDef<IAdminUser>[] = [
        {
            accessorFn: (r) => `${r.firstName ?? ''} ${r.lastName ?? ''} ${r.email}`.trim(),
            header: 'Name',
            cell: ({ row }) => {
                const u = row.original
                const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || undefined
                return (
                    <div className="flex items-center gap-2.5">
                        <UserAvatar name={name} image={u.profilePicture} className="h-8 w-8 shrink-0" />
                        <div className="min-w-0">
                            <p className="truncate font-medium">{name || '—'}</p>
                            <p className="text-muted-foreground truncate text-xs">{u.email}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'role',
            header: 'Role',
            meta: { className: 'hidden sm:table-cell' },
            cell: ({ getValue }) => {
                const v = getValue<string | null>()
                return v ? <Badge variant="secondary">{v}</Badge>
                    : <span className="text-muted-foreground text-xs">—</span>
            },
        },
        {
            accessorKey: 'provider',
            header: 'Provider',
            meta: { className: 'hidden md:table-cell' },
            cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
        },
        {
            accessorKey: 'isEmailVerified',
            header: 'Verified',
            meta: { className: 'hidden md:table-cell' },
            cell: ({ getValue }) => getValue<boolean>()
                ? <Badge variant="default">Yes</Badge>
                : <Badge variant="outline">No</Badge>,
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ getValue }) => getValue<boolean>()
                ? <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                : <Badge variant="destructive">Inactive</Badge>,
        },
        {
            accessorKey: 'createdAt',
            header: 'Joined',
            meta: { className: 'hidden lg:table-cell' },
            cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => actionCell(row.original),
        },
    ]

    const COLS = ['Name', 'Provider', 'Verified', 'Status', 'Joined', '']

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground text-sm">
                        Manage all registered users — {users.length} total
                    </p>
                </div>
                <Button disabled>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-start gap-3">
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
                        <Layers className="mr-1.5 h-4 w-4" /> By Role
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                    <Select value={filters.role} onValueChange={set('role')}>
                        <SelectTrigger className="w-full sm:w-34">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All roles</SelectItem>
                            {roles.map((r) => (
                                <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                            ))}
                            <SelectItem value="none">No role</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.provider} onValueChange={set('provider')}>
                        <SelectTrigger className="w-full sm:w-34">
                            <SelectValue placeholder="Provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All providers</SelectItem>
                            {providers.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.status} onValueChange={set('status')}>
                        <SelectTrigger className="w-full sm:w-34">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.verified} onValueChange={set('verified')}>
                        <SelectTrigger className="w-full sm:w-34">
                            <SelectValue placeholder="Verified" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                        </SelectContent>
                    </Select>

                    {isFiltered && (
                        <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilters(defaultFilters)}
                                className="text-muted-foreground gap-1"
                            >
                                <X className="h-3.5 w-3.5" /> Clear
                            </Button>
                            <span className="text-muted-foreground text-sm">
                                {filtered.length} of {users.length}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                </div>
            ) : view === 'flat' ? (
                <DataTable columns={columns} data={filtered} searchPlaceholder="Search by name or email…" />
            ) : (
                /* ── Grouped by role view ── */
                <div className="space-y-0 overflow-x-auto rounded-lg border">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">Name</TableHead>
                                <TableHead className="hidden whitespace-nowrap sm:table-cell">Provider</TableHead>
                                <TableHead className="hidden whitespace-nowrap md:table-cell">Verified</TableHead>
                                <TableHead className="whitespace-nowrap">Status</TableHead>
                                <TableHead className="hidden whitespace-nowrap lg:table-cell">Joined</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grouped.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground h-24 text-center">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {grouped.map(([roleName, groupUsers], groupIdx) => {
                                const colorBorder = ROLE_COLORS[roleName] ?? 'border-l-gray-400'
                                const colorBg    = ROLE_BG[roleName]    ?? 'bg-gray-50 dark:bg-gray-900/30'
                                const isLast = groupIdx === grouped.length - 1
                                return (
                                    <>
                                        {/* Group separator — 5px top border for every group except first */}
                                        {groupIdx > 0 && (
                                            <TableRow key={`sep-${roleName}`} className="h-0 p-0">
                                                <TableCell
                                                    colSpan={6}
                                                    className="border-primary/30 h-0 border-t-[5px] p-0"
                                                />
                                            </TableRow>
                                        )}

                                        {/* Role header row */}
                                        <TableRow
                                            key={`header-${roleName}`}
                                            className={`${colorBg} border-l-[5px] ${colorBorder}`}
                                        >
                                            <TableCell colSpan={6} className="py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold capitalize">{roleName}</span>
                                                    <Badge variant="outline" className="font-normal">
                                                        {groupUsers.length} user{groupUsers.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* User rows */}
                                        {groupUsers.map((u) => {
                                            const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || undefined
                                            return (
                                                <TableRow
                                                    key={u.id}
                                                    className={`border-l-[5px] ${colorBorder}`}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <UserAvatar name={name} image={u.profilePicture} className="h-8 w-8 shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium">{name || '—'}</p>
                                                                <p className="text-muted-foreground truncate text-xs">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <Badge variant="outline">{u.provider}</Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {u.isEmailVerified
                                                            ? <Badge variant="default">Yes</Badge>
                                                            : <Badge variant="outline">No</Badge>}
                                                    </TableCell>
                                                    <TableCell>
                                                        {u.isActive
                                                            ? <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                                                            : <Badge variant="destructive">Inactive</Badge>}
                                                    </TableCell>
                                                    <TableCell className="hidden text-sm lg:table-cell">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>{actionCell(u)}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            <UserFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                user={editUser}
                roles={roles}
                onSubmit={handleFormSubmit}
                isPending={createMutation.isPending || updateMutation.isPending}
            />

            <UserDeleteDialog
                open={!!deleteUser}
                onOpenChange={(v) => !v && setDeleteUser(null)}
                user={deleteUser}
                onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
