from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from sqlalchemy.sql import func

class Order(BaseModel):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_reference = Column(String, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    # Specify foreign_keys and back_populates to disambiguate the two FKs to users
    seller = relationship("User", foreign_keys=[seller_id], back_populates="orders")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="purchases")
    items = relationship("OrderItem", back_populates="order")
    # Add more relationships if needed

    def __repr__(self):
        return f"<Order id={self.id} seller_id={self.seller_id} status={self.status} total_amount={self.total_amount}>"
