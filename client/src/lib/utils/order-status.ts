import React, { ReactNode } from "react";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  LucideIcon,
} from "lucide-react";

export type OrderStatus =
  | 'pending'           // Order placed, awaiting payment/processing
  | 'paid'              // Payment received, order confirmed
  | 'processing'        // Order being prepared/fulfilled
  | 'shipped'           // Order has been dispatched
  | 'delivered'         // Order received by customer
  | 'cancelled'         // Order cancelled by buyer/seller
  | 'refunded'          // Payment refunded to customer
  | 'on_hold'           // Order on hold (e.g., stock issues, address problems)
  | 'payment_failed'    // Payment attempt failed
  | string;

export interface StatusIconConfig {
  icon: LucideIcon;
  className: string;
}

/**
 * Get the appropriate icon configuration for an order status
 * Returns the icon component and its className for styling
 */
export const getStatusIconConfig = (status: string): StatusIconConfig => {
  switch (status) {
    case "paid":
    case "delivered":
      return { icon: CheckCircle, className: "h-4 w-4 text-green-500" };
    case "pending":
    case "processing":
      return { icon: Clock, className: "h-4 w-4 text-yellow-500" };
    case "shipped":
      return { icon: Truck, className: "h-4 w-4 text-blue-500" };
    case "cancelled":
    case "refunded":
      return { icon: XCircle, className: "h-4 w-4 text-red-500" };
    case "on_hold":
      return { icon: Clock, className: "h-4 w-4 text-orange-500" };
    default:
      return { icon: Package, className: "h-4 w-4 text-gray-500" };
  }
};

/**
 * Get the appropriate icon component for an order status
 * @deprecated Use getStatusIconConfig instead for better separation of concerns
 */
export const getStatusIcon = (status: string): ReactNode => {
  const config = getStatusIconConfig(status);
  return React.createElement(config.icon, { className: config.className });
};

/**
 * Get the appropriate Tailwind CSS classes for an order status badge
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "paid":
    case "delivered":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "shipped":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "on_hold":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

/**
 * Format an order status for display (replace underscores with spaces and capitalize)
 */
export const formatOrderStatus = (status: string): string => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Get all available order statuses for filtering
 */
export const getAllOrderStatuses = (): OrderStatus[] => {
  return ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded", "on_hold"];
};

/**
 * Check if an order status represents a completed order
 */
export const isOrderCompleted = (status: string): boolean => {
  return ["delivered", "cancelled", "refunded"].includes(status);
};

/**
 * Check if an order status represents an active order
 */
export const isOrderActive = (status: string): boolean => {
  return ["pending", "paid", "processing", "shipped"].includes(status);
};

/**
 * React component for displaying order status icons
 */
export interface OrderStatusIconProps {
  status: string;
  className?: string;
}

export const OrderStatusIcon: React.FC<OrderStatusIconProps> = ({ status, className = "" }) => {
  const config = getStatusIconConfig(status);
  return React.createElement(config.icon, {
    className: `${config.className} ${className}`.trim()
  });
};