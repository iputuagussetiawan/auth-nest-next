'use client'

import * as React from 'react'
import { CheckIcon } from 'lucide-react'
import { Checkbox as CheckboxPrimitive, RadioGroup as RadioGroupPrimitive, Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function UiCheckbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer border-border focus-visible:border-primary focus-visible:ring-0 bg-muted/30 dark:bg-white/5 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
            >
                <CheckIcon />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
}

function UiRadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return (
        <RadioGroupPrimitive.Root
            data-slot="radio-group"
            className={cn('grid w-full gap-2', className)}
            {...props}
        />
    )
}

function UiRadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
    return (
        <RadioGroupPrimitive.Item
            data-slot="radio-group-item"
            className={cn(
                'group/radio-group-item peer border-border focus-visible:border-primary focus-visible:ring-0 bg-muted/30 dark:bg-white/5 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary relative flex aspect-square size-4 shrink-0 rounded-full border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator
                data-slot="radio-group-indicator"
                className="flex size-4 items-center justify-center"
            >
                <span className="bg-primary-foreground absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    )
}

function UiSwitch({
    className,
    size = 'default',
    ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & { size?: 'sm' | 'default' }) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            data-size={size}
            className={cn(
                'peer group/switch focus-visible:border-primary focus-visible:ring-0 data-checked:bg-primary data-unchecked:bg-border dark:data-unchecked:bg-white/15 relative inline-flex shrink-0 items-center rounded-full border-transparent outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]',
                className,
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className="bg-background dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
            />
        </SwitchPrimitive.Root>
    )
}

export { UiCheckbox, UiRadioGroup, UiRadioGroupItem, UiSwitch }
