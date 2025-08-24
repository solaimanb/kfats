import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OrdersAPI } from '../api/orders'
import { OrderCreate } from '../types/orders'

export const ordersKeys = {
    all: ['orders'] as const,
    lists: () => [...ordersKeys.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...ordersKeys.lists(), { params }] as const,
    details: () => [...ordersKeys.all, 'detail'] as const,
    detail: (id: number) => [...ordersKeys.details(), id] as const,
    sellerLists: () => [...ordersKeys.all, 'seller-list'] as const,
}

export function useOrders(params?: { skip?: number; limit?: number }) {
    return useQuery({
        queryKey: ordersKeys.list(params || {}),
        queryFn: () => OrdersAPI.listOrders(params),
        staleTime: 2 * 60 * 1000,
    })
}

export function useOrder(orderId: number) {
    return useQuery({
        queryKey: ordersKeys.detail(orderId),
        queryFn: () => OrdersAPI.getOrder(orderId),
        staleTime: 2 * 60 * 1000,
    })
}

export function useSellerOrders(params?: { skip?: number; limit?: number }) {
    return useQuery({
        queryKey: ordersKeys.sellerLists(),
        queryFn: () => OrdersAPI.listSellerOrders(params),
        staleTime: 2 * 60 * 1000,
    })
}

export function useCreateOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (orderData: OrderCreate) => OrdersAPI.createOrder(orderData),
        onSuccess: (newOrder) => {
            // Invalidate buyer orders list and seller lists as appropriate
            queryClient.invalidateQueries({ queryKey: ordersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ordersKeys.sellerLists() })
            // Cache the new order
            queryClient.setQueryData(ordersKeys.detail(newOrder.id), newOrder)
        },
    })
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
            OrdersAPI.updateOrderStatus(orderId, status),
        onSuccess: (updatedOrder) => {
            queryClient.setQueryData(ordersKeys.detail(updatedOrder.id), updatedOrder)
            queryClient.invalidateQueries({ queryKey: ordersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ordersKeys.sellerLists() })
        },
    })
}

export function useInitiateRefund() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (orderId: number) => OrdersAPI.initiateRefund(orderId),
        onSuccess: (updatedOrder) => {
            queryClient.setQueryData(ordersKeys.detail(updatedOrder.id), updatedOrder)
            queryClient.invalidateQueries({ queryKey: ordersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ordersKeys.sellerLists() })
        },
    })
}
