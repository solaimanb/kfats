import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductsAPI } from "@/lib/api/products";
import type { Product } from "@/lib/types/api";

export function useSellerProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetch = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await ProductsAPI.getSellerProducts();
      setProducts(data?.items ?? []);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const create = () => router.push("/dashboard/seller/products/create");
  // View the public product page by slug. We expect callers to pass the full product object when available,
  // but keep a fallback to id-based dashboard route if name/slug cannot be derived.
  const view = (product: Product | number) => {
    if (typeof product === "number")
      return router.push(`/dashboard/seller/products/${product}`);
    const slug = product.name
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return router.push(`/products/${slug}`);
  };
  const edit = (id: number) =>
    router.push(`/dashboard/seller/products/${id}/edit`);

  const remove = async (id: number) => {
    const prev = products;
    setProducts(prev.filter((p) => p.id !== id));
    try {
      await ProductsAPI.deleteProduct(id);
    } catch (err) {
      setProducts(prev);
      throw err;
    }
  };

  return { products, isLoading, isError, fetch, create, view, edit, remove };
}
