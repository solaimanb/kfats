from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_seller_or_admin, require_roles
from app.schemas.order import OrderCreate, Order
from app.services.order_service import OrderService
from app.models.user import User as DBUser
from app.schemas.user import User, User as UserSchema
from app.schemas.common import UserRole

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=Order)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    buyer = db.query(DBUser).filter(DBUser.id == current_user.id).first()
    if not buyer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db_order = OrderService.create_order(db, order_data, buyer)
    return Order.model_validate(db_order)


@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    order = OrderService.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return Order.model_validate(order)


@router.get("/", response_model=List[Order])
async def list_orders(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    orders = OrderService.list_orders(db, buyer_id=current_user.id, skip=skip, limit=limit)
    return [Order.model_validate(o) for o in orders]


@router.get("/seller/", response_model=List[Order])
async def get_seller_orders(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_seller_or_admin)):
    # current_user is a pydantic User schema; use id
    orders = OrderService.list_orders_by_seller(db, seller_id=current_user.id, skip=skip, limit=limit)
    return [Order.model_validate(o) for o in orders]


@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(order_id: int, status_payload: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    new_status = status_payload.get("status")
    if not new_status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing status in payload")
    db_user = db.query(DBUser).filter(DBUser.id == current_user.id).first()
    updated = OrderService.update_order_status(db, order_id, new_status, db_user)
    return Order.model_validate(updated)


@router.post("/{order_id}/refund", response_model=Order)
async def refund_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    db_user = db.query(DBUser).filter(DBUser.id == current_user.id).first()
    refunded = OrderService.initiate_refund(db, order_id, db_user)
    return Order.model_validate(refunded)


@router.post("/payments/webhook")
async def payment_webhook(payload: dict = Body(...), db: Session = Depends(get_db)):
    # Generic webhook endpoint for payment providers (e.g., SSLCommerz later)
    processed = OrderService.process_payment_webhook(db, payload)
    return {"success": True, "order_id": processed.id, "status": processed.status}
