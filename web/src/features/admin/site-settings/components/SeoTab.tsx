'use client'

import { Search } from 'lucide-react'
import { useWatch, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UiFormInput, UiFormTextarea } from '@/components/ui-custom/UiFormInput'

import { ImageUploader } from './ImageUploader'
import type { FormValues } from '../types'

interface SeoTabProps {
    register: UseFormRegister<FormValues>
    setValue: UseFormSetValue<FormValues>
    control: Control<FormValues>
    errors: FieldErrors<FormValues>
    ogImageUrl: string
}

export function SeoTab({ register, setValue, control, errors, ogImageUrl }: SeoTabProps) {
    const metaTitle = useWatch({ control, name: 'metaTitle' })
    const metaDescription = useWatch({ control, name: 'metaDescription' })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Search className="h-4 w-4" /> SEO &amp; Analytics</CardTitle>
                <CardDescription>Search engine optimization and tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <UiFormInput label="Meta Title" hint="Shown in browser tab and search results (50–60 chars recommended)" error={errors.metaTitle?.message} {...register('metaTitle')} placeholder="My App — Build something great" />
                <p className="-mt-3 text-right text-xs text-muted-foreground">{metaTitle?.length ?? 0}/200</p>
                <UiFormTextarea label="Meta Description" hint="Search engine snippet (150–160 chars recommended)" error={errors.metaDescription?.message} {...register('metaDescription')} placeholder="A short description of your site for search engines…" rows={3} className="resize-none" />
                <p className="-mt-3 text-right text-xs text-muted-foreground">{metaDescription?.length ?? 0}/500</p>
                <UiFormInput label="Meta Keywords" hint="Comma-separated keywords" {...register('metaKeywords')} placeholder="app, dashboard, saas" />
                <Separator />
                <ImageUploader label="OG Image" hint="Shown when shared on social media. 1200×630px recommended." value={ogImageUrl} onChange={(url) => setValue('ogImageUrl', url, { shouldDirty: true })} dropzoneClassName="aspect-[1200/630] w-full max-w-sm" previewClassName="aspect-[1200/630] w-full max-w-sm" />
                <Separator />
                <UiFormInput label="Google Analytics ID" hint="e.g. G-XXXXXXXXXX or UA-XXXXXX-X" {...register('googleAnalyticsId')} placeholder="G-XXXXXXXXXX" className="font-mono" />
            </CardContent>
        </Card>
    )
}
