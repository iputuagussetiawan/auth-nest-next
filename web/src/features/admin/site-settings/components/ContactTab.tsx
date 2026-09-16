'use client'

import { Mail } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { UiFormInput, UiFormTextarea } from '@/components/ui-custom/UiFormInput'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { FormValues } from '../types'

export function ContactTab({
    register,
    errors,
}: {
    register: UseFormRegister<FormValues>
    errors: FieldErrors<FormValues>
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-4 w-4" /> Contact Information
                </CardTitle>
                <CardDescription>Displayed on contact pages and footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <UiFormInput
                        label="Contact Email"
                        error={errors.contactEmail?.message}
                        {...register('contactEmail')}
                        type="email"
                        placeholder="hello@example.com"
                    />
                    <UiFormInput
                        label="Phone Number"
                        {...register('contactPhone')}
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
                <UiFormTextarea
                    label="Address"
                    {...register('contactAddress')}
                    placeholder="123 Main Street, City, Country"
                    rows={3}
                    className="resize-none"
                />
            </CardContent>
        </Card>
    )
}
