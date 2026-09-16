'use client'

import { Share2 } from 'lucide-react'
import type { UseFormRegister } from 'react-hook-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UiFormInput } from '@/components/ui-custom/UiFormInput'

import type { FormValues } from '../types'

const SOCIAL_FIELDS = [
    { key: 'socialTwitter', label: 'X / Twitter', placeholder: 'https://x.com/yourhandle' },
    { key: 'socialFacebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
    { key: 'socialInstagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
    { key: 'socialLinkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourco' },
    { key: 'socialYoutube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
] as const

export function SocialTab({ register }: { register: UseFormRegister<FormValues> }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Share2 className="h-4 w-4" /> Social Media</CardTitle>
                <CardDescription>Links to your social profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                    <UiFormInput key={key} label={label} {...register(key)} placeholder={placeholder} />
                ))}
            </CardContent>
        </Card>
    )
}
