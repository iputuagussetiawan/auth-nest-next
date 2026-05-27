import { buildThemeCss } from '@/lib/theme-utils'
import Link from 'next/link'
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    FileUser,
    GalleryVerticalEnd,
    Search,
    Shield,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SIGNIN_URL, SIGNUP_URL } from '@/lib/constants'

// ── Nav ───────────────────────────────────────────────────────────────────────
function Navbar() {
    return (
        <header className="border-border/50 bg-background/80 fixed top-0 z-50 w-full border-b backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    <span className="text-lg">Acme Inc.</span>
                </Link>
                <nav className="hidden items-center gap-6 text-sm md:flex">
                    <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                    <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
                    <Link href="#stats" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={SIGNIN_URL}>Sign in</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={SIGNUP_URL}>Get started <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
            {/* background glow */}
            <div className="bg-primary/10 absolute top-1/3 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl" />

            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                The smarter way to find your next opportunity
            </Badge>

            <h1 className="max-w-4xl text-5xl leading-tight font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                Land your dream job{' '}
                <span className="from-primary to-violet-500 bg-gradient-to-r bg-clip-text text-transparent">
                    faster than ever
                </span>
            </h1>

            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
                Connect talent with opportunity. Build your resume, browse thousands of jobs,
                and track your career growth — all in one powerful platform.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                    <Link href={SIGNUP_URL}>
                        Create free account
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                    <Link href={SIGNIN_URL}>Sign in</Link>
                </Button>
            </div>

            <div className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
                {['Free to get started', 'No credit card required', 'Cancel anytime'].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                        <CheckCircle2 className="text-primary h-4 w-4" />
                        {t}
                    </span>
                ))}
            </div>

            {/* mock dashboard preview */}
            <div className="border-border bg-card relative mt-16 w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl">
                <div className="bg-muted/50 border-border flex items-center gap-1.5 border-b px-4 py-3">
                    {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c, i) => (
                        <div key={i} className={`h-3 w-3 rounded-full ${c}`} />
                    ))}
                    <div className="bg-background mx-auto w-64 rounded-md px-3 py-1 text-xs text-center text-gray-400">
                        app.acmeinc.com/dashboard
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-0 divide-x divide-y">
                    {[
                        { label: 'Jobs Applied', value: '24', color: 'text-blue-500' },
                        { label: 'Profile Views', value: '182', color: 'text-violet-500' },
                        { label: 'Interviews', value: '6', color: 'text-emerald-500' },
                    ].map((s) => (
                        <div key={s.label} className="bg-card p-6 text-center">
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-card grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
                    {['Frontend Engineer', 'Product Designer', 'Data Analyst', 'Backend Dev'].map((job) => (
                        <div key={job} className="bg-muted rounded-lg p-3 text-xs">
                            <div className="bg-primary/10 mb-2 flex h-7 w-7 items-center justify-center rounded-md">
                                <Briefcase className="text-primary h-3.5 w-3.5" />
                            </div>
                            <p className="font-medium">{job}</p>
                            <p className="text-muted-foreground mt-0.5">Remote · Full-time</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ── Features ──────────────────────────────────────────────────────────────────
const features = [
    {
        icon: FileUser,
        title: 'Smart Resume Builder',
        desc: 'Create a standout CV in minutes with guided templates. Preview, export, and share with one click.',
        color: 'bg-blue-500/10 text-blue-500',
    },
    {
        icon: Search,
        title: 'Intelligent Job Search',
        desc: 'Discover thousands of curated job listings matched to your skills, experience, and career goals.',
        color: 'bg-violet-500/10 text-violet-500',
    },
    {
        icon: TrendingUp,
        title: 'Career Growth Tracker',
        desc: 'Set milestones, track skill development, and visualize your career progression over time.',
        color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
        icon: Briefcase,
        title: 'Application Manager',
        desc: 'Keep track of every application, interview, and offer in one organized dashboard.',
        color: 'bg-orange-500/10 text-orange-500',
    },
    {
        icon: Users,
        title: 'Company Hub',
        desc: 'Companies can post jobs, review applicants, and manage their hiring pipeline effortlessly.',
        color: 'bg-pink-500/10 text-pink-500',
    },
    {
        icon: Shield,
        title: 'Role-based Access',
        desc: 'Powerful admin tools with granular permissions. Manage users, roles, and modules with ease.',
        color: 'bg-cyan-500/10 text-cyan-500',
    },
]

function Features() {
    return (
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
            <div className="mb-16 text-center">
                <Badge variant="secondary" className="mb-4">Features</Badge>
                <h2 className="text-4xl font-bold tracking-tight">Everything you need to succeed</h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
                    A complete platform for job seekers, companies, and administrators.
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f) => (
                    <div key={f.title} className="bg-card border-border group rounded-2xl border p-6 transition-shadow hover:shadow-lg">
                        <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
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

// ── How it works ──────────────────────────────────────────────────────────────
const steps = [
    { step: '01', title: 'Create your account', desc: 'Sign up for free in under 60 seconds. No credit card needed.' },
    { step: '02', title: 'Build your profile', desc: 'Add your experience, skills, and upload your resume to stand out.' },
    { step: '03', title: 'Browse & apply', desc: 'Discover matching jobs and apply with a single click.' },
    { step: '04', title: 'Track your progress', desc: 'Monitor applications, schedule interviews, and grow your career.' },
]

function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-muted/40 py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-16 text-center">
                    <Badge variant="secondary" className="mb-4">How it works</Badge>
                    <h2 className="text-4xl font-bold tracking-tight">Get hired in 4 simple steps</h2>
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
                            <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
    { value: '50K+', label: 'Active job seekers' },
    { value: '8K+', label: 'Companies hiring' },
    { value: '120K+', label: 'Jobs posted' },
    { value: '92%', label: 'Placement rate' },
]

function Stats() {
    return (
        <section id="stats" className="mx-auto max-w-6xl px-6 py-24">
            <div className="from-primary/5 to-violet-500/5 grid gap-8 rounded-3xl bg-gradient-to-br p-12 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="text-center">
                        <p className="from-primary to-violet-500 bg-gradient-to-r bg-clip-text text-5xl font-extrabold text-transparent">
                            {s.value}
                        </p>
                        <p className="text-muted-foreground mt-2 text-sm">{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
    { name: 'Sarah K.', role: 'Frontend Engineer', text: 'Landed my dream job at a Series B startup within 3 weeks of signing up. The job matching is incredibly accurate.' },
    { name: 'Marcus T.', role: 'Product Designer', text: 'The resume builder is a game-changer. Clean, professional, and exports perfectly. Got 3x more callbacks.' },
    { name: 'Priya M.', role: 'HR Manager', text: 'Managing our hiring pipeline has never been smoother. The company dashboard saves us hours every week.' },
]

function Testimonials() {
    return (
        <section className="bg-muted/40 py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-16 text-center">
                    <Badge variant="secondary" className="mb-4">Testimonials</Badge>
                    <h2 className="text-4xl font-bold tracking-tight">Loved by thousands</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                    {testimonials.map((t) => (
                        <div key={t.name} className="bg-card border-border rounded-2xl border p-6">
                            <div className="mb-4 flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">"{t.text}"</p>
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

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-24">
            <div className="from-primary to-violet-600 relative overflow-hidden rounded-3xl bg-gradient-to-br p-12 text-center text-white">
                <div className="absolute inset-0 -z-10 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                <Zap className="mx-auto mb-4 h-10 w-10 opacity-90" />
                <h2 className="mb-4 text-4xl font-extrabold tracking-tight">Ready to level up your career?</h2>
                <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
                    Join thousands of professionals who found their next opportunity with us. Start for free today.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold" asChild>
                        <Link href={SIGNUP_URL}>Create free account <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 border-white/40 px-8 text-base text-white hover:bg-white/10 hover:text-white" asChild>
                        <Link href={SIGNIN_URL}>Sign in</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="border-border border-t py-10">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-3.5" />
                    </div>
                    Acme Inc.
                </Link>
                <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Acme Inc. All rights reserved.</p>
                <div className="flex gap-4 text-sm">
                    <Link href={SIGNIN_URL} className="text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
                    <Link href={SIGNUP_URL} className="text-muted-foreground hover:text-foreground transition-colors">Register</Link>
                </div>
            </div>
        </footer>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────
async function getActiveThemeCss(): Promise<string> {
    try {
        const res = await fetch(`${process.env.BACKEND_URL}/themes/active`, {
            next: { revalidate: 60 },
        })
        if (!res.ok) return ''
        const json = await res.json()
        const config = json?.data?.config
        if (!config) return ''
        return buildThemeCss(config)
    } catch {
        return ''
    }
}

export default async function LandingPage() {
    const themeCss = await getActiveThemeCss()

    return (
        <div className="min-h-screen">
            {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <Stats />
            <Testimonials />
            <CTA />
            <Footer />
        </div>
    )
}
