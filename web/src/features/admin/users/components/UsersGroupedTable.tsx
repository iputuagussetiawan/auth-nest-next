import { Fragment, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { UserAvatar } from '@/components/user-avatar'
import type { IAdminUser } from '../types/UserTypes'
import { renderUserActions } from './UserColumns'

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

interface Actions {
    onEdit: (user: IAdminUser) => void
    onDelete: (user: IAdminUser) => void
}

interface UsersGroupedTableProps extends Actions {
    users: IAdminUser[]
}

export function UsersGroupedTable({ users, onEdit, onDelete }: UsersGroupedTableProps) {
    // grouped: sort role names alphabetically, no-role last
    const grouped = useMemo(() => {
        const map = new Map<string, IAdminUser[]>()
        for (const u of users) {
            const key = u.role ?? '— No role'
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(u)
        }
        return [...map.entries()].sort(([a], [b]) => {
            if (a === '— No role') return 1
            if (b === '— No role') return -1
            return a.localeCompare(b)
        })
    }, [users])

    return (
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
                        return (
                            <Fragment key={roleName}>
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
                                            <TableCell>{renderUserActions(u, { onEdit, onDelete })}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </Fragment>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
