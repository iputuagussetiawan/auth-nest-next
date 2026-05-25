'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { GoogleSignInButton } from '@/components/google-sign-in'
import { Button } from '@/components/ui/button'
import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import { UiFormInput } from '@/components/ui/UiFormInput'
import { SIGNIN_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { authService } from '../services/auth-service'
import { signupValidation, type SignupInputType } from '../types/auth-type'

export function SignupForm({ className, ...props }: React.ComponentProps<'form'>) {
    const [isRegistered, setIsRegistered] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState('')
    const router = useRouter()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<SignupInputType>({
        resolver: zodResolver(signupValidation),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        },
    })

    const { mutate, isPending } = useMutation({
        // 2. Call the service directly here
        mutationFn: (data: SignupInputType) => authService.register(data),

        onSuccess: (result, variables) => {
            // Since your service likely returns the raw data or throws on error,
            // you might need to adjust this check based on your API's response shape.
            if (result) {
                setRegisteredEmail(variables.email)
                setIsRegistered(true)
            }
        },
        onError: (error: any) => {
            // 3. The service usually throws an error, so handle it here
            setError('email', {
                type: 'manual',
                message: error.message || 'Registration failed',
            })
        },
    })

    const onSubmit = async (data: SignupInputType) => {
        mutate(data)
    }

    if (isRegistered) {
        return (
            <div
                className={cn(
                    'animate-in fade-in zoom-in-95 flex flex-col gap-6 py-4 text-center',
                    className,
                )}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-primary/10 rounded-full p-4">
                        <Mail className="text-primary h-10 w-10" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Check your email</h1>
                        <p className="text-muted-foreground text-sm text-balance">
                            We've sent a verification link to{' '}
                            <span className="text-foreground font-semibold">{registeredEmail}</span>
                            . Please click the link to activate your account.
                        </p>
                    </div>
                </div>

                <div className="bg-muted/50 border-border flex gap-3 rounded-lg border p-4 text-left text-xs">
                    <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                    <p>
                        Didn't receive the email? Check your spam folder or wait a few minutes
                        before trying again.
                    </p>
                </div>

                <Button asChild variant="outline" className="w-full">
                    <Link href={SIGNIN_URL} className="flex items-center justify-center gap-2">
                        Return to Sign In <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
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
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your details below to get started
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <UiFormInput
                        label="First Name"
                        id="firstName"
                        placeholder="John"
                        isSubmitting={isPending}
                        error={errors.firstName}
                        {...register('firstName')}
                    />
                    <UiFormInput
                        label="Last Name"
                        id="lastName"
                        placeholder="Doe"
                        isSubmitting={isPending}
                        error={errors.lastName}
                        {...register('lastName')}
                    />
                </div>

                {/* Email */}
                <UiFormInput
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    isSubmitting={isPending}
                    error={errors.email}
                    {...register('email')}
                />

                {/* Password */}
                <UiFormInput
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    isSubmitting={isPending}
                    error={errors.password}
                    {...register('password')}
                />

                <Button type="submit" disabled={isPending} className="mt-2 w-full">
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Creating account...
                        </span>
                    ) : (
                        'Create Account'
                    )}
                </Button>

                <FieldSeparator>Or continue with</FieldSeparator>

                <GoogleSignInButton />

                <p className="text-muted-foreground mt-2 text-center text-sm">
                    Already have an account?{' '}
                    <Link
                        href={SIGNIN_URL}
                        className="hover:text-primary font-medium underline underline-offset-4"
                    >
                        Sign in
                    </Link>
                </p>
            </FieldGroup>
        </form>
    )
}
