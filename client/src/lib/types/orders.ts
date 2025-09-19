import { OrderStatus } from "@/lib/utils/order-status";

export type { OrderStatus };

export interface OrderItemCreate {
    product_id: number
    unit_price: number
    quantity: number
}

export interface OrderItem {
    id: number
    product_id: number
    unit_price: number
    quantity: number
    sold_at: string
}

export interface OrderCreate {
    buyer_id: number
    shipping_address?: string | null
    items: OrderItemCreate[]
}

export interface Order {
    id: number
    buyer_id: number
    shipping_address?: string | null
    total_amount: number
    status: OrderStatus
    payment_reference?: string | null
    created_at: string
    updated_at: string
    items: OrderItem[]
}
