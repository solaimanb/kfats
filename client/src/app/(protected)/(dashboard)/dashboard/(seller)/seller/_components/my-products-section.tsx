"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Eye, Edit, Package, TrendingUp, DollarSign } from "lucide-react"
import { ProductPerformance } from "./types"
import { formatCurrency, getProductStatusColor, getStockLevelIndicator, formatNumber } from "./utils"

interface MyProductsSectionProps {
    products: ProductPerformance[]
    isLoading: boolean
    onCreateProduct: () => void
    onViewProduct: (product: ProductPerformance) => void
    onEditProduct: (productId: number) => void
}

export function MyProductsSection({
    products,
    isLoading,
    onCreateProduct,
    onViewProduct,
    onEditProduct
}: MyProductsSectionProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-60" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        My Products
                    </span>
                    <Button onClick={onCreateProduct} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {products.length > 0 ? (
                    <div className="space-y-4">
                        {products.map((product) => {
                            const stockIndicator = getStockLevelIndicator(product.stock_quantity || 0)
                            const isLowStock = (product.stock_quantity || 0) <= 10

                            return (
                                <div
                                    key={product.id ?? `${product.name}-${product.status}`}
                                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-muted/50 ${isLowStock ? 'border-orange-200 bg-orange-50/30' : ''
                                        }`}
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-medium">{product.name}</h4>
                                            <Badge
                                                variant="outline"
                                                className={getProductStatusColor(product.status)}
                                            >
                                                {product.status.replace('_', ' ')}
                                            </Badge>
                                            {isLowStock && (
                                                <Badge
                                                    variant="outline"
                                                    className={stockIndicator.color}
                                                >
                                                    <stockIndicator.icon className="h-3 w-3 mr-1" />
                                                    {stockIndicator.label}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                <span>{formatCurrency(product.price)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Package className="h-4 w-4" />
                                                <span>{product.stock_quantity || 0} in stock</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                <span>{formatNumber(product.views_count || 0)} views</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>{formatNumber(product.orders_count || 0)} orders</span>
                                            </div>
                                        </div>

                                        {/* Performance Metrics */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Revenue: </span>
                                                <span className="font-medium text-green-600">
                                                    {formatCurrency(product.revenue_generated || 0)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Rating: </span>
                                                <span className="font-medium">
                                                    {(product.rating || 0).toFixed(1)} ({product.review_count || 0} reviews)
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Conversion: </span>
                                                <span className="font-medium">
                                                    {((product.conversion_rate || 0) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onViewProduct(product)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEditProduct(product.id)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No products yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Start selling by adding your first product to the marketplace
                        </p>
                        <Button onClick={onCreateProduct}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Product
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
