# Data Table Component

A comprehensive, reusable data table system built with TanStack Table and shadcn/ui components.

## Features

- ✅ **Sorting** - Click column headers to sort data
- ✅ **Filtering** - Search functionality with customizable search keys
- ✅ **Pagination** - Navigate through data with page size controls
- ✅ **Column Visibility** - Show/hide columns as needed
- ✅ **Row Selection** - Select single or multiple rows
- ✅ **Row Actions** - Built-in actions (view, edit, delete) + custom actions
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **TypeScript** - Full type safety
- ✅ **Customizable** - Extensive configuration options

## Quick Start

### Basic Usage

```tsx
import { DataTable } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"

type User = {
  id: string
  name: string
  email: string
  role: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email", 
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
]

export function UsersTable({ data }: { data: User[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="email"
      searchPlaceholder="Search users..."
    />
  )
}
```

### With Row Selection

```tsx
import { DataTable, createSelectionColumn } from "@/components/common/data-table"

const columns: ColumnDef<User>[] = [
  createSelectionColumn<User>(),
  // ... other columns
]

export function UsersTableWithSelection({ data }: { data: User[] }) {
  const handleSelectionChange = (selectedUsers: User[]) => {
    console.log("Selected:", selectedUsers)
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      showRowSelection={true}
      onRowSelectionChange={handleSelectionChange}
    />
  )
}
```

### With Row Actions

```tsx
import { DataTable, createActionsColumn } from "@/components/common/data-table"

const columns: ColumnDef<User>[] = [
  // ... other columns
  createActionsColumn<User>({
    onView: (user) => console.log("View", user),
    onEdit: (user) => console.log("Edit", user),
    onDelete: (user) => console.log("Delete", user),
    customActions: [
      {
        label: "Send Email",
        onClick: (user) => console.log("Email", user),
      },
    ],
  }),
]
```

### With Sortable Headers

```tsx
import { DataTableColumnHeader } from "@/components/common/data-table"

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  // ... other columns
]
```

### Advanced Configuration

```tsx
<DataTable
  columns={columns}
  data={data}
  searchKey="email"
  searchPlaceholder="Search by email..."
  pageSize={20}
  showPagination={true}
  showSearch={true}
  showColumnToggle={true}
  showRowSelection={false}
  className="custom-table-class"
  toolbar={
    <div className="flex gap-2">
      <Button>Custom Action</Button>
      <Button variant="outline">Export</Button>
    </div>
  }
/>
```

## API Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | - | Column definitions |
| `data` | `TData[]` | - | Table data |
| `searchKey` | `string` | - | Column key to search |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `pageSize` | `number` | `10` | Initial page size |
| `showPagination` | `boolean` | `true` | Show pagination controls |
| `showSearch` | `boolean` | `true` | Show search input |
| `showColumnToggle` | `boolean` | `true` | Show column visibility toggle |
| `showRowSelection` | `boolean` | `false` | Enable row selection |
| `onRowSelectionChange` | `(rows: TData[]) => void` | - | Row selection callback |
| `toolbar` | `ReactNode` | - | Custom toolbar content |
| `className` | `string` | - | Additional CSS classes |

### Helper Functions

#### `createSelectionColumn<TData>()`
Creates a selection column with checkboxes for row selection.

#### `createActionsColumn<TData>(actions)`
Creates an actions column with dropdown menu.

**Actions Object:**
- `onView?: (data: TData) => void`
- `onEdit?: (data: TData) => void` 
- `onDelete?: (data: TData) => void`
- `customActions?: Array<{ label: string; onClick: (data: TData) => void; variant?: "default" | "destructive" }>`

## Column Examples

### Currency Formatting

```tsx
{
  accessorKey: "amount",
  header: () => <div className="text-right">Amount</div>,
  cell: ({ row }) => {
    const amount = parseFloat(row.getValue("amount"))
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
    return <div className="text-right font-medium">{formatted}</div>
  },
}
```

### Status Badge

```tsx
{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.getValue("status") as string
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status}
      </Badge>
    )
  },
}
```

### Date Formatting

```tsx
{
  accessorKey: "createdAt",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Created" />
  ),
  cell: ({ row }) => {
    const date = new Date(row.getValue("createdAt"))
    return (
      <div className="text-sm text-muted-foreground">
        {date.toLocaleDateString()}
      </div>
    )
  },
}
```

## Styling

The component uses Tailwind CSS classes and follows shadcn/ui design patterns. You can customize the appearance by:

1. **Adding custom CSS classes** via the `className` prop
2. **Overriding component styles** in your global CSS
3. **Customizing individual cell styling** in column definitions

## Performance Tips

1. **Memoize columns** to prevent unnecessary re-renders:
   ```tsx
   const columns = useMemo(() => [...], [dependencies])
   ```

2. **Use pagination** for large datasets (enabled by default)

3. **Implement server-side filtering/sorting** for very large datasets

4. **Debounce search input** for better performance:
   ```tsx
   const [searchValue, setSearchValue] = useState("")
   const debouncedSearch = useDebounce(searchValue, 300)
   ```
