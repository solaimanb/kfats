"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableRowActions } from "./data-table-row-actions"

/**
 * Creates a selection column for data tables
 * This should be the first column in your columns array
 */
export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

/**
 * Creates an actions column for data tables
 * This should typically be the last column in your columns array
 */
export function createActionsColumn<TData>(
  actions: {
    onEdit?: (data: TData) => void
    onDelete?: (data: TData) => void
    onView?: (data: TData) => void
    customActions?: Array<{
      label: string
      onClick: (data: TData) => void
      variant?: "default" | "destructive"
    }>
  }
): ColumnDef<TData> {
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <DataTableRowActions row={row} {...actions} />
    },
  }
}
