interface ThemeVars {
    background: string; foreground: string
    card: string; cardForeground: string
    popover: string; popoverForeground: string
    primary: string; primaryForeground: string
    secondary: string; secondaryForeground: string
    muted: string; mutedForeground: string
    accent: string; accentForeground: string
    destructive: string
    border: string; input: string; ring: string
    chart1: string; chart2: string; chart3: string; chart4: string; chart5: string
    sidebar: string; sidebarForeground: string
    sidebarPrimary: string; sidebarPrimaryForeground: string
    sidebarAccent: string; sidebarAccentForeground: string
    sidebarBorder: string; sidebarRing: string
}

interface ThemeConfig {
    light: ThemeVars
    dark: ThemeVars
    radius?: string
    fontFamily?: string
}

export function buildThemeCss(config: ThemeConfig): string {
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
