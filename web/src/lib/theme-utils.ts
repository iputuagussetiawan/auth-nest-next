export interface ThemeConfig {
    primaryColor: string
    accentColor: string
    backgroundColor: string
    foregroundColor: string
    cardColor: string
    borderRadius: string
    fontFamily: string
    heroVariant: 'centered' | 'fullwidth'
    heroBackground: 'gradient' | 'solid' | 'mesh'
    darkMode: boolean
}

function hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    let h = 0
    let s = 0

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
            case g: h = ((b - r) / d + 2) / 6; break
            case b: h = ((r - g) / d + 4) / 6; break
        }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function buildThemeCss(config: ThemeConfig): string {
    const primary = hexToHsl(config.primaryColor)
    const accent = hexToHsl(config.accentColor)
    const bg = hexToHsl(config.backgroundColor)
    const fg = hexToHsl(config.foregroundColor)
    const card = hexToHsl(config.cardColor)
    const radius = `${config.borderRadius}rem`

    return `
:root {
  --primary: ${primary};
  --primary-foreground: 0 0% 98%;
  --accent: ${accent};
  --accent-foreground: ${fg};
  --background: ${bg};
  --foreground: ${fg};
  --card: ${card};
  --card-foreground: ${fg};
  --radius: ${radius};
  --font-sans: '${config.fontFamily}', sans-serif;
}
`.trim()
}
