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
                        <Label className="text-base font-medium">Language</Label>
                        <p className="text-muted-foreground text-sm">
                            Choose the language you want to use
                        </p>
                    </div>
                    <Select defaultValue="en">
                        <SelectTrigger className="bg-secondary/50 w-[180px]">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English (US)</SelectItem>
                            <SelectItem value="id">Indonesia</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-medium">
                            Always show text direction controls
                        </Label>
                        <p className="text-muted-foreground max-w-md text-sm">
                            Show the option to change text direction in the editor.
                        </p>
                    </div>
                    <Switch />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-medium">Start week on Monday</Label>
                        <p className="text-muted-foreground text-sm">
                            This will affect the way your calendars appear.
                        </p>
                    </div>
                    <Switch />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-medium">Date format</Label>
                        <p className="text-muted-foreground text-sm">
                            Set the default format for date mentions
                        </p>
                    </div>
                    <Select defaultValue="relative">
                        <SelectTrigger className="bg-secondary/50 w-[120px]">
                            <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="relative">Relative</SelectItem>
                            <SelectItem value="absolute">Absolute</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-medium">
                            Set time zone automatically using your location
                        </Label>
                        <p className="text-muted-foreground max-w-md text-sm">
                            Notifications and emails will be delivered based on your time zone.
                        </p>
                    </div>
                    <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                        <Label className="text-base font-medium">Time zone</Label>
                        <p className="text-muted-foreground text-sm">Choose your time zone</p>
                    </div>
                    <Select disabled defaultValue="makassar">
                        <SelectTrigger className="bg-secondary/50 w-[240px]">
                            <SelectValue placeholder="(GMT+8:00) Makassar" />
                        </SelectTrigger>
                    </Select>
                </div>
            </section> */}
        </div>
    )
}
