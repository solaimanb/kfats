from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from fastapi import APIRouter, Depends
from app.core.database import get_async_db
from app.core.dependencies import require_role
from app.models.product import Product as DBProduct
from app.models.order import Order as DBOrder
from app.models.order_item import OrderItem as DBOrderItem
from app.schemas.common import UserRole
from app.schemas.user import User

router = APIRouter(prefix="/seller/analytics", tags=["Seller Analytics"])

# Seller Revenue Analytics
@router.get("/revenue")
async def get_seller_revenue_analytics(
    current_user: User = Depends(require_role(UserRole.SELLER)),
    db: AsyncSession = Depends(get_async_db)
):
    """Get revenue analytics for the current seller using order_items as the source of truth."""
    seller_id = current_user.id

    # Total revenue from order_items for seller's products
    total_revenue_result = await db.execute(
        db.query(func.coalesce(func.sum(DBOrderItem.unit_price * DBOrderItem.quantity), 0))
        .join(DBProduct, DBOrderItem.product_id == DBProduct.id)
        .filter(DBProduct.seller_id == seller_id)
    )
    total_revenue = total_revenue_result.scalar() or 0

    # Monthly revenue (last 12 months) from order_items.sold_at
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    monthly_revenue_result = await db.execute(
        db.query(
            func.date_trunc('month', DBOrderItem.sold_at).label('month'),
            func.sum(DBOrderItem.unit_price * DBOrderItem.quantity).label('revenue')
        ).join(
            DBProduct, DBOrderItem.product_id == DBProduct.id
        ).filter(
            DBProduct.seller_id == seller_id,
            DBOrderItem.sold_at >= twelve_months_ago
        ).group_by(
            func.date_trunc('month', DBOrderItem.sold_at)
        ).order_by('month')
    )

    monthly_revenue = monthly_revenue_result.all()
    revenue_trends = [
        {"month": month.strftime("%Y-%m"), "revenue": float(revenue)}
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
    db: AsyncSession = Depends(get_async_db)
):
    """Get order analytics for the current seller based on orders that include their products."""
    seller_id = current_user.id

    # Total unique orders containing seller's products
    total_orders_result = await db.execute(
        db.query(func.count(func.distinct(DBOrderItem.order_id)))
        .join(DBProduct, DBOrderItem.product_id == DBProduct.id)
        .filter(DBProduct.seller_id == seller_id)
    )
    total_orders = total_orders_result.scalar() or 0

    # Order status breakdown (count distinct orders per status)
    status_counts_result = await db.execute(
        db.query(DBOrder.status, func.count(func.distinct(DBOrder.id)))
        .join(DBOrderItem, DBOrder.id == DBOrderItem.order_id)
        .join(DBProduct, DBOrderItem.product_id == DBProduct.id)
        .filter(DBProduct.seller_id == seller_id)
        .group_by(DBOrder.status)
    )

    status_counts = status_counts_result.all()
    order_status = {status: count for status, count in status_counts}

    # Average order value for orders that include seller items
    avg_order_value_result = await db.execute(
        db.query(func.avg(DBOrder.total_amount))
        .join(DBOrderItem, DBOrder.id == DBOrderItem.order_id)
        .join(DBProduct, DBOrderItem.product_id == DBProduct.id)
        .filter(DBProduct.seller_id == seller_id)
        .group_by(DBOrder.id)
    )

    # avg_order_value_q returns rows per order; compute average over those
    avg_per_orders = [row[0] for row in avg_order_value_result.all()]
    avg_order_value = float(sum(avg_per_orders) / len(avg_per_orders)) if avg_per_orders else 0.0

    # Monthly order trends (by order.created_at)
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    monthly_orders_result = await db.execute(
        db.query(
            func.date_trunc('month', DBOrder.created_at).label('month'),
            func.count(func.distinct(DBOrder.id)).label('orders'),
            func.sum(DBOrder.total_amount).label('revenue')
        ).join(
            DBOrderItem, DBOrder.id == DBOrderItem.order_id
        ).join(
            DBProduct, DBOrderItem.product_id == DBProduct.id
        ).filter(
            DBProduct.seller_id == seller_id,
            DBOrder.created_at >= twelve_months_ago
        ).group_by(
            func.date_trunc('month', DBOrder.created_at)
        ).order_by('month')
    )

    monthly_orders = monthly_orders_result.all()
    order_trends = [
        {"month": month.strftime("%Y-%m"), "orders": int(orders), "revenue": float(revenue or 0)}
        for month, orders, revenue in monthly_orders
    ]

    return {
        "total_orders": int(total_orders),
        "order_status": order_status,
        "avg_order_value": float(avg_order_value),
        "order_trends": order_trends
    }

# Seller Product Performance
@router.get("/products")
async def get_seller_product_performance(
    current_user: User = Depends(require_role(UserRole.SELLER)),
    db: AsyncSession = Depends(get_async_db)
):
    """Get product performance analytics for the current seller using order_items as source of truth."""
    seller_id = current_user.id

    # Left join products with aggregated order_items
    product_stats_result = await db.execute(
        db.query(
            DBProduct.id.label('product_id'),
            DBProduct.name.label('name'),
            DBProduct.price.label('price'),
            DBProduct.stock_quantity.label('stock_quantity'),
            func.coalesce(func.sum(DBOrderItem.quantity), 0).label('sold_quantity'),
            func.coalesce(func.sum(DBOrderItem.unit_price * DBOrderItem.quantity), 0).label('revenue_generated'),
            DBProduct.status.label('status')
        ).outerjoin(
            DBOrderItem, DBOrderItem.product_id == DBProduct.id
        ).filter(
            DBProduct.seller_id == seller_id
        ).group_by(
            DBProduct.id, DBProduct.name, DBProduct.price, DBProduct.stock_quantity, DBProduct.status
        )
    )

    rows = product_stats_result.all()
    product_data = [
        {
            "product_id": int(r.product_id),
            "name": r.name,
            "price": float(r.price or 0),
            "stock_quantity": r.stock_quantity,
            "sold_quantity": int(r.sold_quantity or 0),
            "revenue_generated": float(r.revenue_generated or 0),
            "status": getattr(r.status, 'value', r.status)
        }
        for r in rows
    ]
    return {"products": product_data}
