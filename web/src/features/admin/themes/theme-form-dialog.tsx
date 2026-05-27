'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { ITheme } from '../types/admin-types'

const configSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Valid hex color required'),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    foregroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    cardColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    borderRadius: z.string(),
    fontFamily: z.string().min(1),
    heroVariant: z.enum(['centered', 'fullwidth']),
    heroBackground: z.enum(['gradient', 'solid', 'mesh']),
    darkMode: z.boolean(),
})

const schema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only').max(100),
    isActive: z.boolean(),
    config: configSchema,
})

type FormValues = z.infer<typeof schema>

const DEFAULT_CONFIG: FormValues['config'] = {
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    foregroundColor: '#0f172a',
    cardColor: '#ffffff',
    borderRadius: '0.5',
    fontFamily: 'Inter',
    heroVariant: 'centered',
    heroBackground: 'gradient',
    darkMode: false,
}

interface ThemeFormDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    theme: ITheme | null
    onSubmit: (values: FormValues) => void
    isPending: boolean
}

export function ThemeFormDialog({ open, onOpenChange, theme, onSubmit, isPending }: ThemeFormDialogProps) {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', slug: '', isActive: false, config: DEFAULT_CONFIG },
    })

    useEffect(() => {
        if (theme) {
            reset({
                name: theme.name,
                slug: theme.slug,
                isActive: theme.isActive,
                config: theme.config,
            })
        } else {
            reset({ name: '', slug: '', isActive: false, config: DEFAULT_CONFIG })
        }
    }, [theme, reset])

    const name = watch('name')
    const slug = watch('slug')

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setValue('name', val)
        if (!theme) {
            const derived = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            setValue('slug', derived)
        }
    }

    const ColorField = ({ field, label }: { field: keyof FormValues['config']; label: string }) => {
        const val = watch(`config.${field}` as any) as string
        return (
            <div className="space-y-1">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={val}
                        onChange={(e) => setValue(`config.${field}` as any, e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded border p-0.5"
                    />
                    <Input
                        value={val}
                        onChange={(e) => setValue(`config.${field}` as any, e.target.value)}
                        placeholder="#6366f1"
                        className="font-mono text-sm"
                    />
                </div>
                {(errors.config as any)?.[field] && (
                    <p className="text-destructive text-xs">{(errors.config as any)[field]?.message}</p>
                )}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{theme ? 'Edit Theme' : 'New Theme'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Basic info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Name</Label>
                            <Input
                                value={name}
                                onChange={handleNameChange}
                                placeholder="e.g. Ocean Blue"
                            />
                            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Slug</Label>
                            <Input
                                value={slug}
                                onChange={(e) => setValue('slug', e.target.value)}
                                placeholder="ocean-blue"
                            />
                            {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch
                            id="isActive"
                            checked={watch('isActive')}
                            onCheckedChange={(v) => setValue('isActive', v)}
                        />
                        <Label htmlFor="isActive">Set as active theme on save</Label>
                    </div>

                    {/* Colors */}
                    <div>
                        <p className="mb-2 text-sm font-semibold">Colors</p>
                        <div className="grid grid-cols-2 gap-3">
                            <ColorField field="primaryColor" label="Primary" />
                            <ColorField field="accentColor" label="Accent" />
                            <ColorField field="backgroundColor" label="Background" />
                            <ColorField field="foregroundColor" label="Foreground (text)" />
                            <ColorField field="cardColor" label="Card" />
                        </div>
                    </div>

                    {/* Typography & layout */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Font Family</Label>
                            <Input {...register('config.fontFamily')} placeholder="Inter" />
                        </div>
                        <div className="space-y-1">
                            <Label>Border Radius <span className="text-muted-foreground text-xs">(rem)</span></Label>
                            <Input {...register('config.borderRadius')} placeholder="0.5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Hero Variant</Label>
                            <Select
                                value={watch('config.heroVariant')}
                                onValueChange={(v) => setValue('config.heroVariant', v as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="centered">Centered</SelectItem>
                                    <SelectItem value="fullwidth">Full Width</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Hero Background</Label>
                            <Select
                                value={watch('config.heroBackground')}
                                onValueChange={(v) => setValue('config.heroBackground', v as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gradient">Gradient</SelectItem>
                                    <SelectItem value="solid">Solid</SelectItem>
                                    <SelectItem value="mesh">Mesh</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch
                            id="darkMode"
                            checked={watch('config.darkMode')}
                            onCheckedChange={(v) => setValue('config.darkMode', v)}
                        />
                        <Label htmlFor="darkMode">Dark Mode</Label>
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
