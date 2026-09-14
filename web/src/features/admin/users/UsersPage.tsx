'use client'

import { useMemo, useState } from 'react'
import { BadgeCheck, Plus, ShieldCheck, UserCheck, Users } from 'lucide-react'

import { StatCard } from '@/features/admin/dashboard/components/StatCard'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { getUserColumns } from './components/UserColumns'
import { UsersGroupedTable } from './components/UsersGroupedTable'
import { ALL, defaultFilters, UsersToolbar, type Filters } from './components/UsersToolbar'
import { useUser } from './hooks/UseUser'
import { UserDeleteDialog } from './components/UserDeleteDialog'
import { UserFormDialog } from './components/UserFormDialog'

export function UsersPage() {
    const [filters, setFilters] = useState<Filters>(defaultFilters)
    const [view, setView] = useState<'flat' | 'grouped'>('flat')

    const {
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
        isPending,
    } = useUser()

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

    const summary = useMemo(() => ({
        total: users.length,
        active: users.filter((u) => u.isActive).length,
        verified: users.filter((u) => u.isEmailVerified).length,
        withRole: users.filter((u) => u.role).length,
    }), [users])

    const openEdit = (u: typeof users[number]) => { setEditUser(u); setFormOpen(true) }
    const columns = getUserColumns({ onEdit: openEdit, onDelete: setDeleteUser })

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/8 via-background to-background px-6 py-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-semibold tracking-tight">Users</h2>
                        <p className="text-muted-foreground text-sm leading-6">
                            Manage all registered users — {users.length} total
                        </p>
                    </div>
                    <Button disabled className="rounded-full px-5 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Users" value={summary.total} icon={Users} description="registered accounts" />
                <StatCard title="Active Users" value={summary.active} icon={UserCheck} description="currently enabled" />
                <StatCard title="Verified Users" value={summary.verified} icon={BadgeCheck} description="email verified" />
                <StatCard title="Assigned Roles" value={summary.withRole} icon={ShieldCheck} description="users with roles" />
            </div>

            <div className="rounded-[28px] bg-white p-4 md:p-5">
                <UsersToolbar
                    view={view}
                    onViewChange={setView}
                    filters={filters}
                    onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
                    roles={roles}
                    providers={providers}
                    isFiltered={isFiltered}
                    filteredCount={filtered.length}
                    totalCount={users.length}
                    onClear={() => setFilters(defaultFilters)}
                />

                <div className="mt-4">
                    {view === 'flat' ? (
                        <div className="rounded-[24px] bg-white">
                            <DataTable columns={columns} data={filtered} searchPlaceholder="Search by name or email…" />
                        </div>
                    ) : (
                        <UsersGroupedTable users={filtered} onEdit={openEdit} onDelete={setDeleteUser} />
                    )}
                </div>
            </div>

            <UserFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                user={editUser}
                roles={roles}
                onSubmit={handleFormSubmit}
                isPending={isPending}
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
