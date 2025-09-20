"use client"
import { useMemo, useCallback } from "react"
import { Plus, Package, DollarSign, Archive, Search } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataTable, DataTableColumnHeader, createActionsColumn } from "@/components/common/data-table"

import { Product } from "@/lib/types/api"
import { useSellerProducts } from "@/lib/hooks/useSellerProducts"

import type { ColumnDef, Table } from "@tanstack/react-table"
import Loading from "./loading"

export default function MyProductsPage() {
  const { products, isLoading, isError, create, view, edit, remove } = useSellerProducts()

  const handleCreate = useCallback(() => create(), [create])
  const handleView = useCallback((id: number) => view(id), [view])
  const handleEdit = useCallback((id: number) => edit(id), [edit])
  const handleDeleteClick = useCallback((product: Product) => {
    remove(product.id)
  }, [remove])

  const toolbar = useCallback(
    (table: Table<Product>) => {
      const isFiltered = table.getState().columnFilters.length > 0

      return (
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="h-8 w-[250px] lg:w-[300px] pl-8"
              />
            </div>

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => table.resetColumnFilters()}
                className="h-8 px-2 lg:px-3"
              >
                Reset
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Product
            </Button>
          </div>
        </div>
      )
    },
    [handleCreate]
  )

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">#{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product Name" />
        ),
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <div className="font-medium line-clamp-1">{product.name}</div>
              </div>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          const name = row.getValue(id) as string
          return name.toLowerCase().includes(value.toLowerCase())
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.getValue("category") as string
          return (
            <Badge variant="secondary" className="capitalize">
              {category.replace("_", " ")}
            </Badge>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => {
          const price = row.getValue("price") as number
          return (
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="w-4 h-4 text-green-600" />
              ${price.toFixed(2)}
            </div>
          )
        },
      },
      {
        accessorKey: "stock_quantity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Stock" />
        ),
        cell: ({ row }) => {
          const stock = row.getValue("stock_quantity") as number
          return (
            <div className="flex items-center gap-1">
              <Archive className="w-4 h-4 text-blue-600" />
              <span className={stock <= 10 ? "text-red-600 font-medium" : ""}>
                {stock ?? 0}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "sold_quantity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Sold" />
        ),
        cell: ({ row }) => {
          const sold = row.getValue("sold_quantity") as number
          return (
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-purple-600" />
              <span>{sold ?? 0}</span>
            </div>
          )
        },
      },
      createActionsColumn<Product>({
        onView: (product) => handleView(product.id),
        onEdit: (product) => handleEdit(product.id),
        customActions: [
          {
            label: "Delete Product",
            onClick: handleDeleteClick,
            variant: "destructive",
          },
        ],
      }),
    ],
    [handleView, handleEdit, handleDeleteClick]
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
            <p className="text-muted-foreground">Manage your product inventory and listings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {products.length} products
          </Badge>
        </div>
      </header>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load products. Please refresh the page or try again later.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products yet</h3>
              <p className="text-muted-foreground">
                Get started by creating your first product listing
              </p>
              <Button onClick={handleCreate} className="gap-2 mt-4">
                <Plus className="h-4 w-4" />
                Create Your First Product
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={products}
              pageSize={10}
              showPagination={true}
              toolbar={toolbar}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
