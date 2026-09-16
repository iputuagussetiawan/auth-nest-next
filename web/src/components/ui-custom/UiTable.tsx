'use client'

import * as React from 'react'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type Row,
    type SortingState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronRight, ChevronsUpDown, ChevronUp, Search } from 'lucide-react'

import { UiInput } from '@/components/ui-custom/UiInput'
import { Button } from '@/components/ui/button'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface UiServerPagination {
    /** 1-based current page */
    page: number
    pageSize: number
    total: number
    totalPages: number
    onPageChange: (page: number) => void
}

interface UiDataTableProps<TData> {
    columns: ColumnDef<TData, unknown>[]
    data: TData[]
    searchPlaceholder?: string
    hideSearch?: boolean
    renderFilters?: React.ReactNode
    totalCount?: number
    /** When provided, pagination is server-driven. */
    pagination?: UiServerPagination
    /** When provided, each row can be expanded to reveal a sub-row. */
    renderSubRow?: (row: Row<TData>) => React.ReactNode
    getRowClassName?: (row: Row<TData>) => string | undefined
}

function UiDataTable<TData>({
    columns,
    data,
    searchPlaceholder = 'Search...',
    hideSearch,
    renderFilters,
    totalCount,
    pagination,
    renderSubRow,
    getRowClassName,
}: UiDataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState('')
    const manual = Boolean(pagination)

    const expanderColumn: ColumnDef<TData, unknown> = {
        id: '__expander',
        header: () => null,
        enableSorting: false,
        enableGlobalFilter: false,
        meta: { className: 'w-10 text-center' },
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={row.getToggleExpandedHandler()}
                aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
            >
                {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </Button>
        ),
    }
    const tableColumns = renderSubRow ? [expanderColumn, ...columns] : columns

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: () => Boolean(renderSubRow),
        manualPagination: manual,
        pageCount: manual ? pagination!.totalPages : undefined,
        initialState: { pagination: { pageSize: 10 } },
    })

    const pageIndex = manual ? pagination!.page - 1 : table.getState().pagination.pageIndex
    const pageCount = manual ? Math.max(pagination!.totalPages, 1) : table.getPageCount() || 1
    const canPrevious = manual ? pagination!.page > 1 : table.getCanPreviousPage()
    const canNext = manual ? pagination!.page < pagination!.totalPages : table.getCanNextPage()
    const goToPage = (page: number) =>
        manual ? pagination!.onPageChange(page + 1) : table.setPageIndex(page)
    const rowCount = manual ? pagination!.total : table.getFilteredRowModel().rows.length
    const pageStart =
        manual && pagination!.total ? (pagination!.page - 1) * pagination!.pageSize + 1 : 0
    const pageEnd = manual
        ? Math.min(pagination!.page * pagination!.pageSize, pagination!.total)
        : rowCount
    const displayCount = manual
        ? `${pageStart}-${pageEnd} of ${rowCount}`
        : `${rowCount} of ${totalCount ?? data.length}`

    return (
        <div className="space-y-4">
            {(renderFilters || !hideSearch) && (
                <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    {!hideSearch && (
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <UiInput
                                placeholder={searchPlaceholder}
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}
                    {renderFilters && (
                        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
                            {renderFilters}
                        </div>
                    )}
                </div>
            )}

            <div className="border-border/60 bg-card overflow-x-auto rounded-2xl border shadow-sm">
                <table className="w-full caption-bottom text-sm">
                    <TableHeader className="bg-muted/60 [&_th+th]:border-border/50 [&_th+th]:border-l">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="hover:bg-transparent">
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            'h-14 px-4 py-3 text-xs font-semibold tracking-wide uppercase',
                                            header.column.columnDef.meta?.className,
                                        )}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <button
                                                className="focus-visible:ring-ring flex items-center gap-1 font-semibold outline-none focus-visible:rounded-sm focus-visible:ring-2"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getCanSort() && (
                                                    <span className="text-muted-foreground">
                                                        {header.column.getIsSorted() === 'asc' ? (
                                                            <ChevronUp className="h-3 w-3" />
                                                        ) : header.column.getIsSorted() ===
                                                          'desc' ? (
                                                            <ChevronDown className="h-3 w-3" />
                                                        ) : (
                                                            <ChevronsUpDown className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="[&_tr:nth-child(even)]:bg-muted/30 [&_tr:hover]:bg-muted/50 dark:[&_tr:nth-child(even)]:bg-muted/20">
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        data-state={row.getIsSelected() && 'selected'}
                                        className={cn(
                                            getRowClassName?.(row),
                                            'hover:bg-transparent',
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(
                                                    '[&+td]:border-border/40 px-4 py-3 whitespace-nowrap [&+td]:border-l',
                                                    cell.column.columnDef.meta?.className,
                                                )}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && renderSubRow && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell
                                                colSpan={tableColumns.length}
                                                className="p-0"
                                            >
                                                {renderSubRow(row)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={tableColumns.length}
                                    className="text-muted-foreground h-24 text-center"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <p className="text-muted-foreground text-sm">{displayCount} row(s)</p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            manual
                                ? pagination!.onPageChange(pagination!.page - 1)
                                : table.previousPage()
                        }
                        disabled={!canPrevious}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {(() => {
                            const current = pageIndex
                            const pages = Array.from({ length: pageCount }, (_, i) => i).filter(
                                (page) =>
                                    page === 0 ||
                                    page === pageCount - 1 ||
                                    Math.abs(page - current) <= 1,
                            )
                            let previous = -1
                            return pages.flatMap((page) => {
                                const items: React.ReactNode[] = []
                                if (page - previous > 1) {
                                    items.push(
                                        <span
                                            key={`ellipsis-${page}`}
                                            className="text-muted-foreground px-1 text-sm"
                                        >
                                            …
                                        </span>,
                                    )
                                }
                                items.push(
                                    <Button
                                        key={page}
                                        variant={page === current ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 min-w-8 px-2"
                                        onClick={() => goToPage(page)}
                                        aria-current={page === current ? 'page' : undefined}
                                    >
                                        {page + 1}
                                    </Button>,
                                )
                                previous = page
                                return items
                            })
                        })()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            manual
                                ? pagination!.onPageChange(pagination!.page + 1)
                                : table.nextPage()
                        }
                        disabled={!canNext}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export { UiDataTable }
