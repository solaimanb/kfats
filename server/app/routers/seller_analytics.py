from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User as DBUser
from app.models.product import Product as DBProduct
from app.models.order import Order as DBOrder
from app.schemas.common import UserRole, ProductStatus
from app.schemas.user import User

router = APIRouter(prefix="/seller/analytics", tags=["Seller Analytics"])

# Seller Revenue Analytics
@router.get("/revenue")
async def get_seller_revenue_analytics(
    current_user: User = Depends(require_role(UserRole.SELLER)),
    db: Session = Depends(get_db)
):
    """Get revenue analytics for the current seller."""
    # Total revenue
    total_revenue = db.query(func.sum(DBProduct.price * DBProduct.sold_quantity)).filter(
        DBProduct.seller_id == current_user.id
    ).scalar() or 0
    # Monthly revenue (last 12 months)
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    monthly_revenue = db.query(
        func.date_trunc('month', DBProduct.sold_at).label('month'),
        func.sum(DBProduct.price * DBProduct.sold_quantity).label('revenue')
    ).filter(
        DBProduct.seller_id == current_user.id,
        DBProduct.sold_at >= twelve_months_ago
    ).group_by(
        func.date_trunc('month', DBProduct.sold_at)
    ).order_by('month').all()
    revenue_trends = [
        {"month": month.strftime("%Y-%m"), "revenue": revenue}
        for month, revenue in monthly_revenue
    ]
    return {
        "total_revenue": float(total_revenue),
        "revenue_trends": revenue_trends
    }

# Seller Order Analytics
@router.get("/orders")
async def get_seller_order_analytics(
    current_user: User = Depends(require_role(UserRole.SELLER)),
    db: Session = Depends(get_db)
):
    """Get order analytics for the current seller."""
    # Total orders
    total_orders = db.query(DBOrder).filter(DBOrder.seller_id == current_user.id).count()
    # Order status breakdown
    status_counts = db.query(DBOrder.status, func.count(DBOrder.id)).filter(
        DBOrder.seller_id == current_user.id
    ).group_by(DBOrder.status).all()
    order_status = {status: count for status, count in status_counts}
    # Average order value
    avg_order_value = db.query(func.avg(DBOrder.total_amount)).filter(
        DBOrder.seller_id == current_user.id
    ).scalar() or 0
    # Monthly order trends
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    monthly_orders = db.query(
        func.date_trunc('month', DBOrder.created_at).label('month'),
        func.count(DBOrder.id).label('orders'),
        func.sum(DBOrder.total_amount).label('revenue')
    ).filter(
        DBOrder.seller_id == current_user.id,
        DBOrder.created_at >= twelve_months_ago
    ).group_by(
        func.date_trunc('month', DBOrder.created_at)
    ).order_by('month').all()
    order_trends = [
        {"month": month.strftime("%Y-%m"), "orders": orders, "revenue": revenue}
        for month, orders, revenue in monthly_orders
    ]
    return {
        "total_orders": total_orders,
        "order_status": order_status,
        "avg_order_value": float(avg_order_value),
        "order_trends": order_trends
    }

# Seller Product Performance
@router.get("/products")
async def get_seller_product_performance(
    current_user: User = Depends(require_role(UserRole.SELLER)),
    db: Session = Depends(get_db)
):
    """Get product performance analytics for the current seller."""
    products = db.query(DBProduct).filter(DBProduct.seller_id == current_user.id).all()
    product_data = [
        {
            "product_id": p.id,
            "name": p.name,
            "price": float(p.price),
            "stock_quantity": p.stock_quantity,
            "sold_quantity": p.sold_quantity,
            "revenue_generated": float(p.price * p.sold_quantity),
            "status": p.status.value
        }
        for p in products
    ]
    return {"products": product_data}
