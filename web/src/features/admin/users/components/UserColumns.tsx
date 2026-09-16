import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/user-avatar'
import type { IAdminUser } from '../types/UserTypes'

interface Actions {
    onEdit: (user: IAdminUser) => void
    onDelete: (user: IAdminUser) => void
}

export function renderUserActions(user: IAdminUser, actions: Actions) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => actions.onEdit(user)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => actions.onDelete(user)}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function getUserColumns(actions: Actions): ColumnDef<IAdminUser>[] {
    return [
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
            cell: ({ row }) => renderUserActions(row.original, actions),
        },
    ]
}
