import { Layers, LayoutList, X } from 'lucide-react'

import { UiButton } from '@/components/ui-custom/UiButton'
import { UiFormSearchSelect } from '@/components/ui-custom/UiFormSearchSelect'

import type { IRole } from '../../roles/types/RoleTypes'

export const ALL = 'all'

export interface Filters {
    role: string[]
    provider: string
    status: string
    verified: string
}

export const defaultFilters: Filters = { role: [], provider: ALL, status: ALL, verified: ALL }

interface UsersToolbarProps {
    view: 'flat' | 'grouped'
    onViewChange: (view: 'flat' | 'grouped') => void
    filters: Filters
    onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void
    roles: IRole[]
    providers: string[]
    isFiltered: boolean
    filteredCount: number
    totalCount: number
    onClear: () => void
    showViewToggle?: boolean
    className?: string
}

export function UsersToolbar({
    view,
    onViewChange,
    filters,
    onFilterChange,
    roles,
    providers,
    isFiltered,
    filteredCount,
    totalCount,
    onClear,
    showViewToggle = true,
    className,
}: UsersToolbarProps) {
    return (
        <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
            {showViewToggle && (
                <div className="bg-muted flex gap-1 rounded-full p-1">
                    <UiButton
                        variant={view === 'flat' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-full px-3 text-xs"
                        onClick={() => onViewChange('flat')}
                    >
                        <LayoutList className="mr-1.5 h-3.5 w-3.5" /> All
                    </UiButton>
                    <UiButton
                        variant={view === 'grouped' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-full px-3 text-xs"
                        onClick={() => onViewChange('grouped')}
                    >
                        <Layers className="mr-1.5 h-3.5 w-3.5" /> By Role
                    </UiButton>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 lg:flex-nowrap">
                <UiFormSearchSelect
                    multiple
                    value={filters.role}
                    onChange={(value) => onFilterChange('role', value)}
                    options={[
                        { value: 'none', label: 'No role' },
                        ...roles.map((role) => ({ value: role.name, label: role.name })),
                    ]}
                    placeholder="All roles"
                    searchPlaceholder="Search roles..."
                    className="h-8 w-auto min-w-28 rounded-full px-2 text-xs sm:w-32"
                />
                <UiFormSearchSelect
                    value={filters.provider}
                    onChange={(value) => onFilterChange('provider', value)}
                    options={[
                        { value: ALL, label: 'All providers' },
                        ...providers.map((provider) => ({ value: provider, label: provider })),
                    ]}
                    placeholder="All providers"
                    searchPlaceholder="Search providers..."
                    className="h-8 w-auto min-w-28 rounded-full px-2 text-xs sm:w-32"
                />
                <UiFormSearchSelect
                    value={filters.status}
                    onChange={(value) => onFilterChange('status', value)}
                    options={[
                        { value: ALL, label: 'All statuses' },
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                    ]}
                    placeholder="All statuses"
                    searchPlaceholder="Search status..."
                    className="h-8 w-auto min-w-28 rounded-full px-2 text-xs sm:w-32"
                />
                <UiFormSearchSelect
                    value={filters.verified}
                    onChange={(value) => onFilterChange('verified', value)}
                    options={[
                        { value: ALL, label: 'All verification' },
                        { value: 'verified', label: 'Verified' },
                        { value: 'unverified', label: 'Unverified' },
                    ]}
                    placeholder="All verification"
                    searchPlaceholder="Search verification..."
                    className="h-8 w-auto min-w-28 rounded-full px-2 text-xs sm:w-32"
                />

                {isFiltered && (
                    <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                        <UiButton
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="text-muted-foreground gap-1 rounded-full"
                        >
                            <X className="h-3.5 w-3.5" /> Clear
                        </UiButton>
                        <span className="text-muted-foreground text-sm">
                            {filteredCount} of {totalCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
