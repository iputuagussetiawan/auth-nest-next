'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ArrowRight, CalendarIcon, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface UiDateRangePickerProps {
    /** Controlled value */
    value?: DateRange
    /** Called when start or end date changes */
    onChange?: (range: DateRange | undefined) => void
    /** Placeholder shown when no date is selected */
    placeholder?: string
    /** Date format string (date-fns) — default: 'dd MMM yyyy' */
    dateFormat?: string
    /** Disable dates before this date */
    fromDate?: Date
    /** Disable dates after this date */
    toDate?: Date
    /** Whether to show a clear button when a date is selected */
    clearable?: boolean
    disabled?: boolean
    className?: string
    /** Error message — shown in red below the trigger */
    error?: string
    /** Label above the trigger */
    label?: string
    /** Required asterisk on label */
    required?: boolean
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function UiDateRangePicker({
    value,
    onChange,
    placeholder = 'Pilih tanggal...',
    dateFormat = 'dd MMM yyyy',
    fromDate,
    toDate,
    clearable = true,
    disabled = false,
    className,
    error,
    label,
    required = false,
}: UiDateRangePickerProps) {
    const [open, setOpen] = React.useState(false)

    // Internal state for uncontrolled usage
    const [internalRange, setInternalRange] = React.useState<DateRange | undefined>(undefined)

    const activeRange = value !== undefined ? value : internalRange

    const handleChange = (range: DateRange | undefined) => {
        // 1. Update state (controlled atau uncontrolled)
        if (onChange) {
            onChange(range)
        } else {
            setInternalRange(range)
        }

        // 2. FIXED: Hanya tutup otomatis jika kriteria "Range" terpenuhi (ada From DAN To)
        // Jika hanya mengecek range?.from, dia akan tutup saat klik pertama kali.
        if (range?.from && range?.to) {
            setOpen(false)
        }
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onChange) {
            onChange(undefined)
        } else {
            setInternalRange(undefined)
        }
    }

    const hasValue = activeRange?.from || activeRange?.to

    const triggerLabel = React.useMemo(() => {
        if (!activeRange?.from && !activeRange?.to) return null
        if (activeRange.from && !activeRange.to) {
            return (
                <span className="flex items-center gap-1.5">
                    <span>{format(activeRange.from, dateFormat)}</span>
                    <ArrowRight className="text-muted-foreground h-3 w-3" />
                    <span className="text-muted-foreground">End date</span>
                </span>
            )
        }
        if (activeRange.from && activeRange.to) {
            return (
                <span className="flex items-center gap-1.5">
                    <span>{format(activeRange.from, dateFormat)}</span>
                    <ArrowRight className="text-muted-foreground h-3 w-3" />
                    <span>{format(activeRange.to, dateFormat)}</span>
                </span>
            )
        }
        return null
    }, [activeRange, dateFormat])

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            {/* Label */}
            {label && (
                <label className="text-sm leading-none font-medium">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}

            <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            'w-full justify-between font-normal',
                            !hasValue && 'text-muted-foreground',
                            error && 'border-destructive focus-visible:ring-destructive',
                        )}
                    >
                        <span className="flex items-center gap-2 overflow-hidden">
                            <CalendarIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                            <span className="truncate">{triggerLabel ?? placeholder}</span>
                        </span>

                        {/* Clear button */}
                        {clearable && hasValue && !disabled && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={handleClear}
                                onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
                                className="text-muted-foreground hover:bg-muted hover:text-foreground ml-2 rounded-full p-0.5 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                                <span className="sr-only">Clear dates</span>
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <Calendar
                        mode="range"
                        selected={activeRange}
                        onSelect={handleChange}
                        numberOfMonths={2}
                        captionLayout="dropdown" // AKTIFKAN INI: Menampilkan dropdown bulan & tahun
                        autoFocus
                        startMonth={new Date(2023, 0)}
                        endMonth={new Date(2100, 11)}
                        hidden={fromDate ? { before: fromDate } : undefined}
                        disabled={fromDate ? { before: fromDate } : undefined}
                    />
                </PopoverContent>
            </Popover>

            {/* Error message */}
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    )
}
