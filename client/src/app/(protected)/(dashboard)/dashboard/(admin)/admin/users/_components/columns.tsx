"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "./data-table-column-header"
import { 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail,
  Eye
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { User } from "@/lib/types/api"

// Re-export the User type from API
export type { User }

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'mentor':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'writer':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'seller':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'student':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusBadgeColor = (status: string) => {
  return status === 'active'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200'
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback>
              {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.full_name}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm">{row.getValue("email")}</span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge className={getRoleBadgeColor(role)}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge className={getStatusBadgeColor(status)}>
          {status === 'active' ? "Active" : "Inactive"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const status = row.getValue(id) as string
      return value.includes(status)
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string
      return (
        <div className="text-sm">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </div>
      )
    },
  },
  {
    accessorKey: "last_login",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => {
      const lastLogin = row.getValue("last_login") as string | undefined
      return (
        <div className="text-sm">
          {lastLogin 
            ? formatDistanceToNow(new Date(lastLogin), { addSuffix: true })
            : "Never"
          }
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.email)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              Change role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === 'active' ? (
              <DropdownMenuItem className="text-red-600">
                <UserX className="mr-2 h-4 w-4" />
                Suspend user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-green-600">
                <UserCheck className="mr-2 h-4 w-4" />
                Activate user
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
