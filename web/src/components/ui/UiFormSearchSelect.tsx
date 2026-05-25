import React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Controller, FieldError, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Field, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Option {
    label: string
    value: string
}

interface UiFormSearchSelectProps {
    name: string
    label?: string
    options: Option[]
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    isSubmitting?: boolean
    error?: FieldError
    className?: string
}

export const UiFormSearchSelect = ({
    name,
    label,
    options,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results found.',
    isSubmitting,
    error,
    className,
}: UiFormSearchSelectProps) => {
    const [open, setOpen] = React.useState(false)
    const { control, setValue } = useFormContext()

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Field>
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id={name}
                                variant="outline"
                                role="combobox"
                                disabled={isSubmitting}
                                className={cn(
                                    'w-full justify-between font-normal',
                                    error
                                        ? 'border-destructive focus-visible:ring-destructive'
                                        : '',
                                    !field.value && 'text-muted-foreground',
                                    className,
                                )}
                            >
                                {field.value
                                    ? options.find((opt) => opt.value === field.value)?.label
                                    : placeholder}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0" align="start">
                            <Command>
                                <CommandInput placeholder={searchPlaceholder} />
                                <CommandList>
                                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                                    <CommandGroup>
                                        {options.map((option) => (
                                            <CommandItem
                                                key={option.value}
                                                value={option.label}
                                                onSelect={() => {
                                                    setValue(name, option.value, {
                                                        shouldValidate: true,
                                                    })
                                                    setOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        option.value === field.value
                                                            ? 'opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                                {option.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {error && (
                        <span className="text-destructive mt-1 text-xs">{error.message}</span>
                    )}
                </Field>
            )}
        />
    )
}

UiFormSearchSelect.displayName = 'UiFormSearchSelect'
