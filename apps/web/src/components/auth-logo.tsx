'use client'

import Link from 'next/link'
import { motion, MotionConfig, type Variants } from 'framer-motion'
import { GalleryVerticalEnd } from 'lucide-react'

import { UiImage } from '@/components/ui-custom/UiImage'

const EASE = [0.22, 1, 0.36, 1] as const

const wrapper: Variants = {
    hidden: { opacity: 0, y: -12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: EASE, staggerChildren: 0.1 },
    },
}

const mark: Variants = {
    hidden: { scale: 0.3, rotate: -90 },
    show: { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 14 } },
    hover: {
        scale: 1.12,
        rotate: -12,
        transition: { type: 'spring', stiffness: 400, damping: 12 },
    },
}

const name: Variants = {
    hidden: { opacity: 0, x: -8 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
}

/** Site logo for the auth pages: pops in on load and tilts on hover. */
export function AuthLogo({ siteName, logoUrl }: { siteName: string; logoUrl: string | null }) {
    return (
        <MotionConfig reducedMotion="user">
            <motion.div variants={wrapper} initial="hidden" animate="show" whileHover="hover">
                <Link href="/" className="group flex items-center gap-2 font-medium">
                    <motion.span variants={mark} className="inline-flex">
                        {logoUrl ? (
                            <UiImage
                                src={logoUrl}
                                alt={siteName}
                                width={24}
                                height={24}
                                className="size-6 rounded-md object-contain"
                            />
                        ) : (
                            <span className="bg-primary text-primary-foreground group-hover:shadow-primary/40 flex size-6 items-center justify-center rounded-md transition-shadow duration-300 group-hover:shadow-md">
                                <GalleryVerticalEnd className="size-4" />
                            </span>
                        )}
                    </motion.span>
                    <motion.span
                        variants={name}
                        className="group-hover:text-primary transition-colors duration-300"
                    >
                        {siteName}
                    </motion.span>
                </Link>
            </motion.div>
        </MotionConfig>
    )
}
