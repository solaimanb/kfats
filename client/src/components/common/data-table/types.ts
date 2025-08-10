import { ReactNode } from "react"
import { ColumnDef, Table } from "@tanstack/react-table"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  showPagination?: boolean
  showRowSelection?: boolean
  onRowSelectionChange?: (selectedRows: TData[]) => void
  toolbar?: ReactNode | ((table: Table<TData>) => ReactNode)
  className?: string
}

export interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: import("@tanstack/react-table").Column<TData, TValue>
  title: string
}

export interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export interface DataTableRowActionsProps<TData> {
  row: import("@tanstack/react-table").Row<TData>
  onEdit?: (data: TData) => void
  onDelete?: (data: TData) => void
  onView?: (data: TData) => void
  customActions?: Array<{
    label: string
    onClick: (data: TData) => void
    variant?: "default" | "destructive"
  }>
}
