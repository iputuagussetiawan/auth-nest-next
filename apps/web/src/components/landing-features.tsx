'use client'

import { motion, MotionConfig, type Variants } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { features } from '@/lib/landing-features'

const EASE = [0.22, 1, 0.36, 1] as const

const heading: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const grid: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
}

// Delay between neighbouring cards in the same row.
const CARD_STAGGER = 0.18

const card: Variants = {
    hidden: { opacity: 0, y: 48, scale: 0.94 },
    show: (column: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: EASE,
            delay: column * CARD_STAGGER,
            delayChildren: column * CARD_STAGGER + 0.2,
            staggerChildren: 0.08,
        },
    }),
    hover: { y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } },
}

const icon: Variants = {
    hidden: { opacity: 0, scale: 0.4, rotate: -25 },
    show: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 260, damping: 14 },
    },
    hover: {
        rotate: [0, -10, 8, 0],
        scale: 1.12,
        transition: { duration: 0.5, ease: 'easeInOut' },
    },
}

const content: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const badge: Variants = {
    hidden: { opacity: 0, scale: 0.6 },
    show: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 400, damping: 15, delay: 0.25 },
    },
}

// A soft diagonal highlight that sweeps across the card on hover.
const shine: Variants = {
    hidden: { x: '-120%' },
    show: { x: '-120%' },
    hover: { x: '120%', transition: { duration: 0.8, ease: 'easeInOut' } },
}

export function LandingFeatures() {
    return (
        <MotionConfig reducedMotion="user">
            <section id="features" className="mx-auto max-w-6xl px-6 py-24">
                <motion.div
                    className="mb-16 text-center"
                    variants={grid}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.4 }}
                >
                    <motion.div variants={heading}>
                        <Badge variant="secondary" className="mb-4">
                            Core modules
                        </Badge>
                    </motion.div>
                    <motion.h2 variants={heading} className="text-4xl font-bold tracking-tight">
                        Everything HR needs in one place
                    </motion.h2>
                    <motion.p
                        variants={heading}
                        className="text-muted-foreground mx-auto mt-4 max-w-2xl"
                    >
                        Replace scattered spreadsheets and disconnected tools with one platform for
                        people operations.
                    </motion.p>
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            variants={card}
                            custom={i % 3}
                            initial="hidden"
                            whileInView="show"
                            whileHover="hover"
                            viewport={{ once: false, amount: 0.3 }}
                            className={`group relative rounded-2xl border p-6 transition-shadow duration-300 hover:shadow-lg ${
                                f.highlighted
                                    ? 'to-card border-violet-500/60 bg-gradient-to-br from-violet-500/10 shadow-lg ring-1 shadow-violet-500/10 ring-violet-500/30'
                                    : 'bg-card border-border'
                            }`}
                        >
                            {f.highlighted && (
                                <>
                                    <div className="animate-glow-breathe pointer-events-none absolute -inset-px rounded-2xl" />
                                    <div className="animate-glow-ripple pointer-events-none absolute -inset-px rounded-2xl border-2 border-violet-500/60" />
                                </>
                            )}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                            >
                                <motion.div
                                    variants={shine}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
                                />
                            </div>
                            <motion.div
                                variants={icon}
                                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}
                            >
                                <f.icon className="h-5 w-5" />
                            </motion.div>
                            <motion.h3
                                variants={content}
                                className="mb-2 flex items-center gap-2 font-semibold"
                            >
                                {f.title}
                                {f.highlighted && (
                                    <motion.span variants={badge} className="inline-flex">
                                        <Badge className="bg-violet-500 px-2 py-0 text-[10px] text-white hover:bg-violet-500">
                                            New
                                        </Badge>
                                    </motion.span>
                                )}
                                {f.upcoming && (
                                    <motion.span variants={badge} className="inline-flex">
                                        <Badge
                                            variant="outline"
                                            className="text-muted-foreground px-2 py-0 text-[10px] font-medium"
                                        >
                                            Next Plan
                                        </Badge>
                                    </motion.span>
                                )}
                            </motion.h3>
                            <motion.p
                                variants={content}
                                className="text-muted-foreground text-sm leading-relaxed"
                            >
                                {f.desc}
                            </motion.p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </MotionConfig>
    )
}
