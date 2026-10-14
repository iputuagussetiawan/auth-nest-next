import { DateFormat, type DateFormatType } from '@/types/date'
import { format, isValid } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{label}</label>
            <Controller
                control={control}
                name={name}
                render={({ field }) => {
                    const selectedDate = getValidDate(field.value)

                    return (
                        <div className="flex items-start gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !field.value && 'text-muted-foreground',
                                            error &&
                                                'border-destructive focus-visible:ring-destructive',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value && selectedDate ? (
                                            format(selectedDate, displayFormat)
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
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
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
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
