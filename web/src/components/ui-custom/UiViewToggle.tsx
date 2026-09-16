import { LayoutGrid, List } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface UiViewToggleProps {
    value: 'grid' | 'list'
    onChange: (value: 'grid' | 'list') => void
}

export function UiViewToggle({ value, onChange }: UiViewToggleProps) {
    return (
        <ToggleGroup
            type="single"
            value={value}
            onValueChange={(v) => v && onChange(v as 'grid' | 'list')}
            className="bg-muted gap-0 rounded-full p-[3px]"
        >
            <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground gap-1.5 !rounded-full border-transparent px-3 py-1 text-xs font-medium transition-all"
            >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
            </ToggleGroupItem>
            <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground gap-1.5 !rounded-full border-transparent px-3 py-1 text-xs font-medium transition-all"
            >
                <List className="h-3.5 w-3.5" /> List
            </ToggleGroupItem>
        </ToggleGroup>
    )
}
