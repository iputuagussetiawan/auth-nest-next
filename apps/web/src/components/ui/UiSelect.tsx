'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'

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
    /**
     * Custom render for each row in the dropdown list.
     * Has access to all fields in your data — not just id/label.
     * The checkmark is always appended automatically.
     *
     * @example
     * renderItem={(person) => (
     *   <div className="flex items-center gap-2">
     *     <img src={person.image} className="h-6 w-6 rounded-full" />
     *     <div>
     *       <p className="text-sm">{person.label}</p>
     *       <p className="text-xs text-muted-foreground">{person.role}</p>
     *     </div>
     *   </div>
     * )}
     */
    renderItem?: (item: T) => React.ReactNode
    /**
     * Custom render for each badge chip (multi-select only).
     * Falls back to item.label if not provided.
     *
     * @example
     * renderBadge={(person) => (
     *   <div className="flex items-center gap-1">
     *     <img src={person.image} className="h-4 w-4 rounded-full" />
     *     <span>{person.label}</span>
     *   </div>
     * )}
     */
    renderBadge?: (item: T) => React.ReactNode
    /**
     * Custom render for the trigger button label.
     * Receives the array of currently selected items.
     * Falls back to "N selected" / item.label if not provided.
     *
     * @example
     * renderButtonLabel={(selected) =>
     *   selected.length === 0 ? 'Pick a member' : `${selected.length} members`
     * }
     */
    renderButtonLabel?: (selectedItems: T[]) => React.ReactNode
}

// Single-select
interface UiSelectSingleProps<T extends UiSelectItem> extends UiSelectBaseProps<T> {
    multiple?: false
    value?: string
    onChange?: (value: string) => void
}

// Multi-select
interface UiSelectMultiProps<T extends UiSelectItem> extends UiSelectBaseProps<T> {
    multiple: true
    value?: string[]
    onChange?: (value: string[]) => void
}

type UiSelectProps<T extends UiSelectItem> = UiSelectSingleProps<T> | UiSelectMultiProps<T>

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function UiSelect<T extends UiSelectItem>({
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

    // ── Derived helpers ──────────────────────────────────────────

    const selectedIds: string[] = multiple
        ? Array.isArray(activeValue)
            ? activeValue
            : []
        : activeValue
          ? [activeValue as string]
          : []

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

    // ── Handlers ─────────────────────────────────────────────────

    const commit = (next: string | string[]) => {
        if (onChange) {
            ;(onChange as (v: any) => void)(next)
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

    // ── Early returns ─────────────────────────────────────────────

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse p-2 text-sm">Loading...</div>
    }
    if (isError) {
        return <div className="text-destructive p-2 text-sm">Failed to load data.</div>
    }

    // ── Render ────────────────────────────────────────────────────

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal"
                    >
                        <span className="truncate">{buttonLabel}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                            {/* Custom or default row */}
                                            <div className="flex flex-1 items-center gap-2 overflow-hidden">
                                                {renderItem ? (
                                                    renderItem(item)
                                                ) : (
                                                    <span className="truncate">{item.label}</span>
                                                )}
                                            </div>
                                            {/* Checkmark always on the right */}
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

            {/* Badges — multi-select only */}
            {multiple && selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedItems.map((item) => (
                        <Badge
                            key={item.id}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                        >
                            {/* Custom or default badge */}
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
