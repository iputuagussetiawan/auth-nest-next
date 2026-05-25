'use client'

import React from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { UiFormInput } from '@/components/ui/UiFormInput'
import { SIGNIN_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { authService } from '../services/auth-service'
import { forgotPasswordValidation, type ForgotPasswordInputType } from '../types/auth-type'

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'form'>) {
    const { mutate, isPending, isSuccess, reset, error, isError } = useMutation({
        mutationFn: (data: ForgotPasswordInputType) => authService.forgotPassword(data),
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordInputType>({
        resolver: zodResolver(forgotPasswordValidation),
        defaultValues: { email: '' },
    })

    const onSubmit = (data: ForgotPasswordInputType) => {
        mutate(data)
    }

    if (isSuccess) {
        return (
            <div
                className={cn(
                    'animate-in fade-in zoom-in-95 flex flex-col gap-6 text-center duration-300',
                    className,
                )}
            >
                <div className="flex flex-col gap-2">
                    <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                        <span className="text-primary text-xl">📧</span>
                    </div>
                    <h1 className="text-2xl font-bold">Check your email</h1>
                    <p className="text-muted-foreground text-sm">
                        If an account exists for that email, we&apos;ve sent a password reset link.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full">
                        <Link href={SIGNIN_URL}>Return to Sign In</Link>
                    </Button>
                    <button
                        onClick={() => reset()} // React Query's reset() clears the isSuccess state
                        className="text-muted-foreground text-xs hover:underline"
                    >
                        Didn&apos;t get the email? Try again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <form
            className={cn('flex flex-col gap-6', className)}
            onSubmit={handleSubmit(onSubmit)}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Forgot Password?</h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your email and we&apos;ll send you a link to reset your password
                    </p>
                </div>

                {isError && (
                    <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-md border p-3 text-center text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{(error as any)?.message || 'Could not process request'}</p>
                    </div>
                )}

                <UiFormInput
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    isSubmitting={isPending}
                    error={errors.email}
                    {...register('email')}
                />

                <Button type="submit" disabled={isPending} className="mt-2 w-full">
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Sending link...
                        </span>
                    ) : (
                        'Send Reset Link'
                    )}
                </Button>

                <p className="text-muted-foreground mt-2 text-center text-sm">
                    Remember your password?{' '}
                    <Link
                        href={SIGNIN_URL}
                        className="hover:text-primary font-medium underline underline-offset-4"
                    >
                        Back to login
                    </Link>
                </p>
            </FieldGroup>
        </form>
    )
}
