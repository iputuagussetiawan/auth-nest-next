import {
    Chrome,
    Compass,
    Globe,
    Laptop,
    LucideIcon, // 👈 Use LucideIcon instead of TypeIcon
    Monitor,
    Smartphone,
    Terminal,
} from 'lucide-react'

interface SessionDetails {
    Icon: LucideIcon // 👈 Correct type here
    browser: string
    os: string
    isMobile: boolean
}

export const parseUserAgent = (ua: string): SessionDetails => {
    const lowerUA = ua.toLowerCase()

    // --- 1. Browser Detection ---
    const getBrowser = () => {
        if (lowerUA.includes('edg/')) return 'Edge'
        if (lowerUA.includes('opr/') || lowerUA.includes('opera')) return 'Opera'
        if (lowerUA.includes('apidog')) return 'Apidog'
        if (lowerUA.includes('firefox') || lowerUA.includes('fxios')) return 'Firefox'
        if (lowerUA.includes('chrome') || lowerUA.includes('crios')) return 'Chrome'
        if (lowerUA.includes('safari') && !lowerUA.includes('chrome')) return 'Safari'
        if (lowerUA.includes('node')) return 'Node.js'
        return 'Other Browser'
    }

    // --- 2. OS & Device Detection ---
    const getDeviceContext = () => {
        if (lowerUA.includes('android')) return { os: 'Android', icon: Smartphone, isMobile: true }
        if (/iphone|ipad|ipod/.test(lowerUA)) return { os: 'iOS', icon: Smartphone, isMobile: true }
        if (lowerUA.includes('windows')) return { os: 'Windows', icon: Laptop, isMobile: false }
        if (lowerUA.includes('mac os') || lowerUA.includes('macintosh'))
            return { os: 'macOS', icon: Laptop, isMobile: false }
        if (lowerUA.includes('linux')) return { os: 'Linux', icon: Laptop, isMobile: false }
        return { os: 'Web Client', icon: Globe, isMobile: false }
    }

    const browser = getBrowser()
    const { os, icon: OS_Icon, isMobile } = getDeviceContext()

    // --- 3. Icon Refinement ---
    let FinalIcon: LucideIcon = OS_Icon

    if (browser === 'Chrome') FinalIcon = Chrome
    if (browser === 'Safari' && !isMobile) FinalIcon = Compass
    if (browser === 'Node.js') FinalIcon = Terminal

    // If we couldn't determine a specific OS icon above
    if (browser === 'Other Browser' && !isMobile) FinalIcon = Monitor

    return {
        Icon: FinalIcon,
        browser,
        os,
        isMobile,
    }
}
