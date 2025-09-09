"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  maxQuantity: number;
  minQuantity?: number;
  initialQuantity?: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({
  maxQuantity,
  minQuantity = 1,
  initialQuantity = 1,
  onQuantityChange,
  disabled = false,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleQuantityChange = (newQuantity: number) => {
    // Ensure quantity is within bounds
    const clampedQuantity = Math.max(
      minQuantity,
      Math.min(maxQuantity, newQuantity)
    );
    setQuantity(clampedQuantity);
    onQuantityChange(clampedQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleQuantityChange(value);
    }
  };

  const increment = () => {
    if (quantity < maxQuantity) {
      handleQuantityChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > minQuantity) {
      handleQuantityChange(quantity - 1);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={decrement}
        disabled={disabled || quantity <= minQuantity}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Input
        type="number"
        min={minQuantity}
        max={maxQuantity}
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-16 h-8 text-center"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={increment}
        disabled={disabled || quantity >= maxQuantity}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
