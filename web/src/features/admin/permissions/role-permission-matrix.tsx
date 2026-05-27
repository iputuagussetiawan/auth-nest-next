'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, Layers, Loader2, Pencil, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const PINNED_SLUGS = ['user', 'role'] as const
import { adminRoleService } from '../services/admin-role-service'
import { adminPermissionService } from '../services/admin-permission-service'
import { adminModuleService } from '../services/admin-module-service'
import type { IAppModule, IPermission, IRoleWithPermissions } from '../types/admin-types'
import { PermissionName } from './permission-name'

// ─────────────────────────────────────────────────────────────────────────────
// Types / helpers
// ─────────────────────────────────────────────────────────────────────────────

type AccessMap = Record<string, Set<string>>

interface ModuleNode {
    slug: string
    name: string
    children: ModuleNode[]
}

function buildModuleTree(modules: IAppModule[]): ModuleNode[] {
    const byId = new Map(modules.map(m => [m.id, m]))
    const nodeMap = new Map<string, ModuleNode>()

    const sorted = [...modules].sort((a, b) => a.order - b.order)
    for (const m of sorted) nodeMap.set(m.id, { slug: m.slug, name: m.name, children: [] })

    const roots: ModuleNode[] = []
    for (const m of sorted) {
        const node = nodeMap.get(m.id)!
        if (m.parentId && nodeMap.has(m.parentId)) {
            nodeMap.get(m.parentId)!.children.push(node)
        } else {
            roots.push(node)
        }
    }
    return roots
}

function hasPermsInSubtree(node: ModuleNode, groupMap: Map<string, IPermission[]>): boolean {
    if (groupMap.has(node.slug)) return true
    return node.children.some(c => hasPermsInSubtree(c, groupMap))
}

interface GroupEntry {
    slug: string
    label: string
    depth: number
}

function flattenGroupTree(
    nodes: ModuleNode[],
    groupMap: Map<string, IPermission[]>,
    collapsed: Set<string>,
    depth = 0,
): GroupEntry[] {
    const result: GroupEntry[] = []
    for (const node of nodes) {
        if (!hasPermsInSubtree(node, groupMap)) continue
        result.push({ slug: node.slug, label: node.name, depth })
        if (!collapsed.has(node.slug)) {
            result.push(...flattenGroupTree(node.children, groupMap, collapsed, depth + 1))
        }
    }
    return result
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
    const modules: IAppModule[] = useMemo(() => modulesData?.data ?? [], [modulesData])

    const moduleTree = useMemo(() => buildModuleTree(modules), [modules])
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
            const mod = modules.find(m => m.slug === slug)
            const label = slug === '__other__' ? 'other' : (mod?.name ?? slug).toLowerCase()
            const matched = perms.filter(p => p.name.toLowerCase().includes(q) || label.includes(q))
            if (matched.length) result.set(slug, matched)
        }
        return result
    }, [grouped, search, modules])

    // Pinned groups always shown at top regardless of tree position
    const pinnedEntries = useMemo((): GroupEntry[] =>
        PINNED_SLUGS
            .filter(slug => filteredGrouped.has(slug))
            .map(slug => ({ slug, label: slug, depth: 0 })),
        [filteredGrouped],
    )
    const pinnedSet = useMemo(() => new Set(PINNED_SLUGS), [])

    // Tree-ordered group entries (parent → children), pinned slugs excluded
    const flatEntries = useMemo(
        () => flattenGroupTree(moduleTree, filteredGrouped, collapsed).filter(e => !pinnedSet.has(e.slug as any)),
        [moduleTree, filteredGrouped, collapsed, pinnedSet],
    )

    // Groups whose slug isn't in the module tree (manually created, orphaned)
    const coveredSlugs = useMemo(() => {
        const set = new Set<string>()
        const walk = (nodes: ModuleNode[]) => { for (const n of nodes) { set.add(n.slug); walk(n.children) } }
        walk(moduleTree)
        return set
    }, [moduleTree])

    const orphanedEntries = useMemo((): GroupEntry[] => {
        const result: GroupEntry[] = []
        for (const slug of filteredGrouped.keys()) {
            if (slug !== '__other__' && !coveredSlugs.has(slug) && !pinnedSet.has(slug as any)) {
                result.push({ slug, label: slug.replace(/-/g, ' '), depth: 0 })
            }
        }
        return result
    }, [filteredGrouped, coveredSlugs, pinnedSet])

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
        onSettled: () => setPendingCell(null),
    })

    const toggle = (roleId: string, permId: string) => {
        const cellKey = `${roleId}-${permId}`
        setPendingCell(cellKey)
        const current = new Set(access[roleId] ?? [])
        if (current.has(permId)) { current.delete(permId) } else { current.add(permId) }
        setAccess(prev => ({ ...prev, [roleId]: current }))
        assignMutation.mutate({ roleId, permissionIds: Array.from(current) })
    }

    const isLoading = permsLoading || rolesLoading
    if (isLoading) return (
        <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
    )
    if (!permissions.length) return (
        <div className="text-muted-foreground py-10 text-center text-sm">
            No permissions found. Create permissions first.
        </div>
    )
    if (!roles.length) return (
        <div className="text-muted-foreground py-10 text-center text-sm">No roles found.</div>
    )

    // ── render helpers ──────────────────────────────────────────────────────

    const renderGroupHeader = (slug: string, label: string, depth: number, directCount: number, pinned = false) => {
        const isCollapsed = collapsed.has(slug)
        const headerPL = 16 + depth * 16
        const bgClass = pinned ? 'bg-primary/8' : depth === 0 ? 'bg-muted/40' : 'bg-muted/25'

        return (
            <tr
                className={`border-y ${bgClass} cursor-pointer select-none transition-colors hover:bg-muted/60`}
                onClick={() => toggleGroup(slug)}
            >
                <td
                    className={`sticky left-0 z-10 border-r ${bgClass} py-2 pr-4 transition-colors hover:bg-muted/60`}
                    style={{ paddingLeft: headerPL }}
                >
                    <div className="flex items-center gap-2">
                        {/* tree connector for children */}
                        {depth > 0 && (
                            <span className="mr-0.5 inline-block h-3 w-3 shrink-0 border-b border-l border-border" />
                        )}
                        {isCollapsed
                            ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        }
                        <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-semibold capitalize tracking-wide">{label}</span>
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

    const renderPermRow = (perm: IPermission, idx: number, slug: string, depth: number) => {
        const rowPL = 32 + depth * 16
        const isProtected = slug === 'user' || slug === 'role'
        const rowBg = idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'

        return (
            <tr key={perm.id} className={`group ${rowBg} hover:bg-muted/30`}>
                <td
                    className={`sticky left-0 z-10 border-r py-3 pr-4 ${rowBg}`}
                    style={{ paddingLeft: rowPL }}
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
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(perm)}>
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="ghost" size="icon"
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
                {roles.map(role => {
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
        )
    }

    const renderGroupSection = (entry: GroupEntry, pinned = false) => {
        const { slug, label, depth } = entry
        const perms = filteredGrouped.get(slug) ?? []
        const isCollapsed = collapsed.has(slug)
        return (
            <React.Fragment key={slug}>
                {renderGroupHeader(slug, label, depth, perms.length, pinned)}
                {!isCollapsed && perms.map((perm, idx) => renderPermRow(perm, idx, slug, depth))}
            </React.Fragment>
        )
    }

    const totalVisible = pinnedEntries.length + flatEntries.length + orphanedEntries.length + (otherPerms ? 1 : 0)

    return (
        <div className="space-y-3">
            <div className="relative max-w-sm">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder="Search module or permission…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
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
                            {roles.map(role => (
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
                        {pinnedEntries.length > 0 && (flatEntries.length > 0 || orphanedEntries.length > 0 || otherPerms) && (
                            <tr><td colSpan={roles.length + 1} className="h-px bg-border p-0" /></tr>
                        )}

                        {/* Module tree groups (parent → children, indented) */}
                        {flatEntries.map(e => renderGroupSection(e))}

                        {/* Orphaned groups (slug not in module tree) */}
                        {orphanedEntries.map(e => renderGroupSection(e))}

                        {/* Ungrouped permissions */}
                        {otherPerms && (
                            <React.Fragment key="__other__">
                                {renderGroupHeader('__other__', 'Other', 0, otherPerms.length)}
                                {!collapsed.has('__other__') &&
                                    otherPerms.map((perm, idx) => renderPermRow(perm, idx, '__other__', 0))}
                            </React.Fragment>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
