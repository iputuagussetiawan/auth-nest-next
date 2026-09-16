export function getDashboardPageTitle(pathname: string) {
    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]

    if (!last || last === 'dashboard') return 'Overview'
    return last.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}
