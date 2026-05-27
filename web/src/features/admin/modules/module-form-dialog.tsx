'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import type { IAppModule, IRole } from '../types/admin-types'

const schema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only').max(100),
    path: z.string().max(255),
    icon: z.string().max(100).optional(),
    description: z.string().max(255).optional(),
    isActive: z.boolean(),
    roleIds: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

interface ModuleFormDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    module: IAppModule | null
    roles: IRole[]
    onSubmit: (values: FormValues) => void
    isPending: boolean
}

export function ModuleFormDialog({ open, onOpenChange, module, roles, onSubmit, isPending }: ModuleFormDialogProps) {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', slug: '', path: '', icon: '', description: '', isActive: true, roleIds: [] },
    })

    useEffect(() => {
        if (module) {
            reset({
                name: module.name,
                slug: module.slug,
                path: module.path,
                icon: module.icon ?? '',
                description: module.description ?? '',
                isActive: module.isActive,
                roleIds: module.roleIds,
            })
        } else {
            reset({ name: '', slug: '', path: '', icon: '', description: '', isActive: true, roleIds: [] })
        }
    }, [module, reset])

    const name = watch('name')
    const slug = watch('slug')

    // auto-derive slug from name (create only)
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setValue('name', val)
        if (!module) {
            const derived = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            setValue('slug', derived)
            setValue('path', `/dashboard/${derived}`)
        }
    }

    // auto-update path when slug changes
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setValue('slug', val)
        if (!module) setValue('path', `/dashboard/${val}`)
    }

    const checkedRoles = watch('roleIds')
    const toggleRole = (id: string) => {
        const next = checkedRoles.includes(id) ? checkedRoles.filter((x) => x !== id) : [...checkedRoles, id]
        setValue('roleIds', next)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{module ? 'Edit Module' : 'New Module'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={handleNameChange}
                            placeholder="e.g. Products"
                        />
                        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Slug</Label>
                            <Input
                                value={slug}
                                onChange={handleSlugChange}
                                placeholder="products"
                            />
                            {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Path</Label>
                            <Input {...register('path')} placeholder="/dashboard/products" />
                            {errors.path && <p className="text-destructive text-xs">{errors.path.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Icon <span className="text-muted-foreground text-xs">(lucide name)</span></Label>
                            <Input {...register('icon')} placeholder="LayoutDashboard" />
                        </div>
                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Input {...register('description')} placeholder="What this module does" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch
                            id="isActive"
                            checked={watch('isActive')}
                            onCheckedChange={(v) => setValue('isActive', v)}
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Accessible by Roles</Label>
                        <ScrollArea className="h-36 rounded-md border p-3">
                            <div className="space-y-2">
                                {roles.map((r) => (
                                    <div key={r.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`role-${r.id}`}
                                            checked={checkedRoles.includes(r.id)}
                                            onCheckedChange={() => toggleRole(r.id)}
                                        />
                                        <label htmlFor={`role-${r.id}`} className="cursor-pointer text-sm font-medium">
                                            {r.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
