'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { SIGNIN_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { authService } from '../services/auth-service'
import { type IVerifyInputType } from '../types/auth-type'

export function ConfirmAccountForm({ className, ...props }: React.ComponentProps<'form'>) {
    const searchParams = useSearchParams()
    const verificationCode = searchParams.get('code')

    const { mutate, isPending, isSuccess, error, isError } = useMutation({
        mutationFn: (data: IVerifyInputType) => authService.verify(data),
        // Optional: Auto-redirect after 3 seconds on success
        onSuccess: () => {
            setTimeout(() => {
                // window.location.assign(SIGNIN_URL)
            }, 3000)
        },
    })

    const { handleSubmit } = useForm<IVerifyInputType>({
        defaultValues: {
            code: verificationCode || '',
        },
    })

    const onSubmit = () => {
        if (!verificationCode) return
        mutate({ code: verificationCode })
    }

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
                    <h1 className="text-2xl font-bold">Account Verified!</h1>
                    <p className="text-muted-foreground text-sm">
                        Your email has been successfully confirmed. You are being redirected to the
                        login page...
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
                    <h1 className="text-2xl font-bold">Verify Your Account</h1>
                    <p className="text-muted-foreground text-sm">
                        Thank you for joining us! Please click the button below to verify your email
                        and activate your account.
                    </p>
                </div>

                {isError && (
                    <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-md border p-3 text-left text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{(error as any)?.message || 'Invalid or expired verification link.'}</p>
                    </div>
                )}

                <Button type="submit" disabled={isPending} className="mt-2 w-full">
                    {isPending ? 'Verifying...' : 'Verify My Account'}
                </Button>
            </FieldGroup>
        </form>
    )
}
