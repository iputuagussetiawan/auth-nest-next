'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2, Timer } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { UiFormInput } from '@/components/ui/UiFormInput'
import { SIGNIN_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { authService } from '../services/auth-service'
import { resetPasswordValidation, type ResetPasswordInputType } from '../types/auth-type'

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'form'>) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const verificationCode = searchParams.get('code')
    const expiration = Number(searchParams.get('exp'))

    const [timeLeft, setTimeLeft] = useState<string>('00:00')
    const [isExpired, setIsExpired] = useState(false)

    // 1. Setup the Mutation
    const { mutate, isPending, isSuccess, error, isError } = useMutation({
        mutationFn: (data: any) => authService.resetPassword(data),
        onSuccess: () => {
            // Auto-redirect after 3 seconds on success
            setTimeout(() => router.push(SIGNIN_URL), 3000)
        },
    })

    // --- Timer Logic (Unchanged but kept for functionality) ---
    const calculateTimeLeft = useCallback(() => {
        if (!expiration) {
            setIsExpired(true)
            return
        }
        const expiryDate = new Date(expiration).getTime()
        const now = new Date().getTime()

        if (isNaN(expiryDate)) {
            setIsExpired(true)
            return
        }

        const difference = expiryDate - now
        if (difference <= 0) {
            setIsExpired(true)
            setTimeLeft('00:00')
            return
        }

        const minutes = Math.floor((difference / 1000 / 60) % 60)
        const seconds = Math.floor((difference / 1000) % 60)
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, [expiration])

    useEffect(() => {
        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)
        return () => clearInterval(timer)
    }, [calculateTimeLeft])
    // ---------------------------------------------------------

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordInputType>({
        resolver: zodResolver(resetPasswordValidation),
        defaultValues: { password: '' },
    })

    const onSubmit = (data: ResetPasswordInputType) => {
        if (!verificationCode) return
        mutate({
            password: data.password,
            verificationCode: verificationCode,
        })
    }

    // 2. Expired State
    if (isExpired || !verificationCode) {
        return (
            <div
                className={cn('animate-in fade-in flex flex-col gap-6 py-8 text-center', className)}
            >
                <AlertCircle className="text-destructive mx-auto h-12 w-12" />
                <h1 className="text-destructive text-2xl font-bold">Link Expired</h1>
                <p className="text-muted-foreground text-sm">
                    This reset link is no longer valid or has expired.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/forgot-password">Request New Link</Link>
                </Button>
            </div>
        )
    }

    // 3. Success State
    if (isSuccess) {
        return (
            <div
                className={cn(
                    'animate-in fade-in zoom-in-95 flex flex-col gap-6 text-center',
                    className,
                )}
            >
                <div className="flex flex-col gap-2">
                    <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                        <CheckCircle2 className="text-primary h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-bold">Password Updated!</h1>
                    <p className="text-muted-foreground text-sm">
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                </div>
                <Button asChild className="w-full">
                    <Link href={SIGNIN_URL}>Go to Login Now</Link>
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
                    <h1 className="text-2xl font-bold">Set New Password</h1>
                    <p className="text-muted-foreground text-sm">
                        Please enter your new password below
                    </p>
                </div>

                {/* Timer Display */}
                <div
                    className={cn(
                        'flex items-center justify-center gap-2 self-center rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                        timeLeft.startsWith('00')
                            ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse'
                            : 'bg-primary/5 text-primary border-primary/10',
                    )}
                >
                    <Timer className="h-3.5 w-3.5" />
                    <span>Expires in: {timeLeft}</span>
                </div>

                {/* Server Error Display */}
                {isError && (
                    <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border p-3 text-center text-xs">
                        {(error as any)?.message || 'Failed to reset password'}
                    </div>
                )}

                <UiFormInput
                    label="New Password"
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
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                        </span>
                    ) : (
                        'Reset Password'
                    )}
                </Button>
            </FieldGroup>
        </form>
    )
}
