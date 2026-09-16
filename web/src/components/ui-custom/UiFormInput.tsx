'use client'

import * as React from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { FieldError } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { UiInput, UiTextarea } from '@/components/ui-custom/UiInput'
import { UiSwitch } from '@/components/ui-custom/UiCheckbox'
import { cn } from '@/lib/utils'

interface UiFormFieldProps extends React.ComponentProps<typeof UiInput> {
    label?: string
    hint?: string
    error?: string | FieldError
}

function UiFormInput({ label, hint, error, className, id, ...props }: UiFormFieldProps) {
    const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
        <div className="space-y-1.5">
            {label && (
                <Label htmlFor={fieldId} className="text-sm font-medium">
                    {label}
                </Label>
            )}
            <UiInput id={fieldId} className={cn(error && 'border-destructive focus-visible:border-destructive', className)} {...props} />
            {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
            {error && (
                <p className="text-destructive text-xs">
                    {typeof error === 'string' ? error : error.message}
                </p>
            )}
        </div>
    )
}

function UiFormTextarea({
    label,
    hint,
    error,
    className,
    id,
    ...props
}: React.ComponentProps<typeof UiTextarea> & {
    label?: string
    hint?: string
    error?: string | FieldError
}) {
    const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
        <div className="space-y-1.5">
            {label && (
                <Label htmlFor={fieldId} className="text-sm font-medium">
                    {label}
                </Label>
            )}
            <UiTextarea id={fieldId} className={cn(error && 'border-destructive focus-visible:border-destructive', className)} {...props} />
            {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
            {error && (
                <p className="text-destructive text-xs">
                    {typeof error === 'string' ? error : error.message}
                </p>
            )}
        </div>
    )
}

function UiFormPassword({
    label,
    hint,
    error,
    className,
    id,
    ...props
}: UiFormFieldProps) {
    const [visible, setVisible] = useState(false)
    const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
        <div className="space-y-1.5">
            {label && (
                <Label htmlFor={fieldId} className="text-sm font-medium">
                    {label}
                </Label>
            )}
            <div className="relative">
                <UiInput
                    id={fieldId}
                    type={visible ? 'text' : 'password'}
                    className={cn('pr-10', error && 'border-destructive focus-visible:border-destructive', className)}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
                    tabIndex={-1}
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
            {error && (
                <p className="text-destructive text-xs">
                    {typeof error === 'string' ? error : error.message}
                </p>
            )}
        </div>
    )
}

function UiFormSwitch({
    label,
    hint,
    id,
    ...props
}: React.ComponentProps<typeof UiSwitch> & {
    label?: string
    hint?: string
}) {
    const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                {label && (
                    <Label htmlFor={fieldId} className="text-sm font-medium">
                        {label}
                    </Label>
                )}
                {hint && <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>}
            </div>
            <UiSwitch id={fieldId} {...props} />
        </div>
    )
}

export { UiFormInput, UiFormTextarea, UiFormSwitch, UiFormPassword }
