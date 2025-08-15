from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Order(BaseModel):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    # Relationships
    seller = relationship("User", back_populates="orders")
    # Add more relationships if needed

    def __repr__(self):
        return f"<Order id={self.id} seller_id={self.seller_id} status={self.status} total_amount={self.total_amount}>"
