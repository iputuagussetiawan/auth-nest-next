'use client'

import * as React from 'react'
import { Select as SelectPrimitive } from 'radix-ui'
import { Check, ChevronDownIcon, ChevronsUpDown, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
import { NativeSelectOption, NativeSelectOptGroup } from '@/components/ui/native-select'
import { SelectScrollUpButton, SelectScrollDownButton } from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface UiSelectItem {
    id: string
    label: string
}

interface UiSelectBaseProps<T extends UiSelectItem> {
    items: T[]
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    isLoading?: boolean
    isError?: boolean
    className?: string
    unselectedLabel?: string
    renderItem?: (item: T) => React.ReactNode
    renderBadge?: (item: T) => React.ReactNode
    renderButtonLabel?: (selectedItems: T[]) => React.ReactNode
}

interface UiSelectSingleProps<T extends UiSelectItem> extends UiSelectBaseProps<T> {
    multiple?: false
    value?: string
    onChange?: (value: string) => void
}

interface UiSelectMultiProps<T extends UiSelectItem> extends UiSelectBaseProps<T> {
    multiple: true
    value?: string[]
    onChange?: (value: string[]) => void
}

type UiSelectProps<T extends UiSelectItem> = UiSelectSingleProps<T> | UiSelectMultiProps<T>

// ─────────────────────────────────────────────
// Combobox-based searchable select
// ─────────────────────────────────────────────

function UiSelect<T extends UiSelectItem>({
    multiple = false,
    items = [],
    value,
    onChange,
    placeholder = 'Select...',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results found.',
    isLoading = false,
    isError = false,
    className,
    unselectedLabel,
    renderItem,
    renderBadge,
    renderButtonLabel,
}: UiSelectProps<T>) {
    const [open, setOpen] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState<string | string[]>(multiple ? [] : '')

    const activeValue = value !== undefined ? value : internalValue

    const selectedIds = React.useMemo(
        () =>
            multiple
                ? Array.isArray(activeValue)
                    ? activeValue
                    : []
                : activeValue
                  ? [activeValue as string]
                  : [],
        [activeValue, multiple],
    )

    const isSelected = (id: string) => selectedIds.includes(id)
    const selectedItems = items.filter((item) => selectedIds.includes(item.id))

    const buttonLabel = React.useMemo(() => {
        if (renderButtonLabel) return renderButtonLabel(selectedItems)
        if (multiple) {
            return selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : (unselectedLabel ?? placeholder)
        }
        const found = items.find((item) => item.id === (activeValue as string))
        return found ? found.label : (unselectedLabel ?? placeholder)
    }, [
        renderButtonLabel,
        multiple,
        selectedIds,
        activeValue,
        items,
        placeholder,
        unselectedLabel,
        selectedItems,
    ])

    const commit = (next: string | string[]) => {
        if (onChange) {
            if (multiple) {
                ;(onChange as (value: string[]) => void)(next as string[])
            } else {
                ;(onChange as (value: string) => void)(next as string)
            }
        } else {
            setInternalValue(next)
        }
    }

    const handleSelect = (id: string) => {
        if (multiple) {
            commit(isSelected(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id])
        } else {
            commit(id === (activeValue as string) ? '' : id)
            setOpen(false)
        }
    }

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        commit(selectedIds.filter((i) => i !== id))
    }

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse p-2 text-sm">Loading...</div>
    }
    if (isError) {
        return <div className="text-destructive p-2 text-sm">Failed to load data.</div>
    }

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="focus-visible:border-primary focus-visible:ring-0 border-transparent bg-muted/30 dark:bg-white/5 dark:hover:bg-white/10 hover:bg-muted/30 h-9 w-full justify-between rounded-full bg-clip-padding px-2.5 py-1 text-sm font-normal disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/5 disabled:opacity-50 dark:disabled:bg-white/10"
                    >
                        <span className="truncate">{buttonLabel}</span>
                        <ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.label}
                                        onSelect={() => handleSelect(item.id)}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <div className="flex flex-1 items-center gap-2 overflow-hidden">
                                                {renderItem ? (
                                                    renderItem(item)
                                                ) : (
                                                    <span className="truncate">{item.label}</span>
                                                )}
                                            </div>
                                            <Check
                                                className={cn(
                                                    'h-4 w-4 shrink-0',
                                                    isSelected(item.id)
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {multiple && selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedItems.map((item) => (
                        <Badge
                            key={item.id}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                        >
                            {renderBadge ? (
                                renderBadge(item)
                            ) : (
                                <span className="text-xs">{item.label}</span>
                            )}
                            <button
                                type="button"
                                onClick={(e) => handleRemove(item.id, e)}
                                className="hover:bg-muted ml-1 rounded-full p-0.5 transition-colors outline-none hover:cursor-pointer"
                            >
                                <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                                <span className="sr-only">Remove {item.label}</span>
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}

function UiSelectContent({
    className,
    children,
    position = 'item-aligned',
    align = 'center',
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot="select-content"
                data-align-trigger={position === 'item-aligned'}
                className={cn(
                    'bg-popover text-popover-foreground ring-border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)] ring-1 duration-100 data-[align-trigger=true]:animate-none',
                    position === 'popper' &&
                        'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                    className,
                )}
                position={position}
                align={align}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                    data-position={position}
                    className={cn(
                        'data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)',
                        position === 'popper' && '',
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    )
}

function UiSelectTrigger({
    className,
    size = 'default',
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
    size?: 'sm' | 'default'
}) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                "data-placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 border-transparent bg-muted/30 dark:bg-white/5 dark:hover:bg-white/10 flex w-fit appearance-none items-center justify-between gap-1.5 rounded-full border bg-clip-padding py-2 pr-2 pl-2.5 text-sm whitespace-nowrap outline-none transition-colors select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/5 disabled:opacity-50 dark:disabled:bg-white/10 data-[size=default]:h-9 data-[size=sm]:h-8 data-[size=sm]:rounded-full *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    )
}

function UiNativeSelect({ className, size = 'default', ...props }: Omit<React.ComponentProps<'select'>, 'size'> & { size?: 'sm' | 'default' }) {
    return (
        <div
            className={cn(
                'group/native-select relative w-full',
                className,
            )}
            data-slot="native-select-wrapper"
            data-size={size}
        >
            <select
                data-slot="native-select"
                data-size={size}
                className={cn(
                    'selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 border-transparent bg-muted/30 dark:bg-white/5 dark:hover:bg-white/10 h-9 w-full min-w-0 appearance-none rounded-full border bg-clip-padding py-1 pr-8 pl-2.5 text-sm outline-none transition-colors select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/5 disabled:opacity-50 dark:disabled:bg-white/10 data-[size=sm]:h-8 data-[size=sm]:rounded-full data-[size=sm]:py-0.5',
                )}
                {...props}
            />
            <ChevronDownIcon
                className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
                aria-hidden="true"
                data-slot="native-select-icon"
            />
        </div>
    )
}

export { UiSelect, UiSelectTrigger, UiSelectContent, UiNativeSelect, NativeSelectOption, NativeSelectOptGroup }
