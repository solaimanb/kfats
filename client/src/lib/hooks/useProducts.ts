import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductsAPI } from '../api/products'
import { ProductCreate, Product, PaginatedResponse } from '../types/api'

// Query keys
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productsKeys.lists(), { filters }] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: number) => [...productsKeys.details(), id] as const,
  myProducts: () => [...productsKeys.all, 'my-products'] as const,
  byCategory: (category: string) => [...productsKeys.all, 'category', category] as const,
}

/**
 * Hook to get all products
 */
export function useProducts(params?: {
  page?: number
  size?: number
  category?: string
  seller_id?: number
  min_price?: number
  max_price?: number
  search?: string
}) {
  return useQuery<PaginatedResponse<Product>, Error>({
    queryKey: productsKeys.list(params || {}),
    queryFn: () => ProductsAPI.getAllProducts(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get product by ID
 */
export function useProduct(productId: number) {
  return useQuery({
    queryKey: productsKeys.detail(productId),
    queryFn: () => ProductsAPI.getProductById(productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get product by slug
 */
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: [...productsKeys.details(), 'slug', slug] as const,
    queryFn: () => ProductsAPI.getProductBySlug(slug),
    enabled: !!slug && slug.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get seller's products
 */
export function useSellerProducts() {
  return useQuery({
    queryKey: productsKeys.myProducts(),
    queryFn: ProductsAPI.getSellerProducts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to get products by category
 */
export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: productsKeys.byCategory(category),
    queryFn: () => ProductsAPI.getProductsByCategory(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for creating a product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productData: ProductCreate) => ProductsAPI.createProduct(productData),
    onSuccess: () => {
      // Invalidate products lists and seller products
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productsKeys.myProducts() })
    },
  })
}

/**
 * Hook for updating a product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, productData }: { productId: number; productData: Partial<ProductCreate> }) =>
      ProductsAPI.updateProduct(productId, productData),
    onSuccess: (updatedProduct) => {
      // Update specific product cache
      queryClient.setQueryData(productsKeys.detail(updatedProduct.id), updatedProduct)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productsKeys.myProducts() })
    },
  })
}

/**
 * Hook for deleting a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: number) => ProductsAPI.deleteProduct(productId),
    onSuccess: (_, productId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productsKeys.detail(productId) })
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productsKeys.myProducts() })
    },
  })
}

/**
 * Hook for updating product stock
 */
export function useUpdateProductStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      ProductsAPI.updateProductStock(productId, quantity),
    onSuccess: (updatedProduct) => {
      // Update specific product cache
      queryClient.setQueryData(productsKeys.detail(updatedProduct.id), updatedProduct)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productsKeys.myProducts() })
    },
  })
}
