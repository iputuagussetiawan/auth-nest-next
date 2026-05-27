'use client'

import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { IUserProfile } from '../types/user-type'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { UserAvatar } from '@/components/user-avatar'

import { userService } from '../services/user-service'
import { profileNameValidation, type profileDTO } from '../types/user-type'
import ManageEmail from './profile-setting/manage-email'
import ManagePassword from './profile-setting/manage-passwors'

interface ProfileSettingsProps {
    user: IUserProfile
}

type DialogType = 'email' | 'password' | null

export default function ProfileSettings({ user }: ProfileSettingsProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(user.profilePicture)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeDialog, setActiveDialog] = useState<DialogType>(null)
    const qc = useQueryClient()

    const { mutate: updateProfile, isPending: isSavingProfile } = useMutation({
        mutationFn: ({ firstName, lastName }: { firstName: string; lastName: string }) =>
            userService.updateProfile({ firstName, lastName }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user'] })
            toast.success('Profile updated')
            form.reset(form.getValues())
        },
        onError: (e: any) => toast.error(e.message || 'Failed to update profile'),
    })

    const { mutate: updateAvatar, isPending: isSavingAvatar } = useMutation({
        mutationFn: (file: File) => userService.updateAvatar(file),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user'] })
            toast.success('Avatar updated')
        },
        onError: (e: any) => toast.error(e.message || 'Failed to update avatar'),
    })

    const form = useForm<profileDTO>({
        resolver: zodResolver(profileNameValidation),
        defaultValues: {
            name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        },
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setPreviewImage(reader.result as string)
        reader.readAsDataURL(file)
        updateAvatar(file)
    }

    function onSubmit(values: profileDTO) {
        const parts = values.name.trim().split(/\s+/)
        const firstName = parts[0] ?? ''
        const lastName = parts.slice(1).join(' ') || ''
        updateProfile({ firstName, lastName })
    }

    const isPending = isSavingProfile || isSavingAvatar

    return (
        <div className="max-w-3xl space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your profile, login information, and devices
                </p>
            </div>

            <section className="space-y-6">
                <header>
                    <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                        Account
                    </h2>
                    <Separator className="mt-2" />
                </header>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div
                            className="group relative cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UserAvatar
                                name={`${user.firstName} ${user.lastName}`}
                                image={previewImage}
                                className="h-16 w-16 transition-opacity group-hover:opacity-80"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                <Camera className="h-5 w-5 text-white drop-shadow-md" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        <div className="flex-1 space-y-2">
                            <Label htmlFor="name">Preferred name</Label>
                            <Input
                                {...form.register('name')}
                                id="name"
                                className="bg-secondary/50 max-w-md"
                                disabled={isPending}
                            />
                            {form.formState.errors.name && (
                                <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-start">
                        <Button type="submit" disabled={isPending}>
                            {isSavingProfile ? <Loader2 className="animate-spin" /> : <Save />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </section>

            <section className="space-y-6">
                <header>
                    <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                        Account Security
                    </h2>
                    <Separator className="mt-2" />
                </header>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Email</Label>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setActiveDialog('email')}>
                        Manage email
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Password</Label>
                        <p className="text-muted-foreground text-sm">
                            {user.provider === 'email' ? 'Change your account password' : `Managed by ${user.provider}`}
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={user.provider !== 'email'}
                        onClick={() => setActiveDialog('password')}
                    >
                        Manage password
                    </Button>
                </div>
            </section>

            <Dialog open={activeDialog !== null} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="sm:max-w-sm">
                    {activeDialog === 'email' && (
                        <ManageEmail user={user} onSuccess={() => setActiveDialog(null)} />
                    )}
                    {activeDialog === 'password' && (
                        <ManagePassword onSuccess={() => setActiveDialog(null)} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
