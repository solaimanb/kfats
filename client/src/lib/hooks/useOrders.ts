import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OrdersAPI } from '../api/orders'
import { OrderCreate } from '../types/orders'
import { PaginatedResponse } from '../types/api'
import { Order } from '../types/orders'

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
        onMutate: async ({ orderId, status }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ordersKeys.sellerLists() })

            // Snapshot the previous value
            const previousData = queryClient.getQueryData<PaginatedResponse<Order>>(ordersKeys.sellerLists())

            // Optimistically update to the new value
            queryClient.setQueryData<PaginatedResponse<Order>>(ordersKeys.sellerLists(), (old) => {
                if (!old?.items) return old
                return {
                    ...old,
                    items: old.items.map(order =>
                        order.id === orderId ? { ...order, status } : order
                    )
                }
            })

            // Return a context object with the snapshotted value
            return { previousData, orderId, newStatus: status }
        },
        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData) {
                queryClient.setQueryData(ordersKeys.sellerLists(), context.previousData)
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server state is correct
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
