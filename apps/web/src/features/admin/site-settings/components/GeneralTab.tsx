'use client'

import { Globe } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { UiFormInput, UiFormTextarea } from '@/components/ui-custom/UiFormInput'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { FormValues } from '../types'

interface GeneralTabProps {
    register: UseFormRegister<FormValues>
    errors: FieldErrors<FormValues>
}

export function GeneralTab({ register, errors }: GeneralTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" /> General Info
                </CardTitle>
                <CardDescription>Basic site identity shown across the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <UiFormInput
                    label="Site Name"
                    error={errors.siteName?.message}
                    {...register('siteName')}
                    placeholder="My App"
                />
                <UiFormInput
                    label="Tagline"
                    hint="Short slogan shown under the site name"
                    {...register('tagline')}
                    placeholder="Build something great"
                />
                <UiFormTextarea
                    label="Description"
                    hint="Used in About sections and meta tags"
                    {...register('description')}
                    placeholder="A brief description of your site…"
                    rows={4}
                    className="resize-none"
                />
            </CardContent>
        </Card>
    )
}
