'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { adminRoleService } from '../services/admin-role-service'
import { adminModuleService } from '../services/admin-module-service'
import type { IRole, IAppModule } from '../types/admin-types'

// Local access state: moduleId -> Set<roleId>
type AccessMap = Record<string, Set<string>>

function buildAccessMap(modules: IAppModule[]): AccessMap {
    const map: AccessMap = {}
    for (const m of modules) {
        map[m.id] = new Set(m.roleIds)
    }
    return map
}

export function RoleModuleMatrix() {
    const qc = useQueryClient()

    const { data: rolesData, isLoading: rolesLoading } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminRoleService.getAll(),
    })

    const { data: modulesData, isLoading: modulesLoading } = useQuery({
        queryKey: ['admin-modules'],
        queryFn: () => adminModuleService.getAll(),
    })

    const roles: IRole[] = useMemo(() => rolesData?.data ?? [], [rolesData])
    const modules: IAppModule[] = useMemo(() => modulesData?.data ?? [], [modulesData])

    // Local optimistic state
    const [access, setAccess] = useState<AccessMap>({})
    const [pendingCell, setPendingCell] = useState<string | null>(null) // "moduleId-roleId"

    // Sync from server whenever modules data changes
    useEffect(() => {
        if (modules.length) {
            setAccess(buildAccessMap(modules))
        }
    }, [modules])

    const updateMutation = useMutation({
        mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
            adminModuleService.update(id, { roleIds }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-modules'] })
        },
        onError: (e: any, { id }) => {
            // Revert: re-sync from server data
            const orig = modules.find((m) => m.id === id)
            if (orig) {
                setAccess((prev) => ({ ...prev, [id]: new Set(orig.roleIds) }))
            }
            toast.error(e?.message ?? 'Failed to update access')
        },
        onSettled: () => setPendingCell(null),
    })

    const toggle = (moduleId: string, roleId: string) => {
        const cellKey = `${moduleId}-${roleId}`
        setPendingCell(cellKey)

        const current = new Set(access[moduleId] ?? [])
        if (current.has(roleId)) {
            current.delete(roleId)
        } else {
            current.add(roleId)
        }
        const newRoleIds = Array.from(current)

        setAccess((prev) => ({ ...prev, [moduleId]: current }))
        updateMutation.mutate({ id: moduleId, roleIds: newRoleIds })
    }

    const isLoading = rolesLoading || modulesLoading

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
        )
    }

    if (modules.length === 0) {
        return (
            <div className="text-muted-foreground py-10 text-center text-sm">
                No modules found. Create modules first to manage access.
            </div>
        )
    }

    if (roles.length === 0) {
        return (
            <div className="text-muted-foreground py-10 text-center text-sm">
                No roles found.
            </div>
        )
    }

    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
                {/* Role column headers */}
                <thead>
                    <tr className="bg-muted/50 border-b">
                        {/* Module label header */}
                        <th className="bg-muted/50 sticky left-0 z-10 min-w-[200px] border-r px-4 py-3 text-left font-semibold">
                            Module
                        </th>
                        {roles.map((role) => (
                            <th key={role.id} className="min-w-[120px] px-4 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    {/* Role avatar */}
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
                                    {/* Count badge */}
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                        {Object.values(access).filter((s) => s.has(role.id)).length} modules
                                    </Badge>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {modules.map((mod, idx) => (
                        <tr
                            key={mod.id}
                            className={
                                idx % 2 === 0 ? 'bg-background hover:bg-muted/30' : 'bg-muted/20 hover:bg-muted/40'
                            }
                        >
                            {/* Module name (sticky left) */}
                            <td className={`sticky left-0 z-10 border-r px-4 py-3 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{mod.name}</span>
                                    <span className="text-muted-foreground font-mono text-xs">{mod.path}</span>
                                </div>
                                {!mod.isActive && (
                                    <Badge variant="outline" className="mt-1 text-[10px] text-muted-foreground">
                                        inactive
                                    </Badge>
                                )}
                            </td>

                            {/* Checkbox per role */}
                            {roles.map((role) => {
                                const cellKey = `${mod.id}-${role.id}`
                                const checked = access[mod.id]?.has(role.id) ?? false
                                const isPending = pendingCell === cellKey && updateMutation.isPending

                                return (
                                    <td key={role.id} className="px-4 py-3 text-center">
                                        {isPending ? (
                                            <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                                        ) : (
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() => toggle(mod.id, role.id)}
                                                aria-label={`${role.name} access to ${mod.name}`}
                                            />
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
