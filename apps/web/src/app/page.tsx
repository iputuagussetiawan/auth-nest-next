import Link from 'next/link'
import {
    ArrowRight,
    Building2,
    CalendarClock,
    Check,
    FileUser,
    GalleryVerticalEnd,
    Sparkles,
    Zap,
} from 'lucide-react'

import { HomeLink } from '@/components/home-link'
import { LandingFeatures } from '@/components/landing-features'
import { LandingHero } from '@/components/landing-hero'
import { LandingNav } from '@/components/landing-nav'
import {
    CountUp,
    Float,
    MotionRoot,
    Reveal,
    RevealGroup,
    RevealItem,
    StrikeThrough,
} from '@/components/motion-reveal'
import { TestimonialsCarousel, type Testimonial } from '@/components/testimonials-carousel'
import { ThemeToggle } from '@/components/theme-toggle'
import { UiImage } from '@/components/ui-custom/UiImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { currentClientIpHeaders } from '@/lib/client-ip'
import { SIGNIN_URL, SIGNUP_URL } from '@/lib/constants'
import { features } from '@/lib/landing-features'
import { buildThemeCss } from '@/lib/theme-utils'

import { MaintenancePage } from './maintenance-page'

export const dynamic = 'force-dynamic'

function Navbar({ siteName, logoUrl }: { siteName: string; logoUrl: string | null }) {
    return (
        <header className="border-border/50 bg-background/80 fixed top-0 z-50 w-full border-b backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <HomeLink className="group flex items-center gap-2 font-semibold">
                    {logoUrl ? (
                        <UiImage
                            src={logoUrl}
                            alt={siteName}
                            width={28}
                            height={28}
                            className="size-7 rounded-lg object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12 motion-reduce:transition-none"
                        />
                    ) : (
                        <div className="bg-primary text-primary-foreground group-hover:shadow-primary/40 flex size-7 items-center justify-center rounded-lg transition-[transform,box-shadow] duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12 group-hover:shadow-md motion-reduce:transition-none">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                    )}
                    <span className="group-hover:text-primary text-lg transition-colors duration-300">
                        {siteName}
                    </span>
                </HomeLink>
                <LandingNav />
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={SIGNIN_URL}>Sign in</Link>
                    </Button>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}

function SectionHeading({ badge, title, desc }: { badge: string; title: string; desc?: string }) {
    return (
        <RevealGroup className="mb-16 text-center" amount={0.5}>
            <RevealItem>
                <Badge variant="secondary" className="mb-4">
                    {badge}
                </Badge>
            </RevealItem>
            <RevealItem as="h2" className="text-4xl font-bold tracking-tight">
                {title}
            </RevealItem>
            {desc && (
                <RevealItem as="p" className="text-muted-foreground mx-auto mt-4 max-w-2xl">
                    {desc}
                </RevealItem>
            )}
        </RevealGroup>
    )
}

const steps = [
    {
        step: '01',
        icon: Building2,
        title: 'Set up your company',
        desc: 'Configure departments, roles, work locations, and permissions for your HR team.',
        modules: ['Employee Records'],
    },
    {
        step: '02',
        icon: FileUser,
        title: 'Centralize people data',
        desc: 'Bring employee profiles, contracts, and documents into one source of truth.',
        modules: ['Employee Records'],
    },
    {
        step: '03',
        icon: CalendarClock,
        title: 'Run attendance & leave',
        desc: 'Employees clock in, follow shift schedules, and request time off while managers approve in a click.',
        modules: ['Attendance & Leave'],
    },
    {
        step: '04',
        icon: Sparkles,
        title: 'Expand as you grow',
        desc: 'Unlock payroll, recruitment, performance, and compliance modules as they roll out.',
        modules: [
            'Payroll Readiness',
            'Recruitment Pipeline',
            'Performance Insights',
            'Access & Compliance',
        ],
    },
]

function HowItWorks() {
    return (
        <section id="workflow" className="bg-muted/40 py-24">
            <div className="mx-auto max-w-6xl px-6">
                <SectionHeading
                    badge="Workflow"
                    title="Launch a stronger HR operation in 4 steps"
                    desc="Start with the modules available today and grow into the rest of the platform."
                />
                <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.18}>
                    {steps.map((s, i) => {
                        const modules = s.modules
                            .map((title) => features.find((f) => f.title === title))
                            .filter((f) => f !== undefined)
                        const highlighted = modules.some((m) => m.highlighted)
                        const upcoming = modules.every((m) => m.upcoming)

                        return (
                            <RevealItem
                                key={s.step}
                                y={40}
                                scale={0.95}
                                hoverLift
                                className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
                                    highlighted
                                        ? 'to-card border-violet-500/60 bg-gradient-to-br from-violet-500/10 ring-1 ring-violet-500/30'
                                        : upcoming
                                          ? 'bg-card/60 border-border border-dashed'
                                          : 'bg-card border-border'
                                }`}
                            >
                                {i < steps.length - 1 && (
                                    <div className="bg-border absolute top-1/2 -right-6 hidden h-px w-6 lg:block" />
                                )}
                                <div className="mb-4 flex items-center justify-between">
                                    <div
                                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                                            modules.length === 1
                                                ? modules[0].color
                                                : 'bg-primary/10 text-primary'
                                        }`}
                                    >
                                        <s.icon className="h-5 w-5" />
                                    </div>
                                    <CountUp
                                        value={s.step}
                                        delay={0.2 + i * 0.18}
                                        duration={0.8}
                                        once={false}
                                        className="text-muted-foreground/40 text-3xl font-bold"
                                    />
                                </div>
                                <h3 className="mb-2 font-semibold">{s.title}</h3>
                                <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                                    {s.desc}
                                </p>
                                <div className="mt-auto flex flex-wrap gap-1.5">
                                    {modules.map((m) => (
                                        <span
                                            key={m.title}
                                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${m.color}`}
                                        >
                                            <m.icon className="h-3 w-3" />
                                            {m.title}
                                        </span>
                                    ))}
                                    {upcoming && (
                                        <Badge
                                            variant="outline"
                                            className="text-muted-foreground px-2 py-0 text-[10px] font-medium"
                                        >
                                            Next Plan
                                        </Badge>
                                    )}
                                    {highlighted && (
                                        <Badge className="bg-violet-500 px-2 py-0 text-[10px] text-white hover:bg-violet-500">
                                            New
                                        </Badge>
                                    )}
                                </div>
                            </RevealItem>
                        )
                    })}
                </RevealGroup>
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
            <Reveal scale={0.96} amount={0.4}>
                <RevealGroup
                    className="from-primary/5 grid gap-8 rounded-3xl bg-gradient-to-br to-violet-500/5 p-12 sm:grid-cols-2 lg:grid-cols-4"
                    stagger={0.12}
                    delay={0.2}
                    amount={0.4}
                >
                    {stats.map((s, i) => (
                        <RevealItem key={s.label} y={16} scale={0.85} className="text-center">
                            <p className="from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-5xl font-extrabold text-transparent">
                                <CountUp value={s.value} delay={0.3 + i * 0.12} once={false} />
                            </p>
                            <p className="text-muted-foreground mt-2 text-sm">{s.label}</p>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </Reveal>
        </section>
    )
}

const testimonials: Testimonial[] = [
    {
        name: 'Alicia Ramos',
        role: 'HR Manager',
        company: 'Northwind Retail',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg',
        text: 'Leave requests used to live in chat threads and spreadsheets. Now employees submit them in seconds and managers approve with full context of balances and schedules.',
    },
    {
        name: 'Daniel Smith',
        role: 'People Operations Lead',
        company: 'Brightpath Logistics',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        text: 'Clock-in with location checks solved our biggest attendance headache across three warehouses. Late arrivals and missed shifts show up the same day, not at month end.',
    },
    {
        name: 'Maya Tanaka',
        role: 'Operations Director',
        company: 'Kumo Studio',
        photo: 'https://randomuser.me/api/portraits/women/68.jpg',
        text: 'Having every employee profile, contract, and document in one place made onboarding new hires noticeably faster. Nobody asks where the latest file is anymore.',
    },
    {
        name: 'Rizky Pratama',
        role: 'HR Generalist',
        company: 'Lumbung Foods',
        photo: 'https://randomuser.me/api/portraits/men/75.jpg',
        text: 'Shift schedules and time-off balances finally agree with each other. Our team spends far less time reconciling attendance before cut-off.',
    },
    {
        name: 'Sofia Laurent',
        role: 'Head of People',
        company: 'Atelier Nine',
        photo: 'https://randomuser.me/api/portraits/women/12.jpg',
        text: 'Role-based access means managers see their team and nothing more. It gave our leadership the confidence to move all HR records onto one platform.',
    },
    {
        name: 'Marcus Lee',
        role: 'Office Manager',
        company: 'Pinecrest Clinic',
        photo: 'https://randomuser.me/api/portraits/men/46.jpg',
        text: 'Setup took an afternoon. Departments, roles, and work locations were configured before lunch, and staff were clocking in the next morning.',
    },
]

function Testimonials() {
    return (
        <section className="bg-muted/40 overflow-hidden py-24">
            <div className="mx-auto max-w-6xl px-6">
                <SectionHeading
                    badge="Customer stories"
                    title="Trusted by growing HR teams"
                    desc="See how HR teams run attendance, leave, and employee records without the spreadsheet chaos."
                />
                <Reveal y={40} delay={0.1}>
                    <TestimonialsCarousel testimonials={testimonials} />
                </Reveal>
            </div>
        </section>
    )
}

const plans = [
    {
        name: 'Free',
        desc: 'For individuals and tiny teams exploring HR basics.',
        price: 'Free',
        period: '',
        cta: 'Get started',
        featured: false,
        features: [
            'Up to 5 employees',
            'Employee records & profiles',
            'Basic leave tracking',
            'Community support',
        ],
    },
    {
        name: 'Professional',
        desc: 'For growing companies that need full HR capabilities.',
        price: 'Rp 600K',
        period: '/month',
        originalPrice: 'Rp 1.2jt',
        discount: '50% off',
        cta: 'Start free trial',
        featured: true,
        features: [
            'Up to 250 employees',
            'Everything in Starter',
            'Recruitment pipeline & jobs',
            'Performance insights',
            'Role-based access control',
            'Priority chat & email support',
            'API access',
        ],
    },
    {
        name: 'Enterprise',
        desc: 'For large organizations with advanced HR requirements.',
        price: 'Custom',
        period: '',
        cta: 'Contact sales',
        featured: false,
        features: [
            'Unlimited employees',
            'Everything in Professional',
            'Custom integrations & SSO',
            'Dedicated account manager',
            'Custom onboarding & training',
            'SLA & 24/7 support',
            'Advanced analytics & exports',
        ],
    },
]

function Pricing() {
    return (
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
            <SectionHeading
                badge="Pricing"
                title="Simple, transparent pricing"
                desc="Choose the plan that fits your team size and HR needs. Upgrade anytime as you grow."
            />
            <RevealGroup className="grid gap-6 lg:grid-cols-3" stagger={0.15} amount={0.15}>
                {plans.map((plan) => (
                    <RevealItem
                        key={plan.name}
                        y={48}
                        scale={plan.featured ? 0.9 : 0.95}
                        hoverLift
                        className={`bg-card border-border relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
                            plan.featured ? 'ring-primary shadow-md ring-2' : ''
                        }`}
                    >
                        {plan.featured && (
                            <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 overflow-hidden rounded-full px-4 py-1 text-xs font-semibold shadow-md">
                                <span
                                    aria-hidden
                                    className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                />
                                <span className="relative">Most popular</span>
                            </div>
                        )}
                        <div className="mb-6">
                            <RevealItem as="h3" y={12} delay={0.15} className="text-xl font-bold">
                                {plan.name}
                            </RevealItem>
                            <RevealItem
                                as="p"
                                y={12}
                                delay={0.22}
                                className="text-muted-foreground mt-1 text-sm"
                            >
                                {plan.desc}
                            </RevealItem>
                        </div>
                        <div className="mb-6">
                            <RevealItem
                                y={16}
                                scale={0.9}
                                delay={0.3}
                                className="flex items-baseline gap-2"
                            >
                                <span
                                    className={`text-5xl font-extrabold tracking-tight ${
                                        plan.featured
                                            ? 'from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-transparent'
                                            : ''
                                    }`}
                                >
                                    <CountUp
                                        value={plan.price}
                                        delay={0.35}
                                        duration={1.2}
                                        once={false}
                                    />
                                </span>
                                {plan.period && (
                                    <span className="text-muted-foreground text-sm">
                                        {plan.period}
                                    </span>
                                )}
                            </RevealItem>
                            {'originalPrice' in plan && plan.originalPrice && (
                                <div className="mt-1 flex items-center gap-2">
                                    <StrikeThrough
                                        delay={0.9}
                                        className="text-muted-foreground text-sm"
                                    >
                                        {plan.originalPrice}
                                    </StrikeThrough>
                                    <RevealItem as="span" y={0} scale={0.5} delay={1.1}>
                                        <Badge className="border-0 bg-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            {plan.discount}
                                        </Badge>
                                    </RevealItem>
                                </div>
                            )}
                        </div>
                        <Button
                            className="mb-8 w-full"
                            variant={plan.featured ? 'default' : 'outline'}
                            asChild
                        >
                            <Link href={SIGNUP_URL}>{plan.cta}</Link>
                        </Button>
                        <RevealGroup as="ul" className="space-y-3" stagger={0.07} delay={0.45}>
                            {plan.features.map((f) => (
                                <RevealItem
                                    as="li"
                                    key={f}
                                    y={8}
                                    className="flex items-start gap-2.5 text-sm"
                                >
                                    <RevealItem
                                        as="span"
                                        y={0}
                                        scale={0.3}
                                        className="mt-0.5 shrink-0"
                                    >
                                        <Check className="text-primary h-4 w-4" />
                                    </RevealItem>
                                    <span className="text-muted-foreground">{f}</span>
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    </RevealItem>
                ))}
            </RevealGroup>
        </section>
    )
}

function CTA() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-24">
            <Reveal
                y={40}
                scale={0.94}
                amount={0.4}
                className="from-primary relative isolate overflow-hidden rounded-3xl bg-gradient-to-br to-violet-600 p-12 text-center text-white"
            >
                <div
                    aria-hidden
                    className="animate-dots-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                <RevealGroup stagger={0.12} delay={0.25} amount={0.4}>
                    <RevealItem scale={0.6}>
                        <Float className="mx-auto mb-4 w-fit">
                            <Zap className="h-10 w-10 opacity-90" />
                        </Float>
                    </RevealItem>
                    <RevealItem as="h2" className="mb-4 text-4xl font-extrabold tracking-tight">
                        Ready to modernize your HR system?
                    </RevealItem>
                    <RevealItem as="p" className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
                        Bring hiring, employee management, leave, payroll readiness, and reporting
                        into one streamlined platform.
                    </RevealItem>
                    <RevealItem className="flex flex-wrap items-center justify-center gap-4">
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
                            className="h-12 border-white/50 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:border-white/70 hover:bg-white/20 hover:text-white dark:border-white/50 dark:bg-white/10 dark:hover:bg-white/20"
                            asChild
                        >
                            <Link href={SIGNIN_URL}>Sign in</Link>
                        </Button>
                    </RevealItem>
                </RevealGroup>
            </Reveal>
        </section>
    )
}

function Footer({ siteName, logoUrl }: { siteName: string; logoUrl: string | null }) {
    return (
        <footer className="border-border border-t py-10">
            <Reveal
                y={16}
                amount={0.5}
                className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row"
            >
                <HomeLink className="flex items-center gap-2 font-semibold">
                    {logoUrl ? (
                        <UiImage
                            src={logoUrl}
                            alt={siteName}
                            width={24}
                            height={24}
                            className="size-6 rounded-md object-contain"
                        />
                    ) : (
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-3.5" />
                        </div>
                    )}
                    {siteName}
                </HomeLink>
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
            </Reveal>
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
    const base = process.env.NEXT_PUBLIC_API_BASE_URL

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
        fetch(`${base}/site-settings`, {
            headers: await currentClientIpHeaders(),
            cache: 'no-store',
        }),
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
        <MotionRoot>
            <div className="min-h-screen">
                {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
                <Navbar siteName={siteName} logoUrl={logoUrl} />
                <LandingHero siteName={siteName} />
                <LandingFeatures />
                <HowItWorks />
                <Stats />
                <Testimonials />
                <Pricing />
                <CTA />
                <Footer siteName={siteName} logoUrl={logoUrl} />
            </div>
        </MotionRoot>
    )
}
