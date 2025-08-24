"use client"

import { useState } from "react"
import { useProducts } from "@/lib/hooks"
import type { Product, PaginatedResponse } from "@/lib/types/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ProductCard from "@/components/common/cards/product-card"

export default function MarketplacePage() {
    const [page, setPage] = useState<number>(1)
    const [size] = useState<number>(12)
    const { data, isLoading, isError } = useProducts({ page, size })

    const paginated = data as PaginatedResponse<Product> | undefined
    const products: Product[] = paginated?.items ?? []
    const totalPages = paginated?.pages ?? 1

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: size }).map((_, i) => (
                        <Card key={i}>
                            <div className="h-48 bg-slate-100">
                                <Skeleton className="h-full w-full" />
                            </div>
                            <CardContent>
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {isError && !isLoading && (
                <div className="text-center py-12 text-destructive">Failed to load products. Please try again later.</div>
            )}

            {!isLoading && !isError && products.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No products found.</div>
            )}

            {!isLoading && !isError && products.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                                Previous
                            </Button>
                            <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
