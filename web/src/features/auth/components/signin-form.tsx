'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation' // 🗝️ For redirecting after login
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { GoogleSignInButton } from '@/components/google-sign-in'
import { Button } from '@/components/ui/button'
import { FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { UiFormInput } from '@/components/ui/UiFormInput'
import { DASHBOARD_URL, ONBOARDING_URL, SIGNUP_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { authService } from '../services/auth-service'
import { signinValidation, type SigninInputType } from '../types/auth-type'

export function SignInForm({ className, ...props }: React.ComponentProps<'form'>) {
    const router = useRouter()
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
        onSuccess: (result) => {
            // Adjust this based on whether your service returns a boolean or throws
            if (result) {
                router.push(DASHBOARD_URL)
                router.refresh()
            }
        },
        onError: (error: any) => {
            // Highlight fields on failure
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
            className={cn('flex flex-col gap-6', className)}
            onSubmit={handleSubmit(onSubmit)}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your credentials to access your account
                    </p>
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
                <div>
                    <div className="mb-1 flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Link
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <UiFormInput
                        id="password"
                        type="password"
                        placeholder="your password"
                        isSubmitting={isPending}
                        error={errors.email}
                        {...register('password')}
                    />
                </div>

                <Button type="submit" disabled={isPending} className="mt-2 w-full">
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Signing in...
                        </span>
                    ) : (
                        'Sign In'
                    )}
                </Button>

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
