'use client'

import * as React from 'react'
import { Controller, useFormContext, type FieldError } from 'react-hook-form'

import { UiInput } from '@/components/ui-custom/UiInput'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface UiFormCurrencyInputProps {
    name: string
    label?: string
    hint?: string
    placeholder?: string
    error?: string | FieldError
    disabled?: boolean
    className?: string
}

/** Formats digits with thousand separators while keeping the raw numeric string in form state. */
const formatNumber = (value: unknown) => {
    const digits = String(value ?? '').replace(/\D/g, '')
    if (!digits) return ''
    return Number(digits).toLocaleString('id-ID')
}

export function UiFormCurrencyInput({
    name,
    label,
    hint,
    placeholder = '0',
    error,
    disabled,
    className,
}: UiFormCurrencyInputProps) {
    const { control } = useFormContext()

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className="space-y-1.5">
                    {label && (
                        <Label htmlFor={name} className="text-sm font-medium">
                            {label}
                        </Label>
                    )}
                    <div className="relative">
                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium">
                            Rp
                        </span>
                        <UiInput
                            id={name}
                            inputMode="numeric"
                            autoComplete="off"
                            value={formatNumber(field.value)}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            disabled={disabled}
                            placeholder={placeholder}
                            className={cn(
                                'pl-10',
                                error && 'border-destructive focus-visible:border-destructive',
                                className,
                            )}
                        />
                    </div>
                    {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
                    {error && (
                        <p className="text-destructive text-xs">
                            {typeof error === 'string' ? error : error.message}
                        </p>
                    )}
                </div>
            )}
        />
    )
}

UiFormCurrencyInput.displayName = 'UiFormCurrencyInput'
