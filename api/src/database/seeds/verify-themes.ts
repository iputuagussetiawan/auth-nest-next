import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '../schema'
import { themes } from '../schema/theme/themes.schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

const THEME_VARS = [
    'background',
    'foreground',
    'card',
    'cardForeground',
    'popover',
    'popoverForeground',
    'primary',
    'primaryForeground',
    'secondary',
    'secondaryForeground',
    'muted',
    'mutedForeground',
    'accent',
    'accentForeground',
    'destructive',
    'border',
    'input',
    'ring',
    'chart1',
    'chart2',
    'chart3',
    'chart4',
    'chart5',
    'sidebar',
    'sidebarForeground',
    'sidebarPrimary',
    'sidebarPrimaryForeground',
    'sidebarAccent',
    'sidebarAccentForeground',
    'sidebarBorder',
    'sidebarRing',
] as const

function validateConfig(config: unknown, slug: string) {
    const errors: string[] = []
    const value = config as Record<string, any> | null

    for (const mode of ['light', 'dark'] as const) {
        const vars = value?.[mode]
        for (const key of THEME_VARS) {
            if (typeof vars?.[key] !== 'string' || !vars[key]) {
                errors.push(`${slug}: missing ${mode}.${key}`)
            }
        }
    }

    if (!value?.radius || Number.isNaN(Number(value.radius))) {
        errors.push(`${slug}: radius must be numeric`)
    }

    return errors
}

async function main() {
    const rows = await db.select().from(themes)
    const errors: string[] = []
    const active = rows.filter((theme) => theme.isActive)
    const emerald = rows.find((theme) => theme.slug === 'emerald-forest')

    if (active.length !== 1)
        errors.push(`expected exactly one active theme, found ${active.length}`)
    if (!emerald) errors.push('missing emerald-forest theme')
    if (rows.some((theme) => theme.slug === 'default'))
        errors.push('legacy default theme slug still exists')

    for (const theme of rows) errors.push(...validateConfig(theme.config, theme.slug))

    if (errors.length) {
        console.error('Theme verification failed:')
        for (const error of errors) console.error(`- ${error}`)
        process.exitCode = 1
        return
    }

    console.log('Theme verification passed.')
    for (const theme of rows) {
        console.log(`- ${theme.slug}: ${theme.isActive ? 'active' : 'inactive'}`)
    }
}

main()
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(() => pool.end())
