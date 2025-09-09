"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProductBySlug } from "@/lib/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/common/image-gallery";
import { PurchaseActions } from "@/components/common/purchase-actions";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");

  // Extract slug from params
  useEffect(() => {
    if (params.slug && typeof params.slug === "string") {
      setSlug(params.slug);
    } else if (params.slug) {
      // Handle async params in case of Next.js versions
      Promise.resolve(params.slug).then((resolvedSlug) => {
        if (typeof resolvedSlug === "string") {
          setSlug(resolvedSlug);
        }
      });
    }
  }, [params.slug]);

  // Only call the hook when we have a valid slug
  const { data: product, isLoading, isError } = useProductBySlug(slug);

  // Handle invalid slug - redirect after a short delay to prevent flash
  useEffect(() => {
    if (params.slug && !slug) {
      const timer = setTimeout(() => {
        router.replace("/marketplace");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [params.slug, slug, router]);

  // Show loading state
  if (isLoading || !slug) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-md" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-10 w-40 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Product not found</h2>
        <p className="text-muted-foreground">
          This product may have been removed or is no longer available.
        </p>
        <div className="mt-6">
          <Button onClick={() => router.push("/marketplace")}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <ImageGallery
            images={product.image_urls || []}
            productName={product.name}
          />
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

          <PurchaseActions product={product} />

          <div className="space-y-4">
            <Card>
              <CardContent>
                <h3 className="font-medium mb-2">Seller</h3>
                <div className="text-sm text-muted-foreground">
                  Seller #{product.seller_id}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="font-medium mb-2">Details</h3>
                <div className="text-sm text-muted-foreground">
                  Status: {product.status}
                </div>
                <div className="text-sm text-muted-foreground">
                  Sold: {product.sold_quantity ?? 0}
                </div>
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
  );
}
