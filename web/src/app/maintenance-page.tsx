import { GalleryVerticalEnd, Clock, Wrench } from 'lucide-react'

interface MaintenancePageProps {
    siteName?: string
    message?: string | null
    logoUrl?: string | null
    themeCss?: string
}

export function MaintenancePage({ siteName = 'Acme Inc.', message, logoUrl, themeCss }: MaintenancePageProps) {
    const displayMessage =
        message?.trim() ||
        "We're currently performing scheduled maintenance. We'll be back shortly!"

    return (
        <div className="min-h-screen bg-background text-foreground">
            {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}

            <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
                {/* Glow */}
                <div className="bg-primary/10 pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

                {/* Logo / brand */}
                <div className="mb-10 flex flex-col items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt={siteName} className="max-h-12 max-w-[160px] object-contain" />
                    ) : (
                        <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl">
                            <GalleryVerticalEnd className="size-6" />
                        </div>
                    )}
                    <span className="text-xl font-semibold">{siteName}</span>
                </div>

                {/* Icon */}
                <div className="bg-primary/10 mb-6 flex size-20 items-center justify-center rounded-2xl">
                    <Wrench className="text-primary size-9" />
                </div>

                {/* Heading */}
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Under Maintenance
                </h1>

                {/* Message */}
                <p className="text-muted-foreground mb-10 max-w-md text-lg leading-relaxed">
                    {displayMessage}
                </p>

                {/* Status pill */}
                <div className="border-border bg-card flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm shadow-sm">
                    <span className="bg-primary/80 inline-block size-2 animate-pulse rounded-full" />
                    <Clock className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground">Working on it — we'll be back soon</span>
                </div>
            </div>
        </div>
    )
}
