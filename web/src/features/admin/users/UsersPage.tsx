'use client'

import { useMemo, useState } from 'react'
import { BadgeCheck, Layers, Plus, Search, ShieldCheck, UserCheck, Users } from 'lucide-react'

import { StatCard } from '@/features/admin/dashboard/components/StatCard'
import { UiButton } from '@/components/ui-custom/UiButton'
import { UiDataTable } from '@/components/ui-custom/UiTable'
import { UiInput } from '@/components/ui-custom/UiInput'
import DashboardPageMain from '@/components/layouts/backend/DashboardPageMain'
import DashboardPageHeader from '@/components/layouts/backend/DashboardPageHeader'
import DashboardPageCard from '@/components/layouts/backend/DashboardPageCard'

import { getUserColumns } from './components/UserColumns'
import { UsersGroupedTable } from './components/UsersGroupedTable'
import { ALL, defaultFilters, UsersToolbar, type Filters } from './components/UsersToolbar'
import { useUser } from './hooks/UseUser'
import { UserDeleteDialog } from './components/UserDeleteDialog'
import { UserFormDialog } from './components/UserFormDialog'

export function UsersPage() {
    const [filters, setFilters] = useState<Filters>(defaultFilters)
    const [view, setView] = useState<'flat' | 'grouped'>('flat')
    const [tableSearch, setTableSearch] = useState('')

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

    const providers = useMemo(() => [...new Set(users.map((u) => u.provider).filter(Boolean))], [users])
    const isFiltered = filters.role.length > 0 || filters.provider !== ALL || filters.status !== ALL || filters.verified !== ALL
    const filtered = useMemo(() => users.filter((u) => {
        if (filters.role.length > 0) {
            const hasNoRole = filters.role.includes('none') && u.role == null
            const hasSelectedRole = u.role != null && filters.role.includes(u.role)
            if (!hasNoRole && !hasSelectedRole) return false
        }
        if (filters.provider !== ALL && u.provider !== filters.provider) return false
        if (filters.status !== ALL && u.isActive !== (filters.status === 'active')) return false
        if (filters.verified !== ALL && u.isEmailVerified !== (filters.verified === 'verified')) return false
        return true
    }), [users, filters])
    const searchedUsers = useMemo(() => {
        const query = tableSearch.trim().toLowerCase()
        if (!query) return filtered
        return filtered.filter((user) => `${user.firstName ?? ''} ${user.lastName ?? ''} ${user.email}`.toLowerCase().includes(query))
    }, [filtered, tableSearch])

    const summary = useMemo(() => ({
        total: users.length,
        active: users.filter((u) => u.isActive).length,
        verified: users.filter((u) => u.isEmailVerified).length,
        withRole: users.filter((u) => u.role).length,
    }), [users])

    const openEdit = (u: typeof users[number]) => { setEditUser(u); setFormOpen(true) }
    const columns = getUserColumns({ onEdit: openEdit, onDelete: setDeleteUser })

    return (
        <DashboardPageMain>
            <DashboardPageHeader
                title="Users"
                description={<>Manage all registered users — {users.length} total</>}
                actions={
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                        <UiButton
                            variant={view === 'flat' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-full px-3 text-xs"
                            onClick={() => setView('flat')}
                        >
                            All
                        </UiButton>
                        <UiButton
                            variant={view === 'grouped' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-full px-3 text-xs"
                            onClick={() => setView('grouped')}
                        >
                            <Layers className="mr-1.5 h-3.5 w-3.5" /> By Role
                        </UiButton>
                        </div>
                        <UiButton disabled className="rounded-full px-5 shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add User
                        </UiButton>
                    </div>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Total Users" value={summary.total} icon={Users} description="registered accounts" />
                    <StatCard title="Active Users" value={summary.active} icon={UserCheck} description="currently enabled" />
                    <StatCard title="Verified Users" value={summary.verified} icon={BadgeCheck} description="email verified" />
                    <StatCard title="Assigned Roles" value={summary.withRole} icon={ShieldCheck} description="users with roles" />
                </div>
            </DashboardPageHeader>

            <DashboardPageCard className="overflow-visible">
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="relative min-w-0 flex-1 lg:max-w-md">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <UiInput
                                placeholder="Search by name or email…"
                                value={tableSearch}
                                onChange={(event) => setTableSearch(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <span className="text-muted-foreground shrink-0 text-sm">{searchedUsers.length} of {users.length} users</span>
                    </div>
                    <UsersToolbar
                        className="justify-end lg:flex-nowrap"
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
                        showViewToggle={false}
                    />
                </div>

                <div className="mt-4">
                    {view === 'flat' ? (
                        <div className="rounded-[24px] bg-card">
                            <UiDataTable columns={columns} data={searchedUsers} hideSearch totalCount={users.length} />
                        </div>
                    ) : (
                        <UsersGroupedTable users={searchedUsers} onEdit={openEdit} onDelete={setDeleteUser} />
                    )}
                </div>
            </DashboardPageCard>

            <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editUser} roles={roles} onSubmit={handleFormSubmit} isPending={isPending} />
            <UserDeleteDialog
                open={!!deleteUser}
                onOpenChange={(v) => !v && setDeleteUser(null)}
                user={deleteUser}
                onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
                isPending={deleteMutation.isPending}
            />
        </DashboardPageMain>
    )
}
