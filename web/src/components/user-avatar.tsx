import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
    name?: string
    image?: string | null
    className?: string
    fallbackClassName?: string
}

export function UserAvatar({ name, image, className, fallbackClassName }: UserAvatarProps) {
    // Helper to get initials (e.g., "John Doe" -> "JD")
    const getInitials = (name?: string) => {
        if (!name) return 'U'
        const parts = name.trim().split(' ')
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        }
        return parts[0][0].toUpperCase()
    }

    return (
        <Avatar className={cn('h-8 w-8 rounded-lg', className)}>
            <AvatarImage src={image ?? undefined} alt={name ?? 'User avatar'} />
            <AvatarFallback
                className={cn(
                    'bg-primary/10 text-primary rounded-lg font-medium',
                    fallbackClassName,
                )}
            >
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    )
}
