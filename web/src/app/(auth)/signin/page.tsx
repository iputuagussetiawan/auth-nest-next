import { GalleryVerticalEnd } from 'lucide-react'

import { SignInForm } from '@/features/auth/components/signin-form'

export default function SignupPage() {
    return (
        <div className="grid min-h-svh grid-cols-4">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Acme Inc.
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <SignInForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative col-span-3 hidden lg:block">
                <img
                    src="/images/pages/signup/bg-signup.png"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
