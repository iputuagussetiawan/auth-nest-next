import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Option {
    label: string
    value: string
}

interface SearchableSelectProps {
    name: string
    label: string
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    options: Option[]
}

export function SearchableSelect({
    name,
    label,
    options,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results found.',
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const { control, setValue } = useFormContext()

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium" htmlFor={name}>
                        {label}
                    </label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id={name}
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className={cn(
                                    'w-full justify-between font-normal',
                                    !field.value && 'text-muted-foreground',
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
                    {fieldState.error && (
                        <p className="text-destructive text-sm">{fieldState.error.message}</p>
                    )}
                </div>
            )}
        />
    )
}
