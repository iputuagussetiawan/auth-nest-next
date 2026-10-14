import React, { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'

import { Field, FieldLabel } from '@/components/ui/field' // Adjust paths
import { Input } from '@/components/ui/input'

interface UiFormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: FieldError
    isSubmitting?: boolean
}

export const UiFormInput = forwardRef<HTMLInputElement, UiFormInputProps>(
    ({ label, error, isSubmitting, id, className, ...props }, ref) => {
        const isInvalid = !!error
        return (
            <Field>
                {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
                <Input
                    {...props}
                    id={id}
                    ref={ref} // 🗝️ Vital for React Hook Form register
                    aria-invalid={isInvalid}
                    disabled={isSubmitting}
                    className={`${className} ${
                        error ? 'border-destructive focus-visible:ring-destructive' : ''
                    }`}
                />
                {error && <span className="text-destructive mt-1 text-xs">{error.message}</span>}
            </Field>
        )
    },
)

UiFormInput.displayName = 'UiFormInput'
