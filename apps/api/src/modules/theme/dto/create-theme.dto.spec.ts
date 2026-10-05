import 'reflect-metadata'

import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

import { ThemeConfigDto } from './create-theme.dto'

const COLOR_KEYS = [
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
]
const vars = Object.fromEntries(COLOR_KEYS.map((k) => [k, '#112233']))

function errorsFor(overrides: Record<string, unknown>) {
    const dto = plainToInstance(ThemeConfigDto, {
        light: vars,
        dark: vars,
        radius: '0.625',
        fontFamily: 'Plus Jakarta Sans',
        heroVariant: 'centered',
        heroBackground: 'gradient',
        ...overrides,
    })
    return validateSync(dto).map((e) => e.property)
}

describe('ThemeConfigDto', () => {
    it('accepts a normal theme', () => {
        expect(errorsFor({})).toEqual([])
    })

    it('rejects markup injection in radius', () => {
        expect(errorsFor({ radius: '0.5}</style><script>alert(1)</script>' })).toContain('radius')
    })

    it('rejects markup injection in fontFamily', () => {
        expect(errorsFor({ fontFamily: "x'}</style><script>" })).toContain('fontFamily')
    })
})
