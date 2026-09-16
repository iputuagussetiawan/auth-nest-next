import type { Metadata } from 'next'

import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard'

export const metadata: Metadata = { title: 'Onboarding' }

export default function OnboardingPage() {
    return <OnboardingWizard />
}
