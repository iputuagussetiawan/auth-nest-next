'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface UiDatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    dateFormat?: string
    /** Batas tanggal paling awal yang bisa dipilih */
    minDate?: Date
    /** Batas tanggal paling akhir yang bisa dipilih */
    maxDate?: Date
    clearable?: boolean
    disabled?: boolean
    className?: string
    error?: string
    label?: string
    required?: boolean
}

export function UiDatePicker({
    value,
    onChange,
    placeholder = 'Pilih tanggal...',
    dateFormat = 'dd MMM yyyy',
    minDate,
    maxDate,
    clearable = true,
    disabled = false,
    className,
    error,
    label,
    required = false,
}: UiDatePickerProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (date: Date | undefined) => {
        onChange?.(date)
        if (date) setOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange?.(undefined)
    }

    // Menggabungkan batasan tanggal untuk properti 'disabled' di v9
    const calendarDisabled = React.useMemo(() => {
        const rules: any[] = []
        if (minDate) rules.push({ before: minDate })
        if (maxDate) rules.push({ after: maxDate })
        return rules.length > 0 ? rules : undefined
    }, [minDate, maxDate])

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
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
                            !value && 'text-muted-foreground',
                            error && 'border-destructive focus-visible:ring-destructive',
                        )}
                    >
                        <span className="flex items-center gap-2 overflow-hidden">
                            <CalendarIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {value ? format(value, dateFormat) : placeholder}
                            </span>
                        </span>

                        {clearable && value && !disabled && (
                            <X
                                className="text-muted-foreground hover:text-foreground ml-2 h-3.5 w-3.5 cursor-pointer"
                                onClick={handleClear}
                            />
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="z-[9999] w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        // Dropdown akan otomatis menyesuaikan dengan min/max date jika ada
                        startMonth={minDate || new Date(1900, 0)}
                        endMonth={maxDate || new Date(2100, 11)}
                        disabled={calendarDisabled}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    )
}
