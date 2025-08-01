# 🗂️ Data Table Component System

A comprehensive, production-ready data table system built for the KFATS project following shadcn/ui documentation and Next.js best practices.

## 📁 File Structure

```
src/components/common/data-table/
├── index.ts                     # Main exports
├── types.ts                     # TypeScript definitions
├── data-table.tsx              # Core data table component
├── data-table-optimized.tsx    # Performance-optimized version
├── data-table-column-header.tsx # Sortable column headers
├── data-table-pagination.tsx   # Pagination controls
├── data-table-row-actions.tsx  # Row action dropdown
├── data-table-view-options.tsx # Column visibility toggle
├── data-table-showcase.tsx     # Complete demo/test page
├── column-helpers.tsx           # Helper functions for columns
├── hooks/
│   └── use-debounce.ts         # Performance optimization hook
├── examples/
│   ├── data-table-example.tsx  # Basic usage example
│   ├── users-data-table.tsx    # Users management table
│   └── courses-data-table.tsx  # Courses management table
├── README.md                   # Component documentation
└── INTEGRATION_GUIDE.md        # Real-world integration guide
```

## ✨ Features

### Core Functionality
- ✅ **Sorting** - Multi-column sorting with visual indicators
- ✅ **Filtering** - Global search with debounced input
- ✅ **Pagination** - Client-side pagination with page size control
- ✅ **Column Visibility** - Show/hide columns dynamically
- ✅ **Row Selection** - Single and multi-row selection
- ✅ **Row Actions** - Dropdown menus with custom actions

### Advanced Features
- ✅ **TypeScript Support** - Full type safety throughout
- ✅ **Performance Optimized** - Debounced search, memoized columns
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Accessibility** - ARIA labels and keyboard navigation
- ✅ **Customizable** - Extensive configuration options
- ✅ **Reusable** - Drop-in component for any data type

### Built-in Styling
- ✅ **Status Badges** - Color-coded status indicators
- ✅ **Currency Formatting** - Proper price display
- ✅ **Date Formatting** - Human-readable dates
- ✅ **Avatar Support** - User profile images with fallbacks
- ✅ **Loading States** - Skeleton screens and spinners

## 🚀 Quick Start

### 1. Basic Usage

```tsx
import { DataTable } from "@/components/common/data-table"

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
]

export function MyTable({ data }) {
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

### 2. With Row Selection

```tsx
import { DataTable, createSelectionColumn } from "@/components/common/data-table"

const columns = [
  createSelectionColumn<User>(),
  // ... other columns
]

<DataTable
  columns={columns}
  data={data}
  showRowSelection={true}
  onRowSelectionChange={(selected) => console.log(selected)}
/>
```

### 3. With Actions

```tsx
import { createActionsColumn } from "@/components/common/data-table"

const columns = [
  // ... other columns
  createActionsColumn<User>({
    onEdit: (user) => editUser(user),
    onDelete: (user) => deleteUser(user),
    customActions: [
      {
        label: "Send Email",
        onClick: (user) => sendEmail(user),
      },
    ],
  }),
]
```

### 4. With Sortable Headers

```tsx
import { DataTableColumnHeader } from "@/components/common/data-table"

const columns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
]
```

## 🎯 Real-World Examples

### Users Management
- Role-based badge styling
- Avatar with fallback initials
- Last login formatting
- Bulk actions for user management

### Courses Management
- Thumbnail image support
- Price formatting (including free courses)
- Duration display (hours/days)
- Enrollment progress tracking

### Advanced Features
- Server-side pagination
- Real-time updates with WebSocket
- CSV/Excel export functionality
- Advanced multi-column filtering

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `columns` | `ColumnDef[]` | - | Column definitions |
| `data` | `T[]` | - | Table data |
| `searchKey` | `string` | - | Column to search |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `pageSize` | `number` | `10` | Items per page |
| `showPagination` | `boolean` | `true` | Show pagination |
| `showSearch` | `boolean` | `true` | Show search input |
| `showColumnToggle` | `boolean` | `true` | Show column visibility |
| `showRowSelection` | `boolean` | `false` | Enable row selection |
| `onRowSelectionChange` | `Function` | - | Selection callback |
| `toolbar` | `ReactNode` | - | Custom toolbar content |
| `className` | `string` | - | Additional CSS classes |

## 📊 Performance Optimizations

1. **Debounced Search** - 300ms delay to reduce API calls
2. **Memoized Columns** - Prevents unnecessary re-renders
3. **Virtual Scrolling** - For extremely large datasets
4. **Background Updates** - React Query integration
5. **Optimistic UI** - Immediate feedback for actions

## 🎨 Styling & Theming

- **shadcn/ui Components** - Consistent design system
- **Tailwind CSS** - Utility-first styling
- **Dark Mode Support** - Automatic theme switching
- **Custom CSS Classes** - Easy customization
- **Responsive Design** - Mobile-first approach

## 🧪 Testing & Demo

### Live Demo
Visit `/demo/data-table` to see the complete showcase with:
- Basic table functionality
- Users management example
- Courses management example
- Interactive feature demonstrations

### Test Data
Mock data is provided for all examples to test functionality without API dependencies.

## 📚 Documentation

- **README.md** - Component documentation and usage
- **INTEGRATION_GUIDE.md** - Real-world API integration examples
- **TypeScript Definitions** - Full type safety and IntelliSense
- **Inline Comments** - Code documentation and examples

## 🔄 Integration with KFATS

### API Integration
- Works seamlessly with KFATS API endpoints
- React Query hooks for data management
- Type-safe with KFATS data models
- Error handling and loading states

### Role-Based Features
- Admin-only actions and columns
- Permission-based row actions
- Role-specific styling and badges
- Secure bulk operations

### Real-World Usage
- User management dashboard
- Course administration panel
- Article/blog management
- Product catalog management
- Analytics and reporting tables