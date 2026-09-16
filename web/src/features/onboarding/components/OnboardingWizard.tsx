'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ClipboardCheck, Loader2, Palette, UserRound } from 'lucide-react'

import { accountService } from '@/features/admin/account/services/AccountService'
import { adminThemeService } from '@/features/admin/themes/services/ThemeService'
import type { ITheme } from '@/features/admin/themes/types/ThemeTypes'
import { authService } from '@/features/auth/services/AuthService'
import { UiButton } from '@/components/ui-custom/UiButton'
import { UiFormInput } from '@/components/ui-custom/UiFormInput'
import { DASHBOARD_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

const STEPS = [
    { key: 'profile', title: 'Profile', description: 'Tell us who you are', icon: UserRound },
    { key: 'theme', title: 'Appearance', description: 'Pick a color theme', icon: Palette },
    { key: 'review', title: 'Review', description: 'Finish setup', icon: ClipboardCheck },
] as const

export function OnboardingWizard() {
    const router = useRouter()
    const qc = useQueryClient()
    const [step, setStep] = useState(0)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)

    const { data: meData, isLoading: meLoading } = useQuery({
        queryKey: ['user'],
        queryFn: accountService.getMe,
    })

    const me = meData?.data
    const profileReady = Boolean(me)

    useEffect(() => {
        if (me?.isOnboardingCompleted) router.replace(DASHBOARD_URL)
    }, [me?.isOnboardingCompleted, router])

    const { data: themesData } = useQuery({
        queryKey: ['themes-list'],
        queryFn: adminThemeService.listPublic,
        enabled: profileReady,
    })
    const themes: ITheme[] = useMemo(() => themesData?.data ?? [], [themesData])

    const finishMutation = useMutation({
        mutationFn: async () => {
            // Optional wizard choices must not block the completion flag.
            try {
                if (firstName.trim() || lastName.trim()) {
                    await accountService.updateProfile({
                        firstName: firstName.trim() || me?.firstName || '',
                        lastName: lastName.trim() || me?.lastName || '',
                    })
                }
                if (selectedThemeId) await adminThemeService.setPreference(selectedThemeId)
            } catch {
                // The required completion request still runs below.
            }

            return authService.completeOnboarding()
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['user'] })
            router.replace(DASHBOARD_URL)
            router.refresh()
        },
    })

    if (meLoading || !me) {
        return (
            <div className="text-muted-foreground flex min-h-screen items-center justify-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
        )
    }

    const canFinish = !finishMutation.isPending

    const handleFinish = () => {
        finishMutation.mutate()
    }

    return (
        <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-10">
            <div className="border-border/60 bg-card w-full max-w-xl space-y-6 rounded-3xl border p-6 shadow-sm sm:p-8">
                {/* Progress */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                            Step {step + 1} of {STEPS.length}
                        </p>
                        <p className="text-muted-foreground text-xs">{STEPS[step].description}</p>
                    </div>
                    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                        <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step 1: Profile */}
                {step === 0 && (
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-xl font-semibold">
                                Welcome, {me.firstName || me.email}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Confirm your name to personalize your account.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <UiFormInput
                                label="First name"
                                value={firstName || me.firstName || ''}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First name"
                            />
                            <UiFormInput
                                label="Last name"
                                value={lastName || me.lastName || ''}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last name"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Theme */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-xl font-semibold">Choose your look</h1>
                            <p className="text-muted-foreground text-sm">
                                Pick a color theme. You can change this later in settings.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {themes.map((theme) => {
                                const selected = selectedThemeId === theme.id
                                return (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        onClick={() => setSelectedThemeId(theme.id)}
                                        className={cn(
                                            'border-border/60 hover:bg-muted/40 relative rounded-2xl border p-3 text-left transition-colors',
                                            selected &&
                                                'border-primary ring-primary/30 bg-primary/5 ring-2',
                                        )}
                                    >
                                        <p className="truncate text-sm font-medium">{theme.name}</p>
                                        <div className="mt-2 flex gap-1">
                                            {[
                                                theme.config.light.primary,
                                                theme.config.light.accent,
                                                theme.config.light.background,
                                            ].map((color, index) => (
                                                <span
                                                    key={index}
                                                    className="h-5 w-5 rounded-full border"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        {selected && (
                                            <span className="bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-0.5">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-3">
                        <div>
                            <h1 className="text-xl font-semibold">Ready to go?</h1>
                            <p className="text-muted-foreground text-sm">
                                Review your choices, then finish setting up your account.
                            </p>
                        </div>
                        <div className="bg-muted/40 space-y-2 rounded-2xl p-4 text-sm">
                            <p>
                                <span className="text-muted-foreground">Name:</span>{' '}
                                {firstName || me.firstName || 'Not set'}{' '}
                                {lastName || me.lastName || ''}
                            </p>
                            <p>
                                <span className="text-muted-foreground">Theme:</span>{' '}
                                {themes.find((theme) => theme.id === selectedThemeId)?.name ??
                                    'Default theme'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <UiButton
                        variant="ghost"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0}
                    >
                        Back
                    </UiButton>
                    {step < STEPS.length - 1 ? (
                        <UiButton onClick={() => setStep((s) => s + 1)}>Continue</UiButton>
                    ) : (
                        <UiButton onClick={handleFinish} disabled={!canFinish}>
                            {finishMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Finish'
                            )}
                        </UiButton>
                    )}
                </div>
            </div>
        </div>
    )
}
