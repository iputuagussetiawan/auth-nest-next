'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function DynamicBreadcrumbs() {
    const pathname = usePathname()

    // Split pathname into segments and filter out empty strings
    // Example: "/dashboard/settings" -> ["dashboard", "settings"]
    const segments = pathname.split('/').filter((item) => item !== '')

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* 1. Static Home/Dashboard Link (Optional) */}
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join('/')}`
                    const isLast = index === segments.length - 1

                    // Format the label (e.g., "data-fetching" -> "Data Fetching")
                    const label = segment
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild className="hidden md:block">
                                        <Link href={href}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
