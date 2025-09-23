"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { useUpdateProductStock } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./quantity-selector";
import { toast } from "sonner";
import { Loader2, ShoppingCart, CreditCard } from "lucide-react";
import { Product } from "@/lib/types/api";

interface PurchaseActionsProps {
  product: Product;
  onPurchaseSuccess?: () => void;
}

export function PurchaseActions({
  product,
  onPurchaseSuccess,
}: PurchaseActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const createOrderMutation = useCreateOrder();
  const updateStockMutation = useUpdateProductStock();

  const isOutOfStock = product.stock_quantity <= 0;
  const maxQuantity = Math.min(product.stock_quantity, 99); // Reasonable max limit
  const totalPrice = product.price * quantity;

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please log in to purchase this product.");
      router.push("/login");
      return;
    }

    if (quantity > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} items available.`);
      return;
    }

    try {
      // Create order
      const orderData = {
        buyer_id: user.id,
        items: [
          {
            product_id: product.id,
            unit_price: product.price,
            quantity: quantity,
          },
        ],
      };

      const newOrder = await createOrderMutation.mutateAsync(orderData);

      // Update product stock
      await updateStockMutation.mutateAsync({
        productId: product.id,
        quantity: product.stock_quantity - quantity,
      });

      toast.success(`Your order #${newOrder.id} has been placed.`);

      onPurchaseSuccess?.();
      router.push(`/orders/${newOrder.id}`);
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(
        "There was an error processing your order. Please try again."
      );
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    toast.info("Cart functionality will be implemented in the next phase.");
  };

  if (isOutOfStock) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          This product is currently out of stock.
        </div>
        <Button disabled className="w-full">
          Out of Stock
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Quantity</div>
          <QuantitySelector
            maxQuantity={maxQuantity}
            minQuantity={1}
            initialQuantity={1}
            onQuantityChange={setQuantity}
            disabled={createOrderMutation.isPending}
          />
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">${totalPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleBuyNow}
          disabled={
            createOrderMutation.isPending || updateStockMutation.isPending
          }
          className="w-full"
          size="lg"
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Buy Now - ${totalPrice.toFixed(2)}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleAddToCart}
          disabled={createOrderMutation.isPending}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {product.stock_quantity} items available
      </div>
    </div>
  );
}
