'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, Layers, Loader2, Pencil, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { adminRoleService } from '../services/admin-role-service'
import { adminPermissionService } from '../services/admin-permission-service'
import { adminModuleService } from '../services/admin-module-service'
import type { IPermission, IRoleWithPermissions } from '../types/admin-types'
import { PermissionName } from './permission-name'

type AccessMap = Record<string, Set<string>>

function buildAccessMap(roles: IRoleWithPermissions[]): AccessMap {
    const map: AccessMap = {}
    for (const r of roles) {
        map[r.id] = new Set(r.permissions.map((p) => p.id))
    }
    return map
}

function groupPermissions(permissions: IPermission[]): Map<string, IPermission[]> {
    const map = new Map<string, IPermission[]>()
    for (const perm of permissions) {
        const colon = perm.name.indexOf(':')
        const group = colon !== -1 ? perm.name.slice(0, colon) : '__other__'
        if (!map.has(group)) map.set(group, [])
        map.get(group)!.push(perm)
    }
    return map
}

interface RolePermissionMatrixProps {
    onEdit?: (perm: IPermission) => void
    onDelete?: (perm: IPermission) => void
}

export function RolePermissionMatrix({ onEdit, onDelete }: RolePermissionMatrixProps) {
    const qc = useQueryClient()

    const { data: permsData, isLoading: permsLoading } = useQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminPermissionService.getAll(),
    })

    const { data: rolesData, isLoading: rolesLoading } = useQuery({
        queryKey: ['admin-roles-with-permissions'],
        queryFn: () => adminRoleService.getAllWithPermissions(),
    })

    const { data: modulesData } = useQuery({
        queryKey: ['admin-modules'],
        queryFn: () => adminModuleService.getAll(),
    })

    const permissions: IPermission[] = useMemo(() => permsData?.data ?? [], [permsData])
    const roles: IRoleWithPermissions[] = useMemo(() => rolesData?.data ?? [], [rolesData])

    const moduleNameMap = useMemo(() => {
        const map: Record<string, string> = {}
        for (const m of modulesData?.data ?? []) map[m.slug] = m.name
        return map
    }, [modulesData])

    const grouped = useMemo(() => groupPermissions(permissions), [permissions])

    const [search, setSearch] = useState('')
    const [access, setAccess] = useState<AccessMap>({})
    const [pendingCell, setPendingCell] = useState<string | null>(null)
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

    const filteredGrouped = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return grouped
        const result = new Map<string, IPermission[]>()
        for (const [slug, perms] of grouped.entries()) {
            const label = slug === '__other__'
                ? 'other'
                : (moduleNameMap[slug] ?? slug).toLowerCase()
            const matchedPerms = perms.filter(
                (p) => p.name.toLowerCase().includes(q) || label.includes(q)
            )
            if (matchedPerms.length) result.set(slug, matchedPerms)
        }
        return result
    }, [grouped, search, moduleNameMap])

    const toggleGroup = (slug: string) =>
        setCollapsed((prev) => {
            const next = new Set(prev)
            if (next.has(slug)) next.delete(slug)
            else next.add(slug)
            return next
        })

    useEffect(() => {
        if (roles.length) setAccess(buildAccessMap(roles))
    }, [roles])

    const assignMutation = useMutation({
        mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
            adminRoleService.assignPermissions(roleId, permissionIds),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-roles-with-permissions'] })
        },
        onError: (e: any, { roleId }) => {
            const orig = roles.find((r) => r.id === roleId)
            if (orig) {
                setAccess((prev) => ({ ...prev, [roleId]: new Set(orig.permissions.map((p) => p.id)) }))
            }
            toast.error(e?.message ?? 'Failed to update permission')
        },
        onSettled: () => setPendingCell(null),
    })

    const toggle = (roleId: string, permId: string) => {
        const cellKey = `${roleId}-${permId}`
        setPendingCell(cellKey)
        const current = new Set(access[roleId] ?? [])
        if (current.has(permId)) current.delete(permId)
        else current.add(permId)
        setAccess((prev) => ({ ...prev, [roleId]: current }))
        assignMutation.mutate({ roleId, permissionIds: Array.from(current) })
    }

    const isLoading = permsLoading || rolesLoading

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
        )
    }

    if (!permissions.length) {
        return (
            <div className="text-muted-foreground py-10 text-center text-sm">
                No permissions found. Create permissions first.
            </div>
        )
    }

    if (!roles.length) {
        return (
            <div className="text-muted-foreground py-10 text-center text-sm">
                No roles found.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="relative max-w-sm">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder="Search module or permission…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-muted/50 border-b">
                        <th className="bg-muted/50 sticky left-0 z-10 min-w-[260px] border-r px-4 py-3 text-left font-semibold">
                            Permission
                        </th>
                        {roles.map((role) => (
                            <th key={role.id} className="min-w-[130px] px-4 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border">
                                        {role.icon?.startsWith('http') ? (
                                            <img src={role.icon} alt={role.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-primary text-xs font-bold">
                                                {role.name[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-foreground font-semibold capitalize">{role.name}</span>
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                        {access[role.id]?.size ?? 0} perms
                                    </Badge>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {filteredGrouped.size === 0 && (
                        <tr>
                            <td colSpan={roles.length + 1} className="text-muted-foreground py-10 text-center text-sm">
                                No results for &ldquo;{search}&rdquo;
                            </td>
                        </tr>
                    )}
                    {Array.from(filteredGrouped.entries()).map(([groupSlug, groupPerms]) => {
                        const isOther = groupSlug === '__other__'
                        const groupLabel = isOther
                            ? 'Other'
                            : (moduleNameMap[groupSlug] ?? groupSlug.replace(/-/g, ' '))

                        return (
                            <React.Fragment key={groupSlug}>
                                {/* Group header row */}
                                <tr
                                    key={`group-${groupSlug}`}
                                    className="border-y bg-muted/40 cursor-pointer select-none hover:bg-muted/60 transition-colors"
                                    onClick={() => toggleGroup(groupSlug)}
                                >
                                    <td className="sticky left-0 z-10 border-r bg-muted/40 hover:bg-muted/60 px-4 py-2 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {collapsed.has(groupSlug)
                                                ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            }
                                            <Layers className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                                            <span className="font-semibold capitalize tracking-wide">
                                                {groupLabel}
                                            </span>
                                            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                                                {groupPerms.length}
                                            </Badge>
                                        </div>
                                    </td>
                                    {roles.map((role) => (
                                        <td key={role.id} className="bg-muted/40 px-4 py-2" />
                                    ))}
                                </tr>

                                {/* Permission rows */}
                                {!collapsed.has(groupSlug) && groupPerms.map((perm, idx) => (
                                    <tr
                                        key={perm.id}
                                        className={
                                            idx % 2 === 0
                                                ? 'bg-background hover:bg-muted/30'
                                                : 'bg-muted/10 hover:bg-muted/30'
                                        }
                                    >
                                        <td
                                            className={`sticky left-0 z-10 border-r px-4 py-3 pl-8 ${
                                                idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <PermissionName name={perm.name} />
                                                    {perm.description && (
                                                        <span className="text-muted-foreground text-xs">
                                                            {perm.description}
                                                        </span>
                                                    )}
                                                </div>
                                                {groupSlug !== 'user' && groupSlug !== 'role' && (onEdit || onDelete) && (
                                                    <div className="flex shrink-0 items-center gap-1">
                                                        {onEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => onEdit(perm)}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        {onDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive h-6 w-6"
                                                                onClick={() => onDelete(perm)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {roles.map((role) => {
                                            const cellKey = `${role.id}-${perm.id}`
                                            const checked = access[role.id]?.has(perm.id) ?? false
                                            const isPending = pendingCell === cellKey && assignMutation.isPending

                                            return (
                                                <td key={role.id} className="px-4 py-3 text-center">
                                                    {isPending ? (
                                                        <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={() => toggle(role.id, perm.id)}
                                                            aria-label={`${role.name} has ${perm.name}`}
                                                        />
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        )
                    })}
                </tbody>
            </table>
        </div>
        </div>
    )
}
