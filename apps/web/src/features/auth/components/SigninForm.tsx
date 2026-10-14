'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CircleAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { GoogleSignInButton } from '@/components/google-sign-in'
import { UiButton } from '@/components/ui-custom/UiButton'
import { UiFormInput, UiFormPassword } from '@/components/ui-custom/UiFormInput'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { DASHBOARD_URL, ONBOARDING_URL, SIGNUP_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { authService } from '../services/AuthService'
import { signinValidation, type SigninInputType } from '../types/AuthType'

// Reasons sent back as ?status= by the API's Google callback or by /session-expired
const SIGNIN_STATUS_MESSAGES: Record<string, string> = {
    signup_closed:
        'New accounts are paused during maintenance. Existing accounts can still sign in.',
    email_unverified: 'Your Google account email is not verified, so it cannot be used to sign in.',
    account_disabled: 'This account has been disabled. Contact an administrator for help.',
    error: 'Google sign-in failed. Please try again.',
    session_expired:
        'Your session has ended or was signed out from another device. Please sign in again.',
}

export function SignInForm({ className, ...props }: React.ComponentProps<'form'>) {
    const router = useRouter()
    const status = useSearchParams().get('status')
    const statusMessage = status ? SIGNIN_STATUS_MESSAGES[status] : undefined
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<SigninInputType>({
        resolver: zodResolver(signinValidation),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: SigninInputType) => authService.login(data),
        onSuccess: (response) => {
            const destination = response?.data?.user?.isOnboardingCompleted
                ? DASHBOARD_URL
                : ONBOARDING_URL
            router.push(destination)
            router.refresh()
        },
        onError: (error: any) => {
            setError('email', { type: 'manual', message: ' ' })
            setError('password', {
                type: 'manual',
                message: error.message || 'Invalid email or password',
            })
        },
    })

    const onSubmit = (data: SigninInputType) => {
        mutate(data)
    }

    return (
        <form
            className={cn('mx-auto flex w-full max-w-md flex-col gap-5 sm:gap-6', className)}
            onSubmit={handleSubmit(onSubmit)}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold sm:text-3xl">Welcome Back</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your credentials to access your account
                    </p>
                </div>

                {statusMessage && (
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertDescription>{statusMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Email */}
                <UiFormInput
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    autoComplete="username"
                    isSubmitting={isPending}
                    error={errors.email}
                    {...register('email')}
                />

                {/* Password */}
                <div>
                    <div className="mb-1 flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Link
                            href="/forgot-password"
                            className="ml-auto text-xs whitespace-nowrap underline-offset-4 hover:underline sm:text-sm"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <UiFormPassword
                        id="password"
                        placeholder="your password"
                        autoComplete="current-password"
                        isSubmitting={isPending}
                        error={errors.password}
                        {...register('password')}
                    />
                </div>

                <UiButton type="submit" disabled={isPending} className="mt-2 w-full rounded-full">
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Signing in...
                        </span>
                    ) : (
                        'Sign In'
                    )}
                </UiButton>

                <FieldSeparator>Or login with</FieldSeparator>

                <GoogleSignInButton />

                <p className="text-muted-foreground mt-2 text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link
                        href={SIGNUP_URL}
                        className="hover:text-primary underline underline-offset-4"
                    >
                        Sign up
                    </Link>
                </p>
            </FieldGroup>
        </form>
    )
}
