import { LayoutList, Layers, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { IRole } from '../../roles/types/RoleTypes'

export const ALL = 'all'

export interface Filters {
    role: string
    provider: string
    status: string
    verified: string
}

export const defaultFilters: Filters = { role: ALL, provider: ALL, status: ALL, verified: ALL }

interface UsersToolbarProps {
    view: 'flat' | 'grouped'
    onViewChange: (view: 'flat' | 'grouped') => void
    filters: Filters
    onFilterChange: (key: keyof Filters, value: string) => void
    roles: IRole[]
    providers: string[]
    isFiltered: boolean
    filteredCount: number
    totalCount: number
    onClear: () => void
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
}: UsersToolbarProps) {
    return (
        <div className="flex flex-wrap items-start gap-3">
            <div className="flex rounded-md border">
                <Button
                    variant={view === 'flat' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => onViewChange('flat')}
                >
                    <LayoutList className="mr-1.5 h-4 w-4" /> All
                </Button>
                <Button
                    variant={view === 'grouped' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => onViewChange('grouped')}
                >
                    <Layers className="mr-1.5 h-4 w-4" /> By Role
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                <Select value={filters.role} onValueChange={(v) => onFilterChange('role', v)}>
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

                <Select value={filters.provider} onValueChange={(v) => onFilterChange('provider', v)}>
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

                <Select value={filters.status} onValueChange={(v) => onFilterChange('status', v)}>
                    <SelectTrigger className="w-full sm:w-34">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.verified} onValueChange={(v) => onFilterChange('verified', v)}>
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
                            onClick={onClear}
                            className="text-muted-foreground gap-1"
                        >
                            <X className="h-3.5 w-3.5" /> Clear
                        </Button>
                        <span className="text-muted-foreground text-sm">
                            {filteredCount} of {totalCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
