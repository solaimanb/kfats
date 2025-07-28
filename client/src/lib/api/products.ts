import { apiClient } from './client'
import { Product, ProductCreate, PaginatedResponse, ApiResponse } from '../types/api'

export class ProductsAPI {
  /**
   * Create a new product (Seller/Admin only)
   */
  static async createProduct(productData: ProductCreate): Promise<Product> {
    const response = await apiClient.post<Product>('/products/', productData)
    return response.data
  }

  /**
   * Get all active products
   */
  static async getAllProducts(params?: {
    page?: number
    size?: number
    category?: string
    seller_id?: number
    min_price?: number
    max_price?: number
    search?: string
  }): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products/', {
      params
    })
    return response.data
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${productId}`)
    return response.data
  }

  /**
   * Get seller's products
   */
  static async getSellerProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/my-products')
    return response.data
  }

  /**
   * Update product (Seller/Admin only)
   */
  static async updateProduct(productId: number, productData: Partial<ProductCreate>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${productId}`, productData)
    return response.data
  }

  /**
   * Delete product (Seller/Admin only)
   */
  static async deleteProduct(productId: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/products/${productId}`)
    return response.data
  }

  /**
   * Update product stock
   */
  static async updateProductStock(productId: number, quantity: number): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${productId}/stock`, {
      stock_quantity: quantity
    })
    return response.data
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/products/category/${category}`)
    return response.data
  }
}
