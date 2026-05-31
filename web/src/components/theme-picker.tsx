'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Palette } from 'lucide-react'
import { toast } from 'sonner'

import {
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { adminThemeService } from '@/features/admin/services/admin-theme-service'

export function ThemePickerMenuItem() {
    const qc = useQueryClient()

    const { data: listData } = useQuery({
        queryKey: ['themes-list'],
        queryFn: () => adminThemeService.listPublic(),
        staleTime: 60 * 1000,
    })

    const { data: myData } = useQuery({
        queryKey: ['my-theme'],
        queryFn: () => adminThemeService.getMyTheme(),
        staleTime: 30 * 1000,
    })

    const themes = listData?.data ?? []
    const myThemeId = myData?.data?.id

    const mutation = useMutation({
        mutationFn: (themeId: string) => adminThemeService.setPreference(themeId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-theme'] })
            toast.success('Theme updated')
        },
        onError: (e: any) => toast.error(e?.message ?? 'Failed to update theme'),
    })

    if (themes.length === 0) return null

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
                <Palette className="h-4 w-4" />
                Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52">
                {themes.map((theme) => {
                    const l = theme.config.light
                    const isSelected = myThemeId === theme.id
                    return (
                        <DropdownMenuItem
                            key={theme.id}
                            onClick={() => !isSelected && mutation.mutate(theme.id)}
                            className="flex items-center justify-between gap-2 cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {[l.primary, l.accent, l.sidebar].map((c, i) => (
                                        <span
                                            key={i}
                                            className="h-3.5 w-3.5 rounded-full border border-border"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm">{theme.name}</span>
                                {theme.isActive && !isSelected && (
                                    <span className="text-[10px] text-muted-foreground">(default)</span>
                                )}
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}
