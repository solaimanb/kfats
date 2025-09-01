"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useProductBySlug } from "@/lib/hooks/useProducts"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>()
  const [slug, setSlug] = useState<string | null>(null)
  const { data: product, isLoading, isError } = useProductBySlug(slug || "")
  const router = useRouter()

  useEffect(() => {
    const getParams = async () => {
      if (params.slug) {
        const resolvedSlug = typeof params.slug === 'string' ? params.slug : await params.slug
        setSlug(resolvedSlug)
      }
    }
    getParams()
  }, [params.slug])

  useEffect(() => {
    if (!slug) router.replace('/marketplace')
  }, [slug, router])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <div>
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-10 w-40 mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Product not found</h2>
        <p className="text-muted-foreground">This product may have been removed or is no longer available.</p>
        <div className="mt-6">
          <Button onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {product.image_urls && product.image_urls.length > 0 ? (
            <div className="relative h-96 w-full bg-slate-100 overflow-hidden rounded-lg">
              <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-96 w-full flex items-center justify-center bg-slate-100 rounded-lg">No image</div>
          )}

          {/* Additional thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {product.image_urls?.slice(0, 4).map((u, i) => (
              <div key={i} className="relative h-20 w-full rounded-md overflow-hidden bg-gray-50">
                <Image src={u} alt={`${product.name}-${i}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant="outline">{product.status}</Badge>
          </div>

          <div className="prose mb-6">
            <p>{product.description}</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-extrabold">${Number(product.price).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">{product.stock_quantity ?? 0} in stock</div>
            </div>
            <div className="space-x-2">
              <Button size="lg">Buy now</Button>
              <Button variant="outline" size="lg">Add to cart</Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent>
                <h3 className="font-medium mb-2">Seller</h3>
                <div className="text-sm text-muted-foreground">Seller #{product.seller_id}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="font-medium mb-2">Details</h3>
                <div className="text-sm text-muted-foreground">Status: {product.status}</div>
                <div className="text-sm text-muted-foreground">Sold: {product.sold_quantity ?? 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">You may also like</h2>
        {/* Placeholder: reuse ProductCard for related items if implemented */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Server-side: fetch related products by category or seller for better recommendations */}
        </div>
      </section>
    </div>
  )
}
