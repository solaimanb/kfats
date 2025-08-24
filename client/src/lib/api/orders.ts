import { apiClient } from './client'
import { OrderCreate } from '../types/orders'
import { Order } from '../types/orders'
import { PaginatedResponse } from '../types/api'

export class OrdersAPI {
    static async createOrder(orderData: OrderCreate): Promise<Order> {
        const response = await apiClient.post<Order>('/orders/', orderData)
        return response.data
    }

    static async getOrder(orderId: number): Promise<Order> {
        const response = await apiClient.get<Order>(`/orders/${orderId}`)
        return response.data
    }

    static async listOrders(params?: { skip?: number; limit?: number }): Promise<PaginatedResponse<Order>> {
        const response = await apiClient.get<PaginatedResponse<Order>>('/orders/', { params })
        return response.data
    }

    static async listSellerOrders(params?: { skip?: number; limit?: number }): Promise<PaginatedResponse<Order>> {
        const response = await apiClient.get<PaginatedResponse<Order>>('/orders/seller/', { params })
        return response.data
    }

    static async updateOrderStatus(orderId: number, status: string): Promise<Order> {
        const response = await apiClient.put<Order>(`/orders/${orderId}/status`, { status })
        return response.data
    }

    static async initiateRefund(orderId: number): Promise<Order> {
        const response = await apiClient.post<Order>(`/orders/${orderId}/refund`)
        return response.data
    }
}
