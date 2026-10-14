import React, { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'

import { Field, FieldLabel } from '@/components/ui/field' // Adjust paths based on your project
import { Textarea } from '@/components/ui/textarea' // Ensure this component exists in your UI folder
import { cn } from '@/lib/utils' // Standard Shadcn utility for merging classes

interface UiFormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: FieldError
    isSubmitting?: boolean
}

export const UiFormTextarea = forwardRef<HTMLTextAreaElement, UiFormTextareaProps>(
    ({ label, error, isSubmitting, id, className, ...props }, ref) => {
        const isInvalid = !!error

        return (
            <Field className="w-full">
                {label && (
                    <FieldLabel htmlFor={id} className="mb-2 block">
                        {label}
                    </FieldLabel>
                )}

                <Textarea
                    {...props}
                    id={id}
                    ref={ref} // 🗝️ Vital for React Hook Form register
                    aria-invalid={isInvalid}
                    disabled={isSubmitting}
                    className={cn(
                        'min-h-30 resize-none', // Default height and prevents messy resizing
                        error ? 'border-destructive focus-visible:ring-destructive' : '',
                        className,
                    )}
                />

                {error && (
                    <p className="text-destructive mt-1.5 text-xs font-medium">{error.message}</p>
                )}
            </Field>
        )
    },
)

UiFormTextarea.displayName = 'UiFormTextarea'
