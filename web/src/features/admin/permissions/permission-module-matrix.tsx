'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { adminPermissionService } from '../services/admin-permission-service'
import { adminModuleService } from '../services/admin-module-service'
import type { IPermission, IAppModule } from '../types/admin-types'
import { PermissionName } from './permission-name'

// Local state: moduleId -> Set<permissionId>
type AccessMap = Record<string, Set<string>>

function buildAccessMap(modules: IAppModule[]): AccessMap {
    const map: AccessMap = {}
    for (const m of modules) {
        map[m.id] = new Set(m.permissionIds)
    }
    return map
}

export function PermissionModuleMatrix() {
    const qc = useQueryClient()

    const { data: permsData, isLoading: permsLoading } = useQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminPermissionService.getAll(),
    })

    const { data: modulesData, isLoading: modulesLoading } = useQuery({
        queryKey: ['admin-modules'],
        queryFn: () => adminModuleService.getAll(),
    })

    const permissions: IPermission[] = useMemo(() => permsData?.data ?? [], [permsData])
    const modules: IAppModule[] = useMemo(() => modulesData?.data ?? [], [modulesData])

    const [access, setAccess] = useState<AccessMap>({})
    const [pendingCell, setPendingCell] = useState<string | null>(null) // "moduleId-permId"

    useEffect(() => {
        if (modules.length) setAccess(buildAccessMap(modules))
    }, [modules])

    const updateMutation = useMutation({
        mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
            adminModuleService.update(id, { permissionIds }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-modules'] })
        },
        onError: (e: any, { id }) => {
            const orig = modules.find((m) => m.id === id)
            if (orig) setAccess((prev) => ({ ...prev, [id]: new Set(orig.permissionIds) }))
            toast.error(e?.message ?? 'Failed to update access')
        },
        onSettled: () => setPendingCell(null),
    })

    const toggle = (moduleId: string, permId: string) => {
        setPendingCell(`${moduleId}-${permId}`)
        const current = new Set(access[moduleId] ?? [])
        if (current.has(permId)) { current.delete(permId) } else { current.add(permId) }
        setAccess((prev) => ({ ...prev, [moduleId]: current }))
        updateMutation.mutate({ id: moduleId, permissionIds: Array.from(current) })
    }

    const isLoading = permsLoading || modulesLoading

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
        )
    }

    if (!permissions.length || !modules.length) {
        return (
            <div className="text-muted-foreground py-10 text-center text-sm">
                {!permissions.length ? 'No permissions found.' : 'No modules found.'}
            </div>
        )
    }

    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-muted/50 border-b">
                        {/* Permission label header */}
                        <th className="bg-muted/50 sticky left-0 z-10 min-w-[220px] border-r px-4 py-3 text-left font-semibold">
                            Permission
                        </th>
                        {modules.map((mod) => (
                            <th key={mod.id} className="min-w-[130px] px-3 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-foreground font-semibold">{mod.name}</span>
                                    <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px]">
                                        {mod.slug}
                                    </Badge>
                                    {!mod.isActive && (
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">inactive</Badge>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {permissions.map((perm, idx) => (
                        <tr
                            key={perm.id}
                            className={idx % 2 === 0 ? 'bg-background hover:bg-muted/30' : 'bg-muted/20 hover:bg-muted/40'}
                        >
                            <td className={`sticky left-0 z-10 border-r px-4 py-3 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                                <div className="flex flex-col gap-0.5">
                                    <PermissionName name={perm.name} />
                                    {perm.description && (
                                        <span className="text-muted-foreground text-xs">{perm.description}</span>
                                    )}
                                </div>
                            </td>

                            {modules.map((mod) => {
                                const cellKey = `${mod.id}-${perm.id}`
                                const checked = access[mod.id]?.has(perm.id) ?? false
                                const isPending = pendingCell === cellKey && updateMutation.isPending

                                return (
                                    <td key={mod.id} className="px-4 py-3 text-center">
                                        {isPending ? (
                                            <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                                        ) : (
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() => toggle(mod.id, perm.id)}
                                                aria-label={`${perm.name} grants access to ${mod.name}`}
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
