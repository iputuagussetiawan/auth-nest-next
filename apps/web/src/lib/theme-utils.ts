interface ThemeVars {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    border: string
    input: string
    ring: string
    chart1: string
    chart2: string
    chart3: string
    chart4: string
    chart5: string
    sidebar: string
    sidebarForeground: string
    sidebarPrimary: string
    sidebarPrimaryForeground: string
    sidebarAccent: string
    sidebarAccentForeground: string
    sidebarBorder: string
    sidebarRing: string
}

interface ThemeConfig {
    light: ThemeVars
    dark: ThemeVars
    radius?: string
    fontFamily?: string
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const RADIUS = /^\d{1,2}(\.\d{1,4})?$/
const FONT_FAMILY = /^[A-Za-z0-9 -]{1,100}$/

/**
 * Theme values end up inside a raw <style> tag, so refuse anything that is not a plain
 * hex color, number or font name. The API validates the same rules; this guards old rows.
 */
export function isSafeThemeConfig(config: {
    light: object
    dark: object
    radius?: string
    fontFamily?: string
}): boolean {
    const colorsOk = [config.light, config.dark].every((vars) =>
        Object.values(vars).every((v) => typeof v === 'string' && HEX_COLOR.test(v)),
    )
    const radiusOk = config.radius == null || RADIUS.test(config.radius)
    const fontOk = !config.fontFamily || FONT_FAMILY.test(config.fontFamily)
    return colorsOk && radiusOk && fontOk
}

export function buildThemeCss(config: ThemeConfig): string {
    if (!isSafeThemeConfig(config)) return ''
    const l = config.light
    const d = config.dark
    const radius = config.radius ? `${config.radius}rem` : undefined
    const font = config.fontFamily

    const varsToCSS = (v: ThemeVars) => `
    --background: ${v.background};
    --foreground: ${v.foreground};
    --card: ${v.card};
    --card-foreground: ${v.cardForeground};
    --popover: ${v.popover};
    --popover-foreground: ${v.popoverForeground};
    --primary: ${v.primary};
    --primary-foreground: ${v.primaryForeground};
    --secondary: ${v.secondary};
    --secondary-foreground: ${v.secondaryForeground};
    --muted: ${v.muted};
    --muted-foreground: ${v.mutedForeground};
    --accent: ${v.accent};
    --accent-foreground: ${v.accentForeground};
    --destructive: ${v.destructive};
    --border: ${v.border};
    --input: ${v.input};
    --ring: ${v.ring};
    --chart-1: ${v.chart1};
    --chart-2: ${v.chart2};
    --chart-3: ${v.chart3};
    --chart-4: ${v.chart4};
    --chart-5: ${v.chart5};
    --sidebar: ${v.sidebar};
    --sidebar-foreground: ${v.sidebarForeground};
    --sidebar-primary: ${v.sidebarPrimary};
    --sidebar-primary-foreground: ${v.sidebarPrimaryForeground};
    --sidebar-accent: ${v.sidebarAccent};
    --sidebar-accent-foreground: ${v.sidebarAccentForeground};
    --sidebar-border: ${v.sidebarBorder};
    --sidebar-ring: ${v.sidebarRing};`

    return `:root {${varsToCSS(l)}${radius ? `\n    --radius: ${radius};` : ''}${font ? `\n    --font-sans: '${font}', sans-serif;` : ''}
}
.dark {${varsToCSS(d)}
}`
}
