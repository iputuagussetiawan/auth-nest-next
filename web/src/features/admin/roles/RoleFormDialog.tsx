'use client'

import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UiButton } from '@/components/ui-custom/UiButton'
import { UiCheckbox } from '@/components/ui-custom/UiCheckbox'
import { UiFormInput, UiFormTextarea } from '@/components/ui-custom/UiFormInput'
import { UiImage } from '@/components/ui-custom/UiImage'
import type { IPermission } from '../permissions/types/PermissionTypes'
import { PermissionName } from '../permissions/PermissionName'
import type { IRole } from './types/RoleTypes'

const schema = z.object({
    name: z.string().min(2).max(50),
    label: z.string().max(100).optional(),
    description: z.string().max(255).optional(),
    permissionIds: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

interface RoleFormDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    role: IRole | null
    allPermissions: IPermission[]
    selectedPermissions: string[]
    onSubmit: (values: FormValues, imageFile: File | null) => void
    isPending: boolean
}

export function RoleFormDialog({
    open, onOpenChange, role, allPermissions, selectedPermissions, onSubmit, isPending,
}: RoleFormDialogProps) {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', label: '', description: '', permissionIds: [] },
    })

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        reset({
            name: role?.name ?? '',
            label: role?.label ?? '',
            description: role?.description ?? '',
            permissionIds: selectedPermissions,
        })
        setImageFile(null)
        setImagePreview(role?.icon ?? null)
    }, [role, selectedPermissions, reset])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    const checked = watch('permissionIds')
    const toggle = (id: string) => {
        const next = checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id]
        setValue('permissionIds', next)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{role ? 'Edit Role' : 'New Role'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit((v) => onSubmit(v, imageFile))} className="space-y-4">
                    <UiFormInput
                        label="Name"
                        {...register('name')}
                        placeholder="e.g. editor"
                        error={errors.name}
                    />

                    <UiFormInput
                        label="Label"
                        {...register('label')}
                        placeholder="e.g. Project Owner"
                    />

                    <UiFormTextarea
                        label="Description"
                        {...register('description')}
                        placeholder="What this role can do"
                        rows={3}
                    />

                    <div className="space-y-2">
                        <Label>Role Image</Label>
                        <div className="flex items-center gap-3">
                            <div className="bg-muted relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                                {imagePreview
                                    ? <UiImage src={imagePreview} alt="role" fill className="h-full w-full object-cover" />
                                    : <ImagePlus className="text-muted-foreground h-6 w-6" />
                                }
                            </div>
                            <div className="space-y-1.5">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <UiButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {imagePreview ? 'Change image' : 'Upload image'}
                                </UiButton>
                                {imagePreview && (
                                    <UiButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearImage}
                                        className="text-muted-foreground gap-1"
                                    >
                                        <X className="h-3.5 w-3.5" /> Remove
                                    </UiButton>
                                )}
                                <p className="text-muted-foreground text-xs">JPG, PNG, WebP, GIF · max 2 MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <ScrollArea className="h-48 rounded-md border p-3">
                            <div className="space-y-2">
                                {allPermissions.map((p) => (
                                    <div key={p.id} className="flex items-center gap-2">
                                        <UiCheckbox
                                            id={p.id}
                                            checked={checked.includes(p.id)}
                                            onCheckedChange={() => toggle(p.id)}
                                        />
                                        <label htmlFor={p.id} className="flex cursor-pointer flex-wrap items-center gap-1.5">
                                            <PermissionName name={p.name} />
                                            {p.description && (
                                                <span className="text-muted-foreground text-xs">{p.description}</span>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <UiButton type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</UiButton>
                        <UiButton type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save'}
                        </UiButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
