"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrder } from "@/lib/hooks/useOrders";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = parseInt(params.id as string, 10);

  const { data: order, isLoading, isError } = useOrder(orderId);

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Order not found</h2>
        <p className="text-muted-foreground mb-6">
          This order may not exist or you may not have permission to view it.
        </p>
        <Button onClick={() => router.push("/marketplace")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  // Check if user owns this order
  if (user && order.buyer_id !== user.id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Access denied</h2>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to view this order.
        </p>
        <Button onClick={() => router.push("/marketplace")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Package className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
      case "refunded":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Truck className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
        <p className="text-muted-foreground">
          Placed on {new Date(order.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">
                        Product #{item.product_id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${item.unit_price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline/Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace("_", " ").toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last updated:{" "}
                    {new Date(order.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {order.payment_reference && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Reference</span>
                    <span className="text-sm font-mono">
                      {order.payment_reference}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Information */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {order.shipping_address}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
