import { Badge } from '@/components/ui/badge'

interface PermissionNameProps {
    name: string
    className?: string
}

export function PermissionName({ name, className }: PermissionNameProps) {
    const colon = name.indexOf(':')
    if (colon === -1) {
        return <span className={`font-mono text-sm font-medium ${className ?? ''}`}>{name}</span>
    }
    const resource = name.slice(0, colon)
    const action = name.slice(colon + 1)
    return (
        <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
            <span className="font-mono text-sm font-medium">{resource}</span>
            <Badge variant="secondary" className="rounded px-1.5 py-0 font-mono text-xs font-normal">
                {action}
            </Badge>
        </span>
    )
}
