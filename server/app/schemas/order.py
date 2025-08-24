from typing import List, Optional, Annotated
from datetime import datetime
from pydantic import BaseModel, Field


class OrderItemBase(BaseModel):
    product_id: int
    unit_price: float
    quantity: Annotated[int, Field(gt=0)]


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: int
    sold_at: datetime

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    buyer_id: int
    shipping_address: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class Order(OrderBase):
    id: int
    total_amount: float
    status: str
    payment_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True
