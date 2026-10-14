'use client'

import { motion, MotionConfig, type Variants } from 'framer-motion'
import {
    CheckCircle2,
    KeyRound,
    Laptop,
    MonitorSmartphone,
    ShieldCheck,
    UserCog,
} from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const highlights = [
    { icon: KeyRound, label: 'Email & Google sign-in' },
    { icon: MonitorSmartphone, label: 'Session management' },
    { icon: UserCog, label: 'Role-based access' },
]

const glass =
    'rounded-2xl border border-white/25 bg-white/15 p-4 text-white shadow-2xl shadow-black/20 backdrop-blur-xl'

function FloatingCard({
    className,
    delay,
    floatDelay,
    children,
}: {
    className: string
    delay: number
    floatDelay: number
    children: React.ReactNode
}) {
    return (
        <motion.div
            className={`absolute ${className}`}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay, ease: EASE }}
        >
            <motion.div
                className={glass}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, delay: floatDelay, repeat: Infinity, ease: 'easeInOut' }}
            >
                {children}
            </motion.div>
        </motion.div>
    )
}

/** Branded panel shown beside the auth forms on large screens. */
export function AuthShowcase({ siteName }: { siteName: string }) {
    return (
        <MotionConfig reducedMotion="user">
            <div className="from-primary relative isolate flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br via-violet-600 to-violet-800 p-10 text-white xl:p-14">
                <div
                    aria-hidden
                    className="animate-dots-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -top-32 -right-32 -z-10 h-[480px] w-[480px] rounded-full bg-white/15 blur-3xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-40 -left-24 -z-10 h-[420px] w-[420px] rounded-full bg-black/20 blur-3xl"
                />

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="relative max-w-lg"
                >
                    <motion.p
                        variants={fadeUp}
                        className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur"
                    >
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
                        </span>
                        {siteName}
                    </motion.p>
                    <motion.h2
                        variants={fadeUp}
                        className="text-4xl leading-tight font-bold tracking-tight xl:text-5xl"
                    >
                        Secure sign-in, every session in view.
                    </motion.h2>
                    <motion.p variants={fadeUp} className="mt-4 text-base text-white/80 xl:text-lg">
                        Sign in with email or Google, see every device on your account, and sign out
                        the ones you don&apos;t recognize.
                    </motion.p>
                    <motion.ul variants={container} className="mt-8 flex flex-wrap gap-3">
                        {highlights.map((h) => (
                            <motion.li
                                key={h.label}
                                variants={fadeUp}
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur"
                            >
                                <h.icon className="size-4" />
                                {h.label}
                            </motion.li>
                        ))}
                    </motion.ul>
                </motion.div>

                {/* Product preview */}
                <div aria-hidden className="relative mx-auto mt-10 h-[340px] w-full max-w-xl">
                    <FloatingCard className="top-0 left-0 w-64" delay={0.6} floatDelay={0}>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/25">
                                <ShieldCheck className="size-5 text-emerald-200" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Signed in</p>
                                <p className="text-xs text-white/70">Just now · Google</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-white/70">
                            <CheckCircle2 className="size-3.5" />
                            Email verified
                        </div>
                    </FloatingCard>

                    <FloatingCard className="top-16 right-0 w-72" delay={0.8} floatDelay={1.5}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold">Active sessions</p>
                                <p className="text-xs text-white/70">2 devices</p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-2 py-0.5 text-[11px] font-medium text-emerald-100">
                                <CheckCircle2 className="size-3" />
                                Secure
                            </span>
                        </div>
                        <ul className="mt-3 space-y-2 text-xs">
                            <li className="flex items-center gap-2">
                                <Laptop className="size-3.5 text-white/70" />
                                <span className="flex-1">Chrome on Windows</span>
                                <span className="text-emerald-200">This device</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MonitorSmartphone className="size-3.5 text-white/70" />
                                <span className="flex-1">Safari on iPhone</span>
                                <span className="text-white/60">2h ago</span>
                            </li>
                        </ul>
                    </FloatingCard>

                    <FloatingCard className="bottom-0 left-1/4 w-64" delay={1} floatDelay={3}>
                        <p className="text-xs text-white/70">Sign-ins this week</p>
                        <div className="mt-1 flex items-end gap-2">
                            <span className="text-3xl font-bold">1,284</span>
                            <span className="mb-1 text-xs text-emerald-200">+12% vs last week</span>
                        </div>
                        <div className="mt-3 flex h-10 items-end gap-1.5">
                            {[55, 70, 62, 80, 74, 88, 92].map((h, i) => (
                                <motion.div
                                    key={i}
                                    className="flex-1 rounded-sm bg-white/60"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 1.4 + i * 0.06,
                                        ease: EASE,
                                    }}
                                />
                            ))}
                        </div>
                    </FloatingCard>
                </div>
            </div>
        </MotionConfig>
    )
}
