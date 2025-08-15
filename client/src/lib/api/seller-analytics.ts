import { apiClient } from "./client"

export class SellerAnalyticsAPI {
  static async getRevenue() {
    const response = await apiClient.get("/seller/analytics/revenue")
    return response.data
  }

  static async getOrders() {
    const response = await apiClient.get("/seller/analytics/orders")
    return response.data
  }

  static async getProducts() {
    const response = await apiClient.get("/seller/analytics/products")
    return response.data
  }
}
