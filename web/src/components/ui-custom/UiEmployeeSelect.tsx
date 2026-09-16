'use client'

import Link from 'next/link'
import { UserPlus } from 'lucide-react'

import { UiImage } from '@/components/ui-custom/UiImage'
import { UiSelect } from '@/components/ui-custom/UiSelect'

interface EmployeeLike {
    id: string
    employeeCode: string
    user?: {
        firstName: string | null
        lastName: string | null
        profilePicture: string | null
    } | null
}

interface UiEmployeeSelectProps<T extends EmployeeLike> {
    employees: T[]
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
    emptyMessage?: string
    disabledMessage?: string
    /** Shown as a hint link below the field when there are zero employees to pick from. */
    addHref?: string
    addLabel?: string
    className?: string
}

function employeeName(e: EmployeeLike) {
    return e.user?.firstName ? `${e.user.firstName} ${e.user.lastName ?? ''}`.trim() : e.employeeCode
}

/**
 * Searchable employee picker with avatar — disambiguates employees sharing the
 * same display name (e.g. one user account tied to multiple employee records)
 * by appending their employee code, and offers a shortcut to add an employee
 * when the list is empty.
 */
export function UiEmployeeSelect<T extends EmployeeLike>({
    employees,
    value,
    onChange,
    disabled = false,
    placeholder = 'No manager',
    emptyMessage,
    disabledMessage = 'Select a tenant first',
    addHref,
    addLabel = 'Add one',
    className,
}: UiEmployeeSelectProps<T>) {
    const items = employees.map((e) => {
        const baseName = employeeName(e)
        const nameCount = employees.filter((other) => employeeName(other) === baseName).length
        return { ...e, label: nameCount > 1 ? `${baseName} (${e.employeeCode})` : baseName }
    })

    return (
        <div className="space-y-1.5">
            <UiSelect
                items={items}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                unselectedLabel={placeholder}
                searchPlaceholder="Search employees..."
                emptyMessage={disabled ? disabledMessage : (emptyMessage ?? 'No employees found')}
                className={disabled ? `pointer-events-none opacity-60 ${className ?? ''}` : className}
                renderItem={(e) => (
                    <div className="flex min-w-0 items-center gap-2">
                        {e.user?.profilePicture ? (
                            <UiImage src={e.user.profilePicture} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover" />
                        ) : (
                            <span className="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                {e.label.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-sm">{e.label}</p>
                            <p className="text-muted-foreground truncate text-xs">{e.employeeCode}</p>
                        </div>
                    </div>
                )}
                renderButtonLabel={(selected) => {
                    const e = selected[0]
                    if (!e) return placeholder
                    return (
                        <span className="flex min-w-0 items-center gap-2">
                            {e.user?.profilePicture ? <UiImage src={e.user.profilePicture} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" /> : null}
                            <span className="truncate">{e.label}</span>
                        </span>
                    )
                }}
            />
            {!disabled && addHref && employees.length === 0 && (
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    No employees in this tenant yet.
                    <Link href={addHref} target="_blank" className="text-primary inline-flex items-center gap-1 font-medium hover:underline">
                        <UserPlus className="h-3 w-3" /> {addLabel}
                    </Link>
                </p>
            )}
        </div>
    )
}
