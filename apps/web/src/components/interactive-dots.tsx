'use client'

import * as React from 'react'
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from 'framer-motion'

const GRID = 24
const SPOTLIGHT_RADIUS = 180
const PARALLAX = 8
// The layer overscans its container so the parallax shift never shows an edge.
const OVERSCAN = 16

/**
 * Dot-grid background that lights up around the mouse cursor. Fills its
 * nearest positioned ancestor and sits behind its content (-z-10), so the
 * ancestor should be `relative isolate`.
 */
export function InteractiveDots() {
    const ref = React.useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()

    const spring = { stiffness: 150, damping: 20, mass: 0.5 }
    const x = useSpring(useMotionValue(-1000), spring)
    const y = useSpring(useMotionValue(-1000), spring)
    // Peak strength of the cursor highlight (0-1); kept low so the form stays readable.
    const MAX_VISIBLE = 0.6
    const visible = useSpring(0, { stiffness: 120, damping: 20 })
    // Normalised -1..1 position for the parallax shift.
    const nx = useSpring(0, spring)
    const ny = useSpring(0, spring)
    const shiftX = useTransform(nx, (v) => (reduceMotion ? 0 : -v * PARALLAX))
    const shiftY = useTransform(ny, (v) => (reduceMotion ? 0 : -v * PARALLAX))

    const mask = useMotionTemplate`radial-gradient(${SPOTLIGHT_RADIUS}px circle at ${x}px ${y}px, black 0%, transparent 100%)`
    const glow = useMotionTemplate`radial-gradient(${SPOTLIGHT_RADIUS}px circle at ${x}px ${y}px, color-mix(in oklab, var(--primary) 3%, transparent), transparent 70%)`

    React.useEffect(() => {
        const el = ref.current?.parentElement
        if (!el) return

        const handleMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return
            const rect = el.getBoundingClientRect()
            const px = e.clientX - rect.left
            const py = e.clientY - rect.top
            const inside = px >= 0 && py >= 0 && px <= rect.width && py <= rect.height
            // Spotlight coordinates are relative to the overscanned layer.
            const lx = px + OVERSCAN
            const ly = py + OVERSCAN
            if (!inside) {
                visible.set(0)
                return
            }
            if (visible.get() === 0) {
                // Jump straight to the cursor on entry instead of sliding in from far away.
                x.jump(lx)
                y.jump(ly)
            }
            x.set(lx)
            y.set(ly)
            nx.set((px / rect.width) * 2 - 1)
            ny.set((py / rect.height) * 2 - 1)
            visible.set(MAX_VISIBLE)
        }
        const handleLeave = () => visible.set(0)

        window.addEventListener('pointermove', handleMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', handleLeave)
        return () => {
            window.removeEventListener('pointermove', handleMove)
            document.documentElement.removeEventListener('pointerleave', handleLeave)
        }
    }, [x, y, nx, ny, visible])

    return (
        <div
            ref={ref}
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
            <motion.div className="absolute" style={{ inset: -OVERSCAN, x: shiftX, y: shiftY }}>
                {/* Base grid, fading out towards the edges */}
                <div
                    className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] opacity-60"
                    style={{
                        backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
                        backgroundSize: `${GRID}px ${GRID}px`,
                    }}
                />
                {/* Highlighted dots revealed around the cursor */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        opacity: visible,
                        backgroundImage:
                            'radial-gradient(color-mix(in oklab, var(--primary) 45%, transparent) 1.3px, transparent 1.3px)',
                        backgroundSize: `${GRID}px ${GRID}px`,
                        maskImage: mask,
                        WebkitMaskImage: mask,
                    }}
                />
                {/* Soft glow under the cursor */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        opacity: visible,
                        background: glow,
                    }}
                />
            </motion.div>
        </div>
    )
}
