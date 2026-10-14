'use client'

import * as React from 'react'
import { Quote, Star } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel'

export type Testimonial = {
    name: string
    role: string
    company: string
    photo: string
    text: string
}

const AUTOPLAY_MS = 5000

function initials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
    const [api, setApi] = React.useState<CarouselApi>()
    const [selected, setSelected] = React.useState(0)
    const [snapCount, setSnapCount] = React.useState(0)
    const [paused, setPaused] = React.useState(false)

    React.useEffect(() => {
        if (!api) return
        const update = () => {
            setSnapCount(api.scrollSnapList().length)
            setSelected(api.selectedScrollSnap())
        }
        update()
        api.on('select', update)
        api.on('reInit', update)
        return () => {
            api.off('select', update)
            api.off('reInit', update)
        }
    }, [api])

    React.useEffect(() => {
        if (!api || paused) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const id = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS)
        return () => window.clearInterval(id)
    }, [api, paused])

    return (
        <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            <Carousel setApi={setApi} opts={{ align: 'start', loop: true }} className="relative">
                <CarouselContent className="-ml-6 py-2">
                    {testimonials.map((t) => (
                        <CarouselItem key={t.name} className="pl-6 sm:basis-1/2 lg:basis-1/3">
                            <figure className="bg-card border-border relative flex h-full flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg">
                                <Quote className="text-primary/15 absolute top-5 right-5 h-10 w-10" />
                                <div className="mb-4 flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                        />
                                    ))}
                                </div>
                                <blockquote className="text-muted-foreground mb-6 text-sm leading-relaxed">
                                    &ldquo;{t.text}&rdquo;
                                </blockquote>
                                <figcaption className="border-border mt-auto flex items-center gap-3 border-t pt-4">
                                    <Avatar className="ring-primary/20 ring-offset-card size-11 ring-2 ring-offset-2">
                                        <AvatarImage src={t.photo} alt={t.name} />
                                        <AvatarFallback>{initials(t.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{t.name}</p>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {t.role} · {t.company}
                                        </p>
                                    </div>
                                </figcaption>
                            </figure>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden lg:inline-flex" />
                <CarouselNext className="hidden lg:inline-flex" />
            </Carousel>

            <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: snapCount }).map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => api?.scrollTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={i === selected}
                        className={`h-2 rounded-full transition-all ${
                            i === selected
                                ? 'bg-primary w-6'
                                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}
