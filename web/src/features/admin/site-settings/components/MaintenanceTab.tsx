'use client'

import { TriangleAlert } from 'lucide-react'
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UiFormSwitch, UiFormTextarea } from '@/components/ui-custom/UiFormInput'
import type { FormValues } from '../types'

interface MaintenanceTabProps {
    register: UseFormRegister<FormValues>
    setValue: UseFormSetValue<FormValues>
    maintenanceMode: boolean
}

export function MaintenanceTab({ register, setValue, maintenanceMode }: MaintenanceTabProps) {
    return (
        <Card className={maintenanceMode ? 'border-destructive/50 ring-1 ring-destructive/30' : ''}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <TriangleAlert className={`h-4 w-4 ${maintenanceMode ? 'text-destructive' : ''}`} />
                    Maintenance Mode
                </CardTitle>
                <CardDescription>When enabled, visitors see a maintenance page. Admins can still log in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <UiFormSwitch
                    id="maintenance-mode"
                    label="Enable Maintenance Mode"
                    hint="Public access will be blocked"
                    checked={maintenanceMode}
                    onCheckedChange={(v) => setValue('maintenanceMode', v, { shouldDirty: true })}
                />
                {maintenanceMode && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
                        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                            <TriangleAlert className="h-4 w-4" /> Maintenance mode is active
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Your site is currently in maintenance mode. Save to apply changes.</p>
                    </div>
                )}
                <UiFormTextarea label="Maintenance Message" hint="Shown to visitors during maintenance" {...register('maintenanceMessage')} placeholder="We're currently performing maintenance. We'll be back shortly!" rows={3} className="resize-none" />
            </CardContent>
        </Card>
    )
}
