'use client'

import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Match UiFormInput: rounded control, compact label/hint/error spacing.
const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

interface UiMonthPickerProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    label?: string
    hint?: string
    error?: string
    className?: string
}

export function UiMonthPicker({
    value,
    onChange,
    disabled = false,
    label,
    hint,
    error,
    className,
}: UiMonthPickerProps) {
    const [year = '', month = ''] = value.split('-')
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 21 }, (_, index) => currentYear - 10 + index)
    const triggerClassName = cn(
        'focus-visible:border-primary focus-visible:ring-0 border-transparent bg-muted/30 dark:bg-white/5 dark:hover:bg-white/10 h-9 w-full rounded-full border bg-clip-padding px-2.5 py-1 text-sm outline-none select-none',
        error && 'border-destructive focus-visible:border-destructive',
    )

    const changeMonth = (nextMonth: string) => onChange(`${year}-${nextMonth}`)
    const changeYear = (nextYear: string) => onChange(`${nextYear}-${month}`)

    return (
        <div className={cn('space-y-1.5', className)}>
            {label && <Label className="text-sm font-medium">{label}</Label>}
            <div className="grid grid-cols-2 gap-2">
                <Select value={month} onValueChange={changeMonth} disabled={disabled}>
                    <SelectTrigger
                        aria-label="Month"
                        aria-invalid={!!error}
                        className={triggerClassName}
                    >
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="border-border/60 rounded-2xl shadow-lg">
                        {MONTHS.map((monthLabel, index) => {
                            const monthValue = String(index + 1).padStart(2, '0')
                            return (
                                <SelectItem
                                    key={monthValue}
                                    value={monthValue}
                                    className="rounded-xl px-3 py-2"
                                >
                                    {monthLabel}
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
                <Select value={year} onValueChange={changeYear} disabled={disabled}>
                    <SelectTrigger
                        aria-label="Year"
                        aria-invalid={!!error}
                        className={triggerClassName}
                    >
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="border-border/60 rounded-2xl shadow-lg">
                        {years.map((yearValue) => (
                            <SelectItem
                                key={yearValue}
                                value={String(yearValue)}
                                className="rounded-xl px-3 py-2"
                            >
                                {yearValue}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
            {error && (
                <p className="text-destructive text-xs" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}
