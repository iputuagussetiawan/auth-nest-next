import { DateFormat, type DateFormatType } from '@/types/date'
import { format, isValid } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>
    name: FieldPath<TFieldValues>
    label: string
    error?: { message?: string }
    /** Format shown on the button (e.g., "PPP" or "dd MMM yyyy") */
    displayFormat?: DateFormat | DateFormatType
    /** Format stored in form state. Defaults to ISO datetime for existing callers. */
    outputFormat?: DateFormat | DateFormatType
    clearable?: boolean
    minYear?: number
    maxYear?: number
}

export function UiFormDatePicker<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    error,
    displayFormat = DateFormat.FULL_DISPLAY,
    outputFormat,
    clearable = false,
    minYear = 1960,
    maxYear = new Date().getFullYear() + 10,
}: DatePickerProps<TFieldValues>) {
    const getValidDate = (value: unknown) => {
        if (
            !value ||
            (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date))
        ) {
            return undefined
        }
        const date = new Date(value)
        return isValid(date) ? date : undefined
    }

    return (
        <div className="space-y-1.5">
            <Label htmlFor={name} className="text-sm font-medium">
                {label}
            </Label>
            <Controller
                control={control}
                name={name}
                render={({ field }) => {
                    const selectedDate = getValidDate(field.value)

                    return (
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id={name}
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            'focus-visible:border-primary focus-visible:ring-0 border-transparent bg-muted/30 dark:bg-white/5 dark:hover:bg-white/10 h-9 w-full justify-between rounded-full border bg-clip-padding px-2.5 py-1 text-sm font-normal outline-none select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/5 disabled:opacity-50 dark:disabled:bg-white/10',
                                            !field.value && 'text-muted-foreground',
                                            error && 'border-destructive focus-visible:ring-destructive',
                                        )}
                                    >
                                        <span className="flex items-center gap-2 overflow-hidden">
                                            <CalendarIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                                            <span className="truncate">
                                                {field.value && selectedDate
                                                    ? format(selectedDate, displayFormat)
                                                    : 'Pick a date'}
                                            </span>
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="z-[1000] w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => {
                                            if (!date) return
                                            field.onChange(
                                                outputFormat
                                                    ? format(date, outputFormat)
                                                    : date.toISOString(),
                                            )
                                        }}
                                        captionLayout="dropdown"
                                        startMonth={new Date(minYear, 0)}
                                        endMonth={new Date(maxYear, 11)}
                                        disabled={(date) =>
                                            date.getFullYear() > maxYear ||
                                            date.getFullYear() < minYear
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                            {clearable && field.value && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground size-9 shrink-0 rounded-full"
                                    onClick={() => field.onChange('')}
                                    aria-label={`Clear ${label.toLowerCase()}`}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )
                }}
            />
            {error && <p className="text-destructive text-xs">{error.message}</p>}
        </div>
    )
}
