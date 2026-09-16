'use client'

import { Image as ImageIcon } from 'lucide-react'
import type { UseFormSetValue } from 'react-hook-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ImageUploader } from './ImageUploader'
import type { FormValues } from '../types'

interface BrandingTabProps {
    logoUrl: string
    faviconUrl: string
    setValue: UseFormSetValue<FormValues>
}

export function BrandingTab({ logoUrl, faviconUrl, setValue }: BrandingTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="h-4 w-4" /> Branding
                </CardTitle>
                <CardDescription>Upload and manage the brand assets used across your site.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-xl border bg-muted/10 p-5">
                    <ImageUploader
                        label="Logo"
                        hint="Shown in the header and emails. PNG, SVG, WebP recommended."
                        value={logoUrl}
                        onChange={(url) => setValue('logoUrl', url, { shouldDirty: true })}
                    />
                </div>
                <div className="rounded-xl border bg-muted/10 p-5">
                    <ImageUploader
                        label="Favicon"
                        hint="32×32 or 64×64 icon shown in browser tabs. ICO, PNG supported."
                        value={faviconUrl}
                        onChange={(url) => setValue('faviconUrl', url, { shouldDirty: true })}
                        dropzoneClassName="h-[100px] w-[100px]"
                        previewClassName="h-[100px] w-[100px]"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
