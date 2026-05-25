import { DateFormat, type DateFormatType } from '@/types/date'
import { format, isValid, parse } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Control, Controller } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
    control: Control<any>
    name: string
    label: string
    error?: any
    /** Format shown on the button (e.g., "PPP" or "dd MMM yyyy") */
    displayFormat?: DateFormat | DateFormatType
    minYear?: number
    maxYear?: number
}

export function UiFormDatePicker({
    control,
    name,
    label,
    error,
    displayFormat = DateFormat.FULL_DISPLAY,
    minYear = 1960,
    maxYear = new Date().getFullYear() + 10,
}: DatePickerProps) {
    // Helper to convert the ISO string from form back to Date object
    const getValidDate = (value: any) => {
        if (!value) return undefined
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant={'outline'}
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
                                        if (date) {
                                            // FIX: Returns "2020-09-01T00:00:00.000Z"
                                            field.onChange(date.toISOString())
                                        }
                                    }}
                                    captionLayout="dropdown"
                                    startMonth={new Date(minYear, 0)}
                                    endMonth={new Date(maxYear, 11)}
                                    disabled={(date) =>
                                        date.getFullYear() > maxYear || date.getFullYear() < minYear
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )
                }}
            />
            {error && <p className="text-destructive text-xs">{error.message}</p>}
        </div>
    )
}
