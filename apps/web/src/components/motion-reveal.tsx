'use client'

import * as React from 'react'
import {
    animate,
    motion,
    MotionConfig,
    useInView,
    useReducedMotion,
    type Variants,
} from 'framer-motion'

// Scroll-triggered animation helpers for the landing page. They take only
// plain props so server components can use them as wrappers.

export const EASE = [0.22, 1, 0.36, 1] as const

type Tag = 'div' | 'ul' | 'li' | 'p' | 'h2' | 'h3' | 'span' | 'footer'

type ItemOptions = { y: number; scale: number; delay: number; hoverLift: boolean }

const itemVariants: Variants = {
    hidden: ({ y, scale }: ItemOptions) => ({ opacity: 0, y, scale }),
    show: ({ delay }: ItemOptions) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.65, ease: EASE, delay },
    }),
    hover: ({ hoverLift }: ItemOptions) =>
        hoverLift ? { y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } } : {},
}

const groupVariants: Variants = {
    hidden: {},
    show: ({ stagger, delay }: { stagger: number; delay: number }) => ({
        transition: { staggerChildren: stagger, delayChildren: delay },
    }),
}

// Fixed lookup so the motion component identity is stable across renders.
const motionTags = {
    div: motion.div,
    ul: motion.ul,
    li: motion.li,
    p: motion.p,
    h2: motion.h2,
    h3: motion.h3,
    span: motion.span,
    footer: motion.footer,
} as Record<Tag, typeof motion.div>

type BaseProps = {
    as?: Tag
    className?: string
    children?: React.ReactNode
}

/** Respects the visitor's reduced-motion setting for everything inside it. */
export function MotionRoot({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

/** Container that reveals its RevealItem children one after another when scrolled into view. */
export function RevealGroup({
    as = 'div',
    stagger = 0.12,
    delay = 0,
    amount = 0.2,
    className,
    children,
}: BaseProps & { stagger?: number; delay?: number; amount?: number }) {
    const Component = motionTags[as]
    return (
        <Component
            className={className}
            variants={groupVariants}
            custom={{ stagger, delay }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount }}
        >
            {children}
        </Component>
    )
}

/** Child of RevealGroup. Fades up (and optionally scales in) when its group is revealed. */
export function RevealItem({
    as = 'div',
    y = 24,
    scale = 1,
    delay = 0,
    hoverLift = false,
    className,
    children,
}: BaseProps & { y?: number; scale?: number; delay?: number; hoverLift?: boolean }) {
    const Component = motionTags[as]
    return (
        <Component
            className={className}
            variants={itemVariants}
            custom={{ y, scale, delay, hoverLift }}
            whileHover={hoverLift ? 'hover' : undefined}
        >
            {children}
        </Component>
    )
}

/** Standalone element that fades up on its own when scrolled into view. */
export function Reveal({
    as = 'div',
    y = 24,
    scale = 1,
    delay = 0,
    amount = 0.2,
    className,
    children,
}: BaseProps & { y?: number; scale?: number; delay?: number; amount?: number }) {
    const Component = motionTags[as]
    return (
        <Component
            className={className}
            variants={itemVariants}
            custom={{ y, scale, delay, hoverLift: false }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount }}
        >
            {children}
        </Component>
    )
}

/**
 * Text with a line that strikes through it from left to right. Animates with
 * its nearest RevealGroup / RevealItem / Reveal ancestor.
 */
export function StrikeThrough({
    delay = 0,
    className,
    children,
}: {
    delay?: number
    className?: string
    children: React.ReactNode
}) {
    return (
        <span className={`relative inline-block ${className ?? ''}`}>
            {children}
            <motion.span
                aria-hidden
                className="absolute top-1/2 left-0 h-px w-full bg-current"
                style={{ originX: 0 }}
                variants={{
                    hidden: { scaleX: 0 },
                    show: { scaleX: 1, transition: { duration: 0.5, ease: EASE, delay } },
                }}
            />
        </span>
    )
}

/** Gently bobs its children up and down forever. */
export function Float({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <motion.div
            className={className}
            animate={{ y: [0, -8, 0], rotate: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Counts the leading number in `value` up from 0 when scrolled into view,
 * keeping any surrounding text: "99%", "10x", "24/7".
 */
export function CountUp({
    value,
    delay = 0,
    duration = 1.6,
    once = true,
    className,
}: {
    value: string | number
    delay?: number
    duration?: number
    once?: boolean
    className?: string
}) {
    const text = String(value)
    const match = text.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/)
    const ref = React.useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once })
    const reduceMotion = useReducedMotion()

    React.useEffect(() => {
        const el = ref.current
        if (!el || !match) return
        const [, prefix, num, suffix] = match
        if (!inView || reduceMotion) {
            el.textContent = text
            return
        }
        const target = Number(num)
        const decimals = num.includes('.') ? num.split('.')[1].length : 0
        // Keep zero-padding such as "01" while counting.
        const width = decimals === 0 && num.startsWith('0') ? num.length : 0
        const format = (v: number) => v.toFixed(decimals).padStart(width, '0')
        el.textContent = `${prefix}${format(0)}${suffix}`
        const controls = animate(0, target, {
            duration,
            delay,
            ease: EASE,
            onUpdate: (v) => {
                el.textContent = `${prefix}${format(v)}${suffix}`
            },
        })
        return () => controls.stop()
        // match is derived from text
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, reduceMotion, text, delay, duration])

    return (
        <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
            {text}
        </span>
    )
}
