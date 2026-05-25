'use client'

import * as React from 'react'
import { Check } from 'lucide-react'

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

interface AutoSuggestProps<T> {
    items: T[]
    value: string
    onValueChange: (value: string) => void
    onSelect: (item: T) => void
    placeholder?: string
    emptyMessage?: string
    getSearchValue: (item: T) => string
    renderItem: (item: T) => React.ReactNode
}

const AutoSuggestInner = <T extends { id: string | number }>(
    {
        items,
        value,
        onValueChange,
        onSelect,
        placeholder = 'Search...',
        emptyMessage = 'No data found.',
        getSearchValue,
        renderItem,
    }: AutoSuggestProps<T>,
    ref: React.ForwardedRef<HTMLInputElement>,
) => {
    const [open, setOpen] = React.useState(false)

    const filteredItems = items.filter((item) =>
        getSearchValue(item).toLowerCase().includes(value.toLowerCase()),
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Command
                shouldFilter={false}
                className="overflow-visible border-none! bg-transparent p-0 shadow-none!"
            >
                <PopoverTrigger asChild>
                    <CommandInput
                        ref={ref}
                        placeholder={placeholder}
                        value={value}
                        onValueChange={(search) => {
                            onValueChange(search)
                            setOpen(search.length > 0)
                        }}
                        onFocus={() => {
                            if (value.length > 0) setOpen(true)
                        }}
                        className="border-none! ring-0! outline-hidden! focus:border-none!"
                    />
                </PopoverTrigger>

                <PopoverContent
                    className="z-1009999 mt-1 w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={() => setOpen(false)}
                >
                    <CommandList className="bg-popover rounded-lg border shadow-md">
                        {filteredItems.length === 0 ? (
                            <CommandEmpty className="text-muted-foreground py-2 text-center text-sm">
                                {emptyMessage}
                            </CommandEmpty>
                        ) : (
                            <CommandGroup className="p-0">
                                {filteredItems.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={getSearchValue(item)}
                                        onSelect={() => {
                                            onSelect(item)
                                            setOpen(false)
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex flex-1 items-center gap-2">
                                                {renderItem(item)}
                                            </div>
                                            <Check
                                                className={cn(
                                                    'h-4 w-4',
                                                    value.toLowerCase() ===
                                                        getSearchValue(item).toLowerCase()
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </PopoverContent>
            </Command>
        </Popover>
    )
}

// Trick untuk mengekspor komponen Generik dengan forwardRef
export const AutoSuggest = React.forwardRef(AutoSuggestInner) as <
    T extends { id: string | number },
>(
    props: AutoSuggestProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> },
) => React.ReactElement
;(AutoSuggest as any).displayName = 'AutoSuggest'
