import { ThemeToggle } from '@/components/theme-toggle'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function PreferencesSettings() {
    return (
        <div className="max-w-3xl space-y-8 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
                <p className="text-muted-foreground mt-1">
                    Choose how you want the application to look and behave
                </p>
            </div>

            {/* Appearance Section */}
            <section className="space-y-6">
                <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Appearance
                </h2>
                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-medium">Theme</Label>
                        <p className="text-muted-foreground text-sm">
                            Choose a theme for the application on this device
                        </p>
                    </div>
                    <ThemeToggle />
                </div>
            </section>

            {/* Language & Time Section */}
            {/* <section className="space-y-6">
                <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Language & Time
                </h2>
                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-medium">Theme</Label>
                        <p className="text-muted-foreground text-sm">
                            Choose a theme for the application on this device
                        </p>
                    </div>
                    <ThemeToggle />
                </div>
            </section> */}
        </div>
    )
}
