from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.core.database import get_async_db
from app.core.dependencies import get_current_active_user, get_seller_or_admin, require_roles
from app.schemas.order import OrderCreate, Order
from app.schemas.common import PaginatedResponse
from app.services.order_service import OrderService
from app.models.user import User as DBUser
from app.schemas.user import User, User as UserSchema
from app.schemas.common import UserRole

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=Order)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_async_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(
        select(DBUser).where(DBUser.id == current_user.id)
    )
    buyer = result.scalars().first()
    if not buyer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db_order = await OrderService.create_order(db, order_data, buyer)
    return Order.model_validate(db_order)


@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: int, db: AsyncSession = Depends(get_async_db), current_user: User = Depends(get_current_active_user)):
    order = await OrderService.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return Order.model_validate(order)


@router.get("/", response_model=PaginatedResponse[Order])
async def list_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    skip = (page - 1) * size
    orders, total = await OrderService.list_orders(db, buyer_id=current_user.id, skip=skip, limit=size)
    return PaginatedResponse(
        items=[Order.model_validate(o) for o in orders],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
    )


@router.get("/seller/", response_model=PaginatedResponse[Order])
async def get_seller_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_seller_or_admin)
):
    # current_user is a pydantic User schema; use id
    skip = (page - 1) * size
    orders, total = await OrderService.list_orders_by_seller(db, seller_id=current_user.id, skip=skip, limit=size)
    return PaginatedResponse(
        items=[Order.model_validate(o) for o in orders],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
    )


@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(order_id: int, status_payload: dict = Body(...), db: AsyncSession = Depends(get_async_db), current_user: User = Depends(get_current_active_user)):
    new_status = status_payload.get("status")
    if not new_status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing status in payload")
    result = await db.execute(
        select(DBUser).where(DBUser.id == current_user.id)
    )
    db_user = result.scalars().first()
    updated = await OrderService.update_order_status(db, order_id, new_status, db_user)
    return Order.model_validate(updated)


@router.post("/{order_id}/refund", response_model=Order)
async def refund_order(order_id: int, db: AsyncSession = Depends(get_async_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(
        select(DBUser).where(DBUser.id == current_user.id)
    )
    db_user = result.scalars().first()
    refunded = await OrderService.initiate_refund(db, order_id, db_user)
    return Order.model_validate(refunded)


@router.post("/payments/webhook")
async def payment_webhook(payload: dict = Body(...), db: AsyncSession = Depends(get_async_db)):
    # Generic webhook endpoint for payment providers (e.g., SSLCommerz later)
    processed = await OrderService.process_payment_webhook(db, payload)
    return {"success": True, "order_id": processed.id, "status": processed.status}
