"use client"

import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DataTableRowActionsProps } from "./types"

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  onView,
  customActions = [],
}: DataTableRowActionsProps<TData>) {
  const data = row.original

  const hasActions = onEdit || onDelete || onView || customActions.length > 0

  if (!hasActions) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {onView && (
          <DropdownMenuItem onClick={() => onView(data)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(data)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        
        {customActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => action.onClick(data)}
            className={action.variant === "destructive" ? "text-destructive" : ""}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
        
        {(onView || onEdit || customActions.length > 0) && onDelete && (
          <DropdownMenuSeparator />
        )}
        
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(data)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
