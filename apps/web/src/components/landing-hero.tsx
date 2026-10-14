'use client'

import * as React from 'react'
import Link from 'next/link'
import {
    animate,
    motion,
    MotionConfig,
    useInView,
    useReducedMotion,
    useScroll,
    useTransform,
    type Variants,
} from 'framer-motion'
import {
    ArrowRight,
    Briefcase,
    CalendarClock,
    CheckCircle2,
    Sparkles,
    Users,
    Wallet,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SIGNIN_URL, SIGNUP_URL } from '@/lib/constants'

const EASE = [0.22, 1, 0.36, 1] as const

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
}

const listContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
}

const listItem: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const highlights = [
    'Employee records',
    'Leave & attendance',
    'Recruitment pipeline',
    'Role-based access',
]

const stats = [
    { label: 'Employees', value: 248, suffix: '', color: 'text-blue-500' },
    { label: 'Open Roles', value: 12, suffix: '', color: 'text-violet-500' },
    { label: 'Leave Requests', value: 18, suffix: '', color: 'text-emerald-500' },
    { label: 'Payroll Ready', value: 99, suffix: '%', color: 'text-orange-500' },
]

const tiles = [
    { title: 'Employee Hub', meta: 'Profiles · Documents', icon: Users },
    { title: 'Attendance', meta: 'Shifts · Time logs', icon: CalendarClock },
    { title: 'Recruitment', meta: 'Jobs · Candidates', icon: Briefcase },
    { title: 'Payroll', meta: 'Salary · Benefits', icon: Wallet },
]

function CountUp({ value, suffix, delay }: { value: number; suffix: string; delay: number }) {
    const ref = React.useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true })
    const reduceMotion = useReducedMotion()

    React.useEffect(() => {
        const el = ref.current
        if (!el || !inView) return
        if (reduceMotion) {
            el.textContent = `${value}${suffix}`
            return
        }
        el.textContent = `0${suffix}`
        const controls = animate(0, value, {
            duration: 1.6,
            delay,
            ease: EASE,
            onUpdate: (v) => {
                el.textContent = `${Math.round(v)}${suffix}`
            },
        })
        return () => controls.stop()
    }, [inView, reduceMotion, value, suffix, delay])

    return (
        <span ref={ref} className="tabular-nums">
            {value}
            {suffix}
        </span>
    )
}

export function LandingHero({ siteName }: { siteName: string }) {
    const mockupRef = React.useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: mockupRef,
        offset: ['start end', 'start 0.4'],
    })
    // The dashboard preview starts tilted back and flattens as it scrolls into view.
    const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1])

    return (
        <MotionConfig reducedMotion="user">
            <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 text-center">
                <motion.div
                    aria-hidden
                    className="bg-primary/10 absolute top-1/3 left-1/2 -z-10 h-[600px] w-[600px] rounded-full blur-3xl"
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    aria-hidden
                    className="absolute top-1/2 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl"
                    animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                />

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-center"
                >
                    <motion.div variants={fadeUp}>
                        <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
                            <motion.span
                                className="inline-flex"
                                animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                            </motion.span>
                            Built for modern HR teams
                        </Badge>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        className="max-w-5xl text-5xl leading-tight font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
                    >
                        Run hiring, people ops, and performance in{' '}
                        <motion.span
                            className="from-primary to-primary bg-gradient-to-r via-violet-500 bg-[length:200%_auto] bg-clip-text text-transparent"
                            animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        >
                            one HR system
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        className="text-muted-foreground mt-6 max-w-3xl text-lg leading-relaxed sm:text-xl"
                    >
                        {siteName} helps HR teams centralize employee data, automate leave and
                        attendance, manage recruitment, and gain real-time visibility across the
                        workforce.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        className="mt-10 flex flex-wrap items-center justify-center gap-4"
                    >
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button
                                size="lg"
                                className="group shadow-primary/25 h-12 px-8 text-base shadow-lg"
                                asChild
                            >
                                <Link href={SIGNUP_URL}>
                                    Start with your team
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 px-8 text-base"
                                asChild
                            >
                                <Link href={SIGNIN_URL}>Sign in</Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={listContainer}
                        className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-6 text-sm"
                    >
                        {highlights.map((t) => (
                            <motion.span
                                key={t}
                                variants={listItem}
                                className="flex items-center gap-1.5"
                            >
                                <CheckCircle2 className="text-primary h-4 w-4" />
                                {t}
                            </motion.span>
                        ))}
                    </motion.div>
                </motion.div>

                <div className="mt-16 w-full max-w-5xl [perspective:1200px]">
                    <motion.div
                        ref={mockupRef}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
                        style={{ rotateX, scale, transformOrigin: 'center top' }}
                        className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-2xl"
                    >
                        <div className="bg-muted/50 border-border flex items-center gap-1.5 border-b px-4 py-3">
                            {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c, i) => (
                                <div key={i} className={`h-3 w-3 rounded-full ${c}`} />
                            ))}
                            <div className="bg-background mx-auto w-64 rounded-md px-3 py-1 text-center text-xs text-gray-400">
                                hr.{siteName.toLowerCase().replace(/\s+/g, '-')}.com
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-0 divide-x divide-y sm:grid-cols-4">
                            {stats.map((s, i) => (
                                <div key={s.label} className="bg-card p-6 text-center">
                                    <p className={`text-3xl font-bold ${s.color}`}>
                                        <CountUp
                                            value={s.value}
                                            suffix={s.suffix}
                                            delay={1 + i * 0.1}
                                        />
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-card grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
                            {tiles.map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1.1 + i * 0.1, ease: EASE }}
                                    whileHover={{ y: -3 }}
                                    className="bg-muted hover:bg-muted/70 rounded-lg p-3 text-left text-xs transition-colors"
                                >
                                    <div className="bg-primary/10 mb-2 flex h-7 w-7 items-center justify-center rounded-md">
                                        <item.icon className="text-primary h-3.5 w-3.5" />
                                    </div>
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-muted-foreground mt-0.5">{item.meta}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
        </MotionConfig>
    )
}
