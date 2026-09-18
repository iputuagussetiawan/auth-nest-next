import Image from 'next/image'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { IRoleWithPermissions } from '../types/RoleTypes'

interface Actions {
    onEdit: (role: IRoleWithPermissions) => void
    onDelete: (role: IRoleWithPermissions) => void
}

export function getRoleColumns(actions: Actions): ColumnDef<IRoleWithPermissions>[] {
    return [
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Role',
            cell: ({ row }) => {
                const { icon, name, label } = row.original
                const isUrl = icon?.startsWith('http')
                return (
                    <div className="flex items-center gap-2.5">
                        <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                            {isUrl ? (
                                <Image
                                    src={icon!}
                                    alt={name}
                                    width={36}
                                    height={36}
                                    unoptimized
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-primary text-sm font-bold">
                                    {name[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="font-medium">{label ?? name}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            meta: { className: 'hidden sm:table-cell' },
            cell: ({ getValue }) =>
                getValue<string | null>() ?? <span className="text-muted-foreground">—</span>,
        },
        {
            accessorKey: 'userCount',
            header: 'Users',
            cell: ({ getValue }) => (
                <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {getValue<number>()}
                </Badge>
            ),
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
                        <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => actions.onDelete(row.original)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]
}
