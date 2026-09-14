'use client'

import { useState } from 'react'
import { LayoutGrid, List, MoreHorizontal, Pencil, Plus, Search, Shield, Trash2, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getRoleColumns } from './components/RoleColumns'
import { useRole } from './hooks/UseRole'
import { RoleDeleteDialog } from './RoleDeleteDialog'
import { RoleFormDialog } from './RoleFormDialog'

export function RolesPage() {
    const [view, setView] = useState<'list' | 'grid'>('grid')
    const [gridSearch, setGridSearch] = useState('')
    const [gridPage, setGridPage] = useState(1)

    const {
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
        isPending,
    } = useRole()

    const GRID_PAGE_SIZE = 12
    const filteredRoles = roles.filter((r) => {
        const q = gridSearch.trim().toLowerCase()
        if (!q) return true
        return (r.label ?? r.name).toLowerCase().includes(q)
            || r.name.toLowerCase().includes(q)
            || (r.description ?? '').toLowerCase().includes(q)
    })
    const gridPageCount = Math.max(1, Math.ceil(filteredRoles.length / GRID_PAGE_SIZE))
    const currentGridPage = Math.min(gridPage, gridPageCount)
    const paginatedRoles = filteredRoles.slice(
        (currentGridPage - 1) * GRID_PAGE_SIZE,
        currentGridPage * GRID_PAGE_SIZE,
    )
    const columns = getRoleColumns({ onEdit: openEdit, onDelete: setDeleteRole })

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/8 via-background to-background px-6 py-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-semibold tracking-tight">Roles</h2>
                        <p className="text-muted-foreground text-sm leading-6">Manage roles and access with compact cards or table view</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={view}
                            onValueChange={(v) => v && setView(v as 'list' | 'grid')}
                            className="rounded-full border border-border/60 bg-background p-1 shadow-sm"
                        >
                            <ToggleGroupItem value="grid" aria-label="Grid view" className="rounded-full">
                                <LayoutGrid className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="list" aria-label="List view" className="rounded-full">
                                <List className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <Button onClick={openCreate} className="rounded-full px-5 shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Role
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-[28px] border border-border/60 bg-background p-4 shadow-sm md:p-5">

            {view === 'grid' ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search roles…"
                                value={gridSearch}
                                onChange={(e) => { setGridSearch(e.target.value); setGridPage(1) }}
                                className="pl-9"
                            />
                        </div>
                        <p className="text-muted-foreground hidden shrink-0 text-sm sm:block">
                            {filteredRoles.length} role{filteredRoles.length === 1 ? '' : 's'}
                        </p>
                    </div>

                    {paginatedRoles.length === 0 ? (
                        <div className="text-muted-foreground flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm">
                            <span>No roles match &ldquo;{gridSearch}&rdquo;</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {paginatedRoles.map((role) => {
                                const isUrl = role.icon?.startsWith('http')
                                const permCount = role.permissions?.length ?? 0
                                return (
                                    <Card
                                        key={role.id}
                                        className="group gap-3 py-3 transition-shadow hover:shadow-md"
                                    >
                                        <CardHeader className="px-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                                                    {isUrl
                                                        ? <img src={role.icon!} alt={role.name} className="h-full w-full object-cover" />
                                                        : <span className="text-primary text-xs font-bold">{role.name[0].toUpperCase()}</span>
                                                    }
                                                </div>
                                                <div className="min-w-0">
                                                    <CardTitle className="truncate text-sm" title={role.label ?? role.name}>
                                                        {role.label ?? role.name}
                                                    </CardTitle>
                                                    <p className="text-muted-foreground truncate text-[11px]">{role.name}</p>
                                                </div>
                                            </div>
                                            <CardAction className="flex opacity-0 transition-opacity group-hover:opacity-100">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEdit(role)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteRole(role)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardAction>
                                        </CardHeader>
                                        <CardContent className="px-3">
                                            <p className="text-muted-foreground line-clamp-2 min-h-[2.5em] text-xs">
                                                {role.description ?? 'No description'}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                <Badge variant="secondary" className="gap-1 text-[10px]">
                                                    <Shield className="h-3 w-3" />
                                                    {permCount} permission{permCount === 1 ? '' : 's'}
                                                </Badge>
                                                <Badge variant="outline" className="gap-1 text-[10px]">
                                                    <Users className="h-3 w-3" />
                                                    {role.userCount} user{role.userCount === 1 ? '' : 's'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <p className="text-muted-foreground text-sm sm:hidden">
                            {filteredRoles.length} role{filteredRoles.length === 1 ? '' : 's'}
                        </p>
                        {gridPageCount > 1 && (
                            <div className="ml-auto flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setGridPage((p) => Math.max(1, p - 1))}
                                    disabled={currentGridPage <= 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-muted-foreground text-sm">
                                    Page {currentGridPage} of {gridPageCount}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setGridPage((p) => Math.min(gridPageCount, p + 1))}
                                    disabled={currentGridPage >= gridPageCount}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <DataTable columns={columns} data={roles} searchPlaceholder="Search roles…" />
            )}

            </div>

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
                onOpenChange={(v: boolean) => !v && setDeleteRole(null)}
                role={deleteRole}
                onConfirm={() => deleteRole && deleteMutation.mutate(deleteRole.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
