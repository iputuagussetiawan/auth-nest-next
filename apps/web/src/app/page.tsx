import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowRight,
    Briefcase,
    CalendarClock,
    CheckCircle2,
    FileUser,
    GalleryVerticalEnd,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    Wallet,
    Zap,
} from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SIGNIN_URL, SIGNUP_URL } from '@/lib/constants'
import { buildThemeCss } from '@/lib/theme-utils'

import { MaintenancePage } from './maintenance-page'

export const dynamic = 'force-dynamic'

function SiteLogo({
    logoUrl,
    siteName,
    size,
}: {
    logoUrl: string | null
    siteName: string
    size: 'lg' | 'sm'
}) {
    if (logoUrl) {
        return (
            <Image
                src={logoUrl}
                alt={siteName}
                width={size === 'lg' ? 140 : 110}
                height={size === 'lg' ? 32 : 24}
                sizes={size === 'lg' ? '140px' : '110px'}
                className={size === 'lg' ? 'h-8 w-auto max-w-[140px]' : 'h-6 w-auto max-w-[110px]'}
            />
        )
    }
    return (
        <div
            className={`bg-primary text-primary-foreground flex shrink-0 items-center justify-center rounded-md ${
                size === 'lg' ? 'size-7' : 'size-6'
            }`}
        >
            <GalleryVerticalEnd className={size === 'lg' ? 'size-4' : 'size-3.5'} />
        </div>
    )
}

function Navbar({ siteName, logoUrl }: { siteName: string; logoUrl: string | null }) {
    return (
        <header className="border-border/50 bg-background/80 fixed top-0 z-50 w-full border-b backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <SiteLogo logoUrl={logoUrl} siteName={siteName} size="lg" />
                    <span className="text-lg">{siteName}</span>
                </Link>
                <nav className="hidden items-center gap-6 text-sm md:flex">
                    <Link
                        href="#features"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Modules
                    </Link>
                    <Link
                        href="#workflow"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Workflow
                    </Link>
                    <Link
                        href="#results"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Results
                    </Link>
                </nav>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={SIGNIN_URL}>Sign in</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={SIGNUP_URL}>
                            Request demo <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}

function Hero({ siteName }: { siteName: string }) {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
            <div className="bg-primary/10 absolute top-1/3 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl" />

            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Built for modern HR teams
            </Badge>

            <h1 className="max-w-5xl text-5xl leading-tight font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                Run hiring, people ops, and performance in{' '}
                <span className="from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-transparent">
                    one HR system
                </span>
            </h1>

            <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-relaxed sm:text-xl">
                {siteName} helps HR teams centralize employee data, automate leave and attendance,
                manage recruitment, and gain real-time visibility across the workforce.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                    <Link href={SIGNUP_URL}>
                        Start with your team
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                    <Link href={SIGNIN_URL}>Sign in</Link>
                </Button>
            </div>

            <div className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
                {[
                    'Employee records',
                    'Leave & attendance',
                    'Recruitment pipeline',
                    'Role-based access',
                ].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                        <CheckCircle2 className="text-primary h-4 w-4" />
                        {t}
                    </span>
                ))}
            </div>

            <div className="border-border bg-card relative mt-16 w-full max-w-5xl overflow-hidden rounded-2xl border shadow-2xl">
                <div className="bg-muted/50 border-border flex items-center gap-1.5 border-b px-4 py-3">
                    {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c, i) => (
                        <div key={i} className={`h-3 w-3 rounded-full ${c}`} />
                    ))}
                    <div className="bg-background mx-auto w-64 rounded-md px-3 py-1 text-center text-xs text-gray-400">
                        hr.{siteName.toLowerCase().replace(/\s+/g, '-')}.com
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-0 divide-x divide-y sm:grid-cols-4">
                    {[
                        { label: 'Employees', value: '248', color: 'text-blue-500' },
                        { label: 'Open Roles', value: '12', color: 'text-violet-500' },
                        { label: 'Leave Requests', value: '18', color: 'text-emerald-500' },
                        { label: 'Payroll Ready', value: '99%', color: 'text-orange-500' },
                    ].map((s) => (
                        <div key={s.label} className="bg-card p-6 text-center">
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-card grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
                    {[
                        { title: 'Employee Hub', meta: 'Profiles · Documents', icon: Users },
                        { title: 'Attendance', meta: 'Shifts · Time logs', icon: CalendarClock },
                        { title: 'Recruitment', meta: 'Jobs · Candidates', icon: Briefcase },
                        { title: 'Payroll', meta: 'Salary · Benefits', icon: Wallet },
                    ].map((item) => (
                        <div key={item.title} className="bg-muted rounded-lg p-3 text-left text-xs">
                            <div className="bg-primary/10 mb-2 flex h-7 w-7 items-center justify-center rounded-md">
                                <item.icon className="text-primary h-3.5 w-3.5" />
                            </div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-muted-foreground mt-0.5">{item.meta}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const features = [
    {
        icon: FileUser,
        title: 'Employee Records',
        desc: 'Store employee profiles, contracts, documents, and organizational data in one secure workspace.',
        color: 'bg-blue-500/10 text-blue-500',
    },
    {
        icon: CalendarClock,
        title: 'Attendance & Leave',
        desc: 'Track attendance, shift schedules, time-off balances, and approval workflows without spreadsheets.',
        color: 'bg-violet-500/10 text-violet-500',
    },
    {
        icon: Wallet,
        title: 'Payroll Readiness',
        desc: 'Keep compensation, deductions, and HR records aligned so payroll preparation is faster and cleaner.',
        color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
        icon: Briefcase,
        title: 'Recruitment Pipeline',
        desc: 'Manage job openings, candidate stages, interview coordination, and hiring decisions in one flow.',
        color: 'bg-orange-500/10 text-orange-500',
    },
    {
        icon: TrendingUp,
        title: 'Performance Insights',
        desc: 'Monitor headcount, engagement, productivity, and team growth with clear HR analytics.',
        color: 'bg-pink-500/10 text-pink-500',
    },
    {
        icon: ShieldCheck,
        title: 'Access & Compliance',
        desc: 'Protect sensitive HR data with role-based permissions, audit-friendly workflows, and admin controls.',
        color: 'bg-cyan-500/10 text-cyan-500',
    },
]

function Features() {
    return (
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
            <div className="mb-16 text-center">
                <Badge variant="secondary" className="mb-4">
                    Core modules
                </Badge>
                <h2 className="text-4xl font-bold tracking-tight">
                    Everything HR needs in one place
                </h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
                    Replace scattered spreadsheets and disconnected tools with one platform for
                    people operations.
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f) => (
                    <div
                        key={f.title}
                        className="bg-card border-border group rounded-2xl border p-6 transition-shadow hover:shadow-lg"
                    >
                        <div
                            className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}
                        >
                            <f.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mb-2 font-semibold">{f.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

const steps = [
    {
        step: '01',
        title: 'Set up your company',
        desc: 'Configure teams, roles, locations, policies, and permissions for your HR workflow.',
    },
    {
        step: '02',
        title: 'Centralize people data',
        desc: 'Import employees, contracts, leave balances, and historical HR records into one source of truth.',
    },
    {
        step: '03',
        title: 'Automate daily operations',
        desc: 'Run onboarding, attendance, leave approvals, recruitment, and admin tasks with less manual effort.',
    },
    {
        step: '04',
        title: 'Track workforce results',
        desc: 'Use live dashboards to monitor headcount, hiring velocity, compliance, and people performance.',
    },
]

function HowItWorks() {
    return (
        <section id="workflow" className="bg-muted/40 py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-16 text-center">
                    <Badge variant="secondary" className="mb-4">
                        Workflow
                    </Badge>
                    <h2 className="text-4xl font-bold tracking-tight">
                        Launch a stronger HR operation in 4 steps
                    </h2>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((s, i) => (
                        <div key={s.step} className="relative">
                            {i < steps.length - 1 && (
                                <div className="bg-border absolute top-6 left-full hidden h-px w-full lg:block" />
                            )}
                            <div className="bg-primary text-primary-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold">
                                {s.step}
                            </div>
                            <h3 className="mb-2 font-semibold">{s.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const stats = [
    { value: '10x', label: 'Less manual HR admin' },
    { value: '99%', label: 'Payroll prep accuracy' },
    { value: '3x', label: 'Faster hiring coordination' },
    { value: '24/7', label: 'Visibility into people data' },
]

function Stats() {
    return (
        <section id="results" className="mx-auto max-w-6xl px-6 py-24">
            <div className="from-primary/5 grid gap-8 rounded-3xl bg-gradient-to-br to-violet-500/5 p-12 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="text-center">
                        <p className="from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-5xl font-extrabold text-transparent">
                            {s.value}
                        </p>
                        <p className="text-muted-foreground mt-2 text-sm">{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

const testimonials = [
    {
        name: 'Alicia R.',
        role: 'HR Manager',
        text: 'We moved employee data, leave approvals, and recruitment into one workflow. Our HR team finally works from a single source of truth.',
    },
    {
        name: 'Daniel S.',
        role: 'People Operations Lead',
        text: 'The dashboards make it easy to spot hiring bottlenecks, attendance issues, and team growth trends without chasing spreadsheets.',
    },
    {
        name: 'Maya T.',
        role: 'Operations Director',
        text: 'What used to take days across payroll prep, onboarding, and policy tracking now takes hours with cleaner approvals and better visibility.',
    },
]

function Testimonials() {
    return (
        <section className="bg-muted/40 py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-16 text-center">
                    <Badge variant="secondary" className="mb-4">
                        Customer stories
                    </Badge>
                    <h2 className="text-4xl font-bold tracking-tight">
                        Trusted by growing HR teams
                    </h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                    {testimonials.map((t) => (
                        <div key={t.name} className="bg-card border-border rounded-2xl border p-6">
                            <div className="mb-4 flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                    />
                                ))}
                            </div>
                            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                                "{t.text}"
                            </p>
                            <div>
                                <p className="text-sm font-semibold">{t.name}</p>
                                <p className="text-muted-foreground text-xs">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function CTA() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-24">
            <div className="from-primary relative overflow-hidden rounded-3xl bg-gradient-to-br to-violet-600 p-12 text-center text-white">
                <div
                    className="absolute inset-0 -z-10 opacity-20"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                <Zap className="mx-auto mb-4 h-10 w-10 opacity-90" />
                <h2 className="mb-4 text-4xl font-extrabold tracking-tight">
                    Ready to modernize your HR system?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
                    Bring hiring, employee management, leave, payroll readiness, and reporting into
                    one streamlined platform.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="h-12 px-8 text-base font-semibold"
                        asChild
                    >
                        <Link href={SIGNUP_URL}>
                            Get started <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-12 border-white/40 px-8 text-base text-white hover:bg-white/10 hover:text-white"
                        asChild
                    >
                        <Link href={SIGNIN_URL}>Sign in</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

function Footer({ siteName, logoUrl }: { siteName: string; logoUrl: string | null }) {
    return (
        <footer className="border-border border-t py-10">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <SiteLogo logoUrl={logoUrl} siteName={siteName} size="sm" />
                    {siteName}
                </Link>
                <p className="text-muted-foreground text-sm">
                    © {new Date().getFullYear()} {siteName}. All rights reserved.
                </p>
                <div className="flex gap-4 text-sm">
                    <Link
                        href={SIGNIN_URL}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Sign in
                    </Link>
                    <Link
                        href={SIGNUP_URL}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </footer>
    )
}

interface SiteData {
    themeCss: string
    maintenanceMode: boolean
    maintenanceMessage: string | null
    siteName: string
    logoUrl: string | null
}

async function getSiteData(): Promise<SiteData> {
    const base = process.env.BACKEND_URL

    if (!base) {
        return {
            themeCss: '',
            maintenanceMode: false,
            maintenanceMessage: null,
            siteName: 'HR System',
            logoUrl: null,
        }
    }

    const [themeRes, settingsRes] = await Promise.allSettled([
        fetch(`${base}/themes/active`, { next: { revalidate: 60 } }),
        fetch(`${base}/site-settings`, { cache: 'no-store' }),
    ])

    let themeCss = ''
    if (themeRes.status === 'fulfilled' && themeRes.value.ok) {
        try {
            const json = await themeRes.value.json()
            const config = json?.data?.config
            if (config) themeCss = buildThemeCss(config)
        } catch {}
    }

    let maintenanceMode = false
    let maintenanceMessage: string | null = null
    let siteName = 'HR System'
    let logoUrl: string | null = null

    if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
        try {
            const json = await settingsRes.value.json()
            const s = json?.data
            if (s) {
                maintenanceMode = s.maintenanceMode ?? false
                maintenanceMessage = s.maintenanceMessage ?? null
                siteName = s.siteName ?? 'HR System'
                logoUrl = s.logoUrl ?? null
            }
        } catch {}
    }

    return { themeCss, maintenanceMode, maintenanceMessage, siteName, logoUrl }
}

export default async function LandingPage() {
    const { themeCss, maintenanceMode, maintenanceMessage, siteName, logoUrl } = await getSiteData()

    if (maintenanceMode) {
        return (
            <MaintenancePage
                siteName={siteName}
                message={maintenanceMessage}
                logoUrl={logoUrl}
                themeCss={themeCss}
            />
        )
    }

    return (
        <div className="min-h-screen">
            {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
            <Navbar siteName={siteName} logoUrl={logoUrl} />
            <Hero siteName={siteName} />
            <Features />
            <HowItWorks />
            <Stats />
            <Testimonials />
            <CTA />
            <Footer siteName={siteName} logoUrl={logoUrl} />
        </div>
    )
}
