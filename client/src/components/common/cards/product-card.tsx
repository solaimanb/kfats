"use client"

import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const thumbnail = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : undefined

    const priceFormatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
        Number(product.price || 0)
    )

    return (
        <Card className="group hover:shadow-lg transition-shadow pt-0 rounded-sm overflow-hidden" aria-labelledby={`product-${product.id}-title`}>
            <Link href={`/products/${product.slug}`} className="block" aria-label={`View product ${product.name}`}>
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    {thumbnail ? (
                        <Image
                            src={thumbnail}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">No image</div>
                    )}

                    <div className="absolute left-3 top-3">
                        <Badge variant="secondary" className="text-xs">
                            {product.category}
                        </Badge>
                    </div>

                    {product.stock_quantity === 0 && (
                        <div className="absolute right-3 top-3">
                            <Badge variant="destructive" className="text-xs">Out of stock</Badge>
                        </div>
                    )}
                </div>
            </Link>

            <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 id={`product-${product.id}-title`} className="text-sm font-medium line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-semibold">{priceFormatted}</div>
                        <div className="text-xs text-muted-foreground">{product.stock_quantity ?? 0} in stock</div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge className="text-xs">Seller #{product.seller_id}</Badge>
                        <Badge variant="outline" className="text-xs">{product.status}</Badge>
                    </div>
                    <div>
                        <Link href={`/products/${product.slug}`} aria-label={`View product ${product.name}`}>
                            <Button size="sm">View</Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
