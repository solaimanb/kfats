"use client"
import type { Product } from "@/lib/types/api"
import { useSellerProducts } from "@/lib/hooks/useSellerProducts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, MoreVertical, Eye, Edit, Trash2, Package, DollarSign, Archive } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export default function MyProductsPage() {
  const { products, isLoading, isError, create, view, edit, remove } = useSellerProducts()
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })

  const handleCreate = () => create()
  const handleView = (id: number) => view(id)
  const handleEdit = (id: number) => edit(id)

  const handleDeleteClick = (product: Product) => {
    setDeleteDialog({ open: true, product })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return

    try {
      await remove(deleteDialog.product.id)
      toast.success("Product deleted successfully")
      setDeleteDialog({ open: false, product: null })
    } catch {
      toast.error("Failed to delete product")
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, product: null })
  }

  const ProductSkeleton = () => (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="p-0">
        <Skeleton className="h-56 w-full" />
      </CardHeader>
      <CardContent className="p-6">
        <Skeleton className="h-7 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <div className="flex justify-between">
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-12 w-20" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
            <p className="text-muted-foreground">Manage your product inventory and listings</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Product
        </Button>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load products. Please refresh the page or try again later.</AlertDescription>
        </Alert>
      )}

      {!isLoading && products.length === 0 && (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No products yet</h3>
              <p className="text-muted-foreground">Get started by creating your first product listing</p>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Product
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map((p: Product) => (
          <Card
            key={p.id}
            className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50"
          >
            <CardHeader className="p-0 relative">
              <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {p.image_urls && p.image_urls.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_urls[0] || "/placeholder.svg"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                    <Package className="h-12 w-12 mb-3" />
                    <span className="text-sm font-medium">No image available</span>
                  </div>
                )}

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleView(p.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(p.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(p)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{p.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Price</span>
                  </div>
                  <div className="text-lg font-bold text-green-800">${Number(p.price).toFixed(2)}</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Archive className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Stock</span>
                  </div>
                  <div className="text-lg font-bold text-blue-800">{p.stock_quantity ?? "—"}</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Package className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Sold</span>
                  </div>
                  <div className="text-lg font-bold text-purple-800">{p.sold_quantity ?? 0}</div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => handleView(p.id)}
                  className="flex-1 h-11 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  onClick={() => handleEdit(p.id)}
                  className="flex-1 h-11 font-medium shadow-md hover:shadow-lg transition-shadow"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product{" "}
              <span className="font-bold">{deleteDialog.product?.name}</span> and remove it from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
