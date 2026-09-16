'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, Layers, Loader2, Pencil, Search, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { UiButton } from '@/components/ui-custom/UiButton'
import { UiCheckbox } from '@/components/ui-custom/UiCheckbox'
import { UiInput } from '@/components/ui-custom/UiInput'

const PINNED_SLUGS = ['user', 'role'] as const
import { adminRoleService } from '../roles/services/RoleService'
import { adminPermissionService } from './services/PermissionService'
import type { IRoleWithPermissions } from '../roles/types/RoleTypes'
import type { IPermission } from './types/PermissionTypes'
import { PermissionName } from './PermissionName'

// ─────────────────────────────────────────────────────────────────────────────
// Types / helpers
// ─────────────────────────────────────────────────────────────────────────────

type AccessMap = Record<string, Set<string>>

interface GroupEntry {
    slug: string
    label: string
}

// e.g. "project-owner" -> "Project Owner"
function humanize(slug: string): string {
    return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function buildAccessMap(roles: IRoleWithPermissions[]): AccessMap {
    const map: AccessMap = {}
    for (const r of roles) map[r.id] = new Set(r.permissions.map(p => p.id))
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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface RolePermissionMatrixProps {
    onEdit?: (perm: IPermission) => void
    onDelete?: (perm: IPermission) => void
}

export function RolePermissionMatrix({ onEdit, onDelete }: RolePermissionMatrixProps) {
    const qc = useQueryClient()

    const { data: permsData } = useSuspenseQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminPermissionService.getAll(),
    })
    const { data: rolesData } = useSuspenseQuery({
        queryKey: ['admin-roles-with-permissions'],
        queryFn: () => adminRoleService.getAllWithPermissions(),
    })

    const permissions: IPermission[] = useMemo(() => permsData?.data ?? [], [permsData])
    const roles: IRoleWithPermissions[] = useMemo(() => rolesData?.data ?? [], [rolesData])
    const grouped = useMemo(() => groupPermissions(permissions), [permissions])

    const [search, setSearch] = useState('')
    const [access, setAccess] = useState<AccessMap>({})
    const [pendingRole, setPendingRole] = useState<string | null>(null)
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

    const filteredGrouped = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return grouped
        const result = new Map<string, IPermission[]>()
        for (const [slug, perms] of grouped.entries()) {
            const label = slug === '__other__' ? 'other' : humanize(slug).toLowerCase()
            const matched = perms.filter(p => p.name.toLowerCase().includes(q) || label.includes(q))
            if (matched.length) result.set(slug, matched)
        }
        return result
    }, [grouped, search])

    const pinnedSet = useMemo(() => new Set(PINNED_SLUGS), [])

    // Pinned groups always shown at top
    const pinnedEntries = useMemo((): GroupEntry[] =>
        PINNED_SLUGS
            .filter(slug => filteredGrouped.has(slug))
            .map(slug => ({ slug, label: humanize(slug) })),
        [filteredGrouped],
    )

    // Remaining groups, alphabetical by label
    const flatEntries = useMemo((): GroupEntry[] =>
        Array.from(filteredGrouped.keys())
            .filter(slug => slug !== '__other__' && !pinnedSet.has(slug as any))
            .map(slug => ({ slug, label: humanize(slug) }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        [filteredGrouped, pinnedSet],
    )

    const otherPerms = filteredGrouped.get('__other__')

    const toggleGroup = (slug: string) =>
        setCollapsed(prev => {
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
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-roles-with-permissions'] }) },
        onError: (e: any, { roleId }) => {
            const orig = roles.find(r => r.id === roleId)
            if (orig) setAccess(prev => ({ ...prev, [roleId]: new Set(orig.permissions.map(p => p.id)) }))
            toast.error(e?.message ?? 'Failed to update permission')
        },
        onSettled: () => setPendingRole(null),
    })

    const toggle = (roleId: string, permId: string) => {
        if (pendingRole === roleId) return
        setPendingRole(roleId)
        const current = new Set(access[roleId] ?? [])
        if (current.has(permId)) { current.delete(permId) } else { current.add(permId) }
        setAccess(prev => ({ ...prev, [roleId]: current }))
        assignMutation.mutate({ roleId, permissionIds: Array.from(current) })
    }

    if (!permissions.length) return (
        <div className="text-muted-foreground py-10 text-center text-sm">
            No permissions found. Create permissions first.
        </div>
    )
    if (!roles.length) return (
        <div className="text-muted-foreground py-10 text-center text-sm">No roles found.</div>
    )

    // ── render helpers ──────────────────────────────────────────────────────

    const renderGroupHeader = (slug: string, label: string, directCount: number, pinned = false) => {
        const isCollapsed = collapsed.has(slug)
        const bgClass = pinned ? 'bg-primary/8' : 'bg-muted/40'
        const stickyBg = pinned
            ? 'bg-primary/10 backdrop-blur-md supports-backdrop-filter:bg-primary/8'
            : 'bg-muted/60 backdrop-blur-md supports-backdrop-filter:bg-muted/40'

        return (
            <tr
                className={`border-y ${bgClass} cursor-pointer select-none transition-colors hover:bg-muted/60`}
                onClick={() => toggleGroup(slug)}
            >
                <td
                    className={`sticky left-0 z-10 border-r ${stickyBg} py-2 pr-4 pl-4 transition-colors hover:bg-muted/60`}
                >
                    <div className="flex items-center gap-2">
                        {isCollapsed
                            ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        }
                        <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-semibold tracking-wide">{label}</span>
                        {directCount > 0 && (
                            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{directCount}</Badge>
                        )}
                        {pinned && (
                            <Badge variant="outline" className="h-4 border-primary/40 px-1.5 text-[10px] text-primary">Core</Badge>
                        )}
                    </div>
                </td>
                {roles.map(role => (
                    <td key={role.id} className={`${bgClass} px-4 py-2`} />
                ))}
            </tr>
        )
    }

    const renderPermRow = (perm: IPermission, idx: number, slug: string) => {
        const isProtected = slug === 'user' || slug === 'role'
        const rowBg = idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'
        const stickyRowBg = idx % 2 === 0
            ? 'bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70'
            : 'bg-muted/20 backdrop-blur-md supports-backdrop-filter:bg-muted/10'

        return (
            <tr key={perm.id} className={`group ${rowBg} hover:bg-muted/30`}>
                <td
                    className={`sticky left-0 z-10 border-r py-3 pr-4 pl-8 ${stickyRowBg}`}
                >
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <PermissionName name={perm.name} />
                            {perm.description && (
                                <span className="text-muted-foreground text-xs">{perm.description}</span>
                            )}
                        </div>
                        {!isProtected && (onEdit || onDelete) && (
                            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {onEdit && (
                                    <UiButton variant="ghost" size="icon-xs" className="h-6 w-6" onClick={() => onEdit(perm)}>
                                        <Pencil className="h-3 w-3" />
                                    </UiButton>
                                )}
                                {onDelete && (
                                    <UiButton
                                        variant="ghost" size="icon-xs"
                                        className="text-destructive hover:text-destructive h-6 w-6"
                                        onClick={() => onDelete(perm)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </UiButton>
                                )}
                            </div>
                        )}
                    </div>
                </td>
                {roles.map(role => {
                    const checked = access[role.id]?.has(perm.id) ?? false
                    const isPending = pendingRole === role.id && assignMutation.isPending
                    return (
                        <td key={role.id} className="px-4 py-3 text-center">
                            {isPending ? (
                                <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                                <UiCheckbox
                                    checked={checked}
                                    onCheckedChange={() => toggle(role.id, perm.id)}
                                    aria-label={`${role.name} has ${perm.name}`}
                                />
                            )}
                        </td>
                    )
                })}
            </tr>
        )
    }

    const renderGroupSection = (entry: GroupEntry, pinned = false) => {
        const { slug, label } = entry
        const perms = filteredGrouped.get(slug) ?? []
        const isCollapsed = collapsed.has(slug)
        return (
            <React.Fragment key={slug}>
                {renderGroupHeader(slug, label, perms.length, pinned)}
                {!isCollapsed && perms.map((perm, idx) => renderPermRow(perm, idx, slug))}
            </React.Fragment>
        )
    }

    const totalVisible = pinnedEntries.length + flatEntries.length + (otherPerms ? 1 : 0)

    return (
        <div className="min-w-0 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium">Role access matrix</p>
                    <p className="text-xs text-muted-foreground">Toggle permissions by role. Changes save automatically.</p>
                </div>
                <div className="relative w-full sm:max-w-sm">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <UiInput
                        placeholder="Search permission…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="scrollbar-flat max-h-[70vh] overflow-auto rounded-lg border">
                <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-20 backdrop-blur-md">
                        <tr className="border-b bg-background/70 supports-backdrop-filter:bg-background/60">
                            <th className="sticky left-0 z-30 min-w-[260px] border-r bg-background/70 px-4 py-3 text-left font-semibold backdrop-blur-md supports-backdrop-filter:bg-background/60">
                                Permission
                            </th>
                            {roles.map(role => (
                                <th key={role.id} className="min-w-[130px] bg-background/70 px-4 py-3 text-center backdrop-blur-md supports-backdrop-filter:bg-background/60">
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
                                        <span className="text-foreground font-semibold">{role.label ?? role.name}</span>
                                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                            {access[role.id]?.size ?? 0} perms
                                        </Badge>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {totalVisible === 0 && (
                            <tr>
                                <td colSpan={roles.length + 1} className="text-muted-foreground py-10 text-center text-sm">
                                    No results for &ldquo;{search}&rdquo;
                                </td>
                            </tr>
                        )}

                        {/* Pinned core groups always at top */}
                        {pinnedEntries.map(e => renderGroupSection(e, true))}

                        {/* Divider after pinned if there are more groups */}
                        {pinnedEntries.length > 0 && (flatEntries.length > 0 || otherPerms) && (
                            <tr><td colSpan={roles.length + 1} className="h-px bg-border p-0" /></tr>
                        )}

                        {/* Remaining permission groups (alphabetical) */}
                        {flatEntries.map(e => renderGroupSection(e))}

                        {/* Ungrouped permissions */}
                        {otherPerms && (
                            <React.Fragment key="__other__">
                                {renderGroupHeader('__other__', 'Other', otherPerms.length)}
                                {!collapsed.has('__other__') &&
                                    otherPerms.map((perm, idx) => renderPermRow(perm, idx, '__other__'))}
                            </React.Fragment>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
