import React, { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'

import { Field, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

import { AutoSuggest } from './UiAutoSuggest'

// Definisikan Props yang menggabungkan props AutoSuggest + Form Wrapper
interface UiFormAutoSuggestProps<T> {
    label?: string
    error?: FieldError
    isSubmitting?: boolean
    id?: string
    items: T[]
    value: string
    onValueChange: (value: string) => void
    onSelect: (item: T) => void
    placeholder?: string
    getSearchValue: (item: T) => string
    renderItem: (item: T) => React.ReactNode
    className?: string
}

export const UiFormAutoSuggest = forwardRef<HTMLInputElement, UiFormAutoSuggestProps<any>>(
    ({ label, error, isSubmitting, id, className, ...props }, ref) => {
        const isInvalid = !!error

        return (
            <Field>
                {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

                <div
                    className={cn(
                        'rounded-md border transition-colors',
                        isInvalid
                            ? 'border-destructive focus-within:ring-destructive focus-within:ring-1'
                            : 'border-input',
                        isSubmitting && 'cursor-not-allowed opacity-50',
                        className,
                    )}
                >
                    <AutoSuggest {...props} ref={ref} placeholder={props.placeholder} />
                </div>

                {error && <span className="text-destructive mt-1 text-xs">{error.message}</span>}
            </Field>
        )
    },
)

UiFormAutoSuggest.displayName = 'UiFormAutoSuggest'
