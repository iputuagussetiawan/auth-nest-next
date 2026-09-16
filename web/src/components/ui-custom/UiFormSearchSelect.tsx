import React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Controller, FieldError, useFormContext } from 'react-hook-form'

import { UiButton } from '@/components/ui-custom/UiButton'
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

interface BaseProps {
    name?: string
    label?: string
    options: Option[]
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    isSubmitting?: boolean
    error?: FieldError
    className?: string
}

type UiFormSearchSelectProps = BaseProps & (
    | {
          multiple: true
          value?: string[]
          onChange?: (value: string[]) => void
      }
    | {
          multiple?: false
          value?: string
          onChange?: (value: string) => void
      }
)

export const UiFormSearchSelect = (props: UiFormSearchSelectProps) => {
    const {
        name,
        label,
        options,
        placeholder = 'Select option...',
        searchPlaceholder = 'Search...',
        emptyMessage = 'No results found.',
        isSubmitting,
        error,
        className,
    } = props
    const [open, setOpen] = React.useState(false)
    const form = useFormContext()
    const isControlled = props.value !== undefined && props.onChange !== undefined
    const multiple = props.multiple === true

    const renderSelect = (selectedValue: string | string[] | undefined, select: (nextValue: string) => void) => {
        const selectedValues = Array.isArray(selectedValue) ? selectedValue : []
        const selectedOption = !multiple && typeof selectedValue === 'string'
            ? options.find((option) => option.value === selectedValue)
            : undefined
        const selectedLabels = options
            .filter((option) => selectedValues.includes(option.value))
            .map((option) => option.label)

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <UiButton
                        id={name}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={isSubmitting}
                        className={cn(
                            'w-full justify-between font-normal',
                            error && 'border-destructive focus-visible:ring-destructive',
                            (!selectedValue || (multiple && selectedValues.length === 0)) && 'text-muted-foreground',
                            className,
                        )}
                    >
                        <span className="min-w-0 truncate">
                            {multiple
                                ? selectedLabels.length === 0
                                    ? placeholder
                                    : selectedLabels.length === 1
                                      ? selectedLabels[0]
                                      : `${selectedLabels.length} selected`
                                : selectedOption?.label ?? placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </UiButton>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => {
                                    const checked = multiple
                                        ? selectedValues.includes(option.value)
                                        : typeof selectedValue === 'string' && option.value === selectedValue

                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={option.label}
                                            className="gap-1"
                                            onSelect={() => {
                                                select(option.value)
                                                if (!multiple) setOpen(false)
                                            }}
                                        >
                                            <span
                                                className={cn(
                                                    'mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                                                    checked
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-muted-foreground/40 bg-transparent',
                                                )}
                                            >
                                                <Check className={cn('h-3 w-3', checked ? 'opacity-100' : 'opacity-0')} />
                                            </span>
                                            {option.label}
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }

    if (isControlled) {
        if (multiple) {
            const selectedValues = Array.isArray(props.value) ? props.value : []
            return (
                <div className="min-w-0">
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
                    {renderSelect(selectedValues, (nextValue) => {
                        const nextValues = selectedValues.includes(nextValue)
                            ? selectedValues.filter((value) => value !== nextValue)
                            : [...selectedValues, nextValue]
                        const change = props.onChange as ((value: string[]) => void) | undefined
                        change?.(nextValues)
                    })}
                    {error && <span className="text-destructive mt-1 text-xs">{error.message}</span>}
                </div>
            )
        }

        const change = props.onChange as ((value: string) => void) | undefined
        return (
            <div className="min-w-0">
                {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
                {renderSelect(props.value, (nextValue) => change?.(nextValue))}
                {error && <span className="text-destructive mt-1 text-xs">{error.message}</span>}
            </div>
        )
    }

    if (!name || !form) return null

    return (
        <Controller
            name={name}
            control={form.control}
            render={({ field }) => (
                <Field>
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
                    {renderSelect(field.value, (nextValue) => {
                        if (multiple) {
                            const selectedValues = Array.isArray(field.value) ? field.value : []
                            const nextValues = selectedValues.includes(nextValue)
                                ? selectedValues.filter((value: string) => value !== nextValue)
                                : [...selectedValues, nextValue]
                            form.setValue(name, nextValues, { shouldValidate: true })
                        } else {
                            form.setValue(name, nextValue, { shouldValidate: true })
                        }
                    })}
                    {error && <span className="text-destructive mt-1 text-xs">{error.message}</span>}
                </Field>
            )}
        />
    )
}

UiFormSearchSelect.displayName = 'UiFormSearchSelect'
