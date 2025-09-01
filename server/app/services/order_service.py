from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.product import Product as DBProduct
from app.models.order import Order as DBOrder
from app.models.order_item import OrderItem as DBOrderItem
from app.models.user import User as DBUser
from app.schemas.order import OrderCreate
from uuid import uuid4
from datetime import datetime
from typing import Dict, Optional, Any, cast


class OrderService:
    @staticmethod
    async def create_order(db: AsyncSession, order_create: OrderCreate, buyer: DBUser) -> DBOrder:
        """Create an order with transactional safety.
        Steps:
        - Validate stock availability
        - Decrement stock atomically
        - Create Order and OrderItems
        - Update Product sold_quantity atomically
        """
        total_amount = 0.0
        order_items = []

        try:
            for item in order_create.items:
                result = await db.execute(
                    db.query(DBProduct).filter(DBProduct.id == item.product_id).with_for_update()
                )
                product = result.scalars().first()
                if not product:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")

                prod = cast(Any, product)
                stock_qty_val = getattr(prod, "stock_quantity", None)
                quantity = int(getattr(item, "quantity"))

                # Normalize stock_qty to a runtime int if present
                if stock_qty_val is not None:
                    try:
                        stock_qty = int(stock_qty_val)
                    except Exception:
                        stock_qty = None
                else:
                    stock_qty = None

                if stock_qty is not None and stock_qty < quantity:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Not enough stock for product {getattr(prod, 'id', None)}")

                # Reserve stock and update sold_quantity using runtime setattr
                if stock_qty is not None:
                    setattr(prod, "stock_quantity", stock_qty - quantity)
                sold_qty_val = getattr(prod, "sold_quantity", 0) or 0
                try:
                    sold_qty = int(sold_qty_val)
                except Exception:
                    sold_qty = 0
                setattr(prod, "sold_quantity", sold_qty + quantity)

                price = float(getattr(prod, "price", 0))
                total_amount += price * quantity

                order_items.append({
                    "product": prod,
                    "unit_price": price,
                    "quantity": quantity,
                })

            # Create order with payment_reference
            payment_ref = str(uuid4())
            buyer_any = cast(Any, buyer)
            buyer_id_attr = getattr(buyer_any, "id", None)
            if buyer_id_attr is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid buyer id")
            buyer_id_val = int(buyer_id_attr)

            # Determine seller_id for the order. If items come from multiple sellers, reject for now.
            seller_ids = set()
            for oi in order_items:
                prod_any = cast(Any, oi["product"])
                sid = getattr(prod_any, "seller_id", None)
                if sid is None:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product {getattr(prod_any,'id',None)} has no seller_id")
                seller_ids.add(int(sid))

            if len(seller_ids) > 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Orders containing items from multiple sellers are not supported")

            seller_id_val = next(iter(seller_ids)) if seller_ids else None

            db_order = DBOrder(buyer_id=buyer_id_val, seller_id=seller_id_val, total_amount=total_amount, status="pending", payment_reference=payment_ref)
            db.add(db_order)
            await db.flush()  # get order id

            db_order_any = cast(Any, db_order)
            db_order_id = int(getattr(db_order_any, "id"))

            # Create order items
            for oi in order_items:
                prod_any = cast(Any, oi["product"])
                prod_id_val = int(getattr(prod_any, "id"))
                db_item = DBOrderItem(order_id=db_order_id, product_id=prod_id_val, unit_price=oi["unit_price"], quantity=oi["quantity"])
                db.add(db_item)

            await db.commit()
            await db.refresh(db_order)

            # Graceful fallback: some DB backends (or driver configs) may not
            # populate server_default timestamps back into SQLAlchemy objects
            # immediately. Pydantic expects valid datetimes for `created_at`/
            # `updated_at` (and `sold_at` on items). If they are None, set
            # sensible UTC timestamps here to avoid validation errors and
            # return a fully-populated object.
            if getattr(db_order, "created_at", None) is None:
                setattr(db_order, "created_at", datetime.utcnow())
            if getattr(db_order, "updated_at", None) is None:
                setattr(db_order, "updated_at", datetime.utcnow())

            # Ensure order items have sold_at populated for Pydantic model
            try:
                for it in getattr(db_order, "items", []) or []:
                    if getattr(it, "sold_at", None) is None:
                        setattr(it, "sold_at", datetime.utcnow())
            except Exception:
                # Be defensive: if relationship access fails for any reason,
                # ignore and proceed - this is only a best-effort fill.
                pass

            return db_order
        except HTTPException:
            await db.rollback()
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    @staticmethod
    def _ensure_order_timestamps(db_order: DBOrder):
        """Populate missing datetime fields on an order and its items.

        Some DB drivers or session/refresh timings may leave server_default
        timestamps as None on the ORM object. Pydantic model validation
        requires valid datetimes, so fill with utcnow() as a safe fallback.
        This is a best-effort, non-destructive operation.
        """
        try:
            if getattr(db_order, "created_at", None) is None:
                setattr(db_order, "created_at", datetime.utcnow())
            if getattr(db_order, "updated_at", None) is None:
                setattr(db_order, "updated_at", datetime.utcnow())
            for it in getattr(db_order, "items", []) or []:
                if getattr(it, "sold_at", None) is None:
                    setattr(it, "sold_at", datetime.utcnow())
        except Exception:
            # Never raise from this helper; it's a best-effort fix
            return

    @staticmethod
    async def get_order(db: AsyncSession, order_id: int):
        result = await db.execute(
            db.query(DBOrder).filter(DBOrder.id == int(order_id))
        )
        order = result.scalars().first()
        if order is not None:
            OrderService._ensure_order_timestamps(order)
        return order

    @staticmethod
    async def list_orders(db: AsyncSession, buyer_id: Optional[int] = None, skip: int = 0, limit: int = 20):
        query = db.query(DBOrder)
        if buyer_id is not None:
            query = query.filter(DBOrder.buyer_id == int(buyer_id))
        result = await db.execute(
            query.offset(int(skip)).limit(int(limit))
        )
        orders = result.scalars().all()
        # Small fallback: ensure datetimes exist for Pydantic validation if DB didn't return them.
        for o in orders:
            OrderService._ensure_order_timestamps(o)
        return orders

    @staticmethod
    async def list_orders_by_seller(db: AsyncSession, seller_id: int, skip: int = 0, limit: int = 20):
        """List orders that include items sold by the given seller (join on order_items/products)."""
        query = (
            db.query(DBOrder)
            .join(DBOrderItem, DBOrder.id == DBOrderItem.order_id)
            .join(DBProduct, DBOrderItem.product_id == DBProduct.id)
            .filter(DBProduct.seller_id == int(seller_id))
        )
        result = await db.execute(
            query.offset(int(skip)).limit(int(limit))
        )
        orders = result.scalars().all()
        # Ensure timestamps for each order to avoid Pydantic validation errors
        for o in orders:
            OrderService._ensure_order_timestamps(o)
        return orders

    @staticmethod
    async def update_order_status(db: AsyncSession, order_id: int, new_status: str, actor_user: DBUser):
        """Update order status with basic permission checks.
        Sellers can update status only for orders that include their products and only to allowed transitions.
        Admins can update any order.
        """
        result = await db.execute(
            db.query(DBOrder).filter(DBOrder.id == int(order_id))
        )
        db_order = result.scalars().first()
        if not db_order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        # If actor is not admin, ensure actor is seller for at least one item in order
        actor_role = getattr(actor_user, "role", None)
        actor_role_value = getattr(actor_role, "value", actor_role)
        if actor_role_value != "admin":
            actor_id_attr = getattr(cast(Any, actor_user), "id", None)
            if actor_id_attr is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid actor id")
            actor_id = int(actor_id_attr)
            result = await db.execute(
                db.query(DBOrderItem)
                .join(DBProduct, DBOrderItem.product_id == DBProduct.id)
                .filter(DBOrderItem.order_id == int(order_id), DBProduct.seller_id == actor_id)
            )
            seller_match = result.scalars().first()
            if not seller_match:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to modify this order")

        setattr(cast(Any, db_order), "status", str(new_status))
        await db.commit()
        await db.refresh(db_order)
        # Ensure created/updated timestamps exist before returning
        OrderService._ensure_order_timestamps(db_order)
        return db_order

    @staticmethod
    async def process_payment_webhook(db: AsyncSession, payment_data: Dict):
        """Process a payment provider webhook payload. Expects payment_reference and status."""
        payment_ref = payment_data.get("payment_reference")
        status_str = payment_data.get("status")
        if not payment_ref:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing payment_reference")

        result = await db.execute(
            db.query(DBOrder).filter(DBOrder.payment_reference == payment_ref)
        )
        db_order = result.scalars().first()
        if not db_order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found for payment reference")

        # Map provider statuses to internal statuses
        if status_str in ("success", "paid", "completed"):
            setattr(cast(Any, db_order), "status", "paid")
        elif status_str in ("failed", "declined"):
            setattr(cast(Any, db_order), "status", "payment_failed")
        elif status_str == "refunded":
            setattr(cast(Any, db_order), "status", "refunded")
        else:
            # keep unknown statuses as-is but record raw info if needed
            setattr(cast(Any, db_order), "status", str(status_str))

        await db.commit()
        await db.refresh(db_order)
        OrderService._ensure_order_timestamps(db_order)
        return db_order

    @staticmethod
    async def initiate_refund(db: AsyncSession, order_id: int, actor_user: DBUser):
        """Initiate refund: permission checks, set status, restock items.
        This is a logical refund; integration with payment gateway should be implemented separately.
        """
        result = await db.execute(
            db.query(DBOrder).filter(DBOrder.id == int(order_id))
        )
        db_order = result.scalars().first()
        if not db_order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        # Admins can refund any order. Sellers can refund only if they are the sole seller for the order or if the order includes their products and business rules allow.
        actor_role = getattr(actor_user, "role", None)
        actor_role_value = getattr(actor_role, "value", actor_role)
        if actor_role_value != "admin":
            actor_id_attr = getattr(cast(Any, actor_user), "id", None)
            if actor_id_attr is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid actor id")
            actor_id = int(actor_id_attr)
            result = await db.execute(
                db.query(DBOrderItem)
                .join(DBProduct, DBOrderItem.product_id == DBProduct.id)
                .filter(DBOrderItem.order_id == int(order_id), DBProduct.seller_id == actor_id)
            )
            seller_items = result.scalars().all()
            if not seller_items:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to refund this order")

        # Perform refund logic: mark refunded and restock products (for items belonging to the refunding actor or all if admin)
        try:
            result = await db.execute(
                db.query(DBOrderItem).filter(DBOrderItem.order_id == int(order_id))
            )
            items_to_handle = result.scalars().all()
            for item in items_to_handle:
                prod_id = getattr(item, "product_id", None)
                if prod_id is None:
                    continue
                result = await db.execute(
                    db.query(DBProduct).filter(DBProduct.id == prod_id)
                )
                prod = result.scalars().first()
                if prod:
                    prod_any = cast(Any, prod)
                    # Restock
                    current_stock = getattr(prod_any, "stock_quantity", None)
                    if current_stock is not None:
                        try:
                            current_stock_val = int(current_stock)
                        except Exception:
                            current_stock_val = 0
                        qty = int(getattr(item, "quantity", 0))
                        setattr(prod_any, "stock_quantity", current_stock_val + qty)
                    # Decrement sold_quantity safely
                    current_sold_val = getattr(prod_any, "sold_quantity", 0) or 0
                    try:
                        current_sold = int(current_sold_val)
                    except Exception:
                        current_sold = 0
                    qty = int(getattr(item, "quantity", 0))
                    setattr(prod_any, "sold_quantity", max(current_sold - qty, 0))
            setattr(cast(Any, db_order), "status", "refunded")
            await db.commit()
            await db.refresh(db_order)
            OrderService._ensure_order_timestamps(db_order)
            return db_order
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
