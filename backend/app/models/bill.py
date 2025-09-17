from sqlalchemy import Boolean, Column, String, Integer, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from ..db.base_class import Base

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PENDING_VERIFICATION = "pending_verification"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class PaymentMethod(str, enum.Enum):
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    CASH = "cash"
    ONLINE_PAYMENT = "online_payment"
    OTHER = "other"

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Bill details
    amount = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    bill_date = Column(DateTime, nullable=False, server_default=func.now())
    due_date = Column(DateTime, nullable=False)
    
    # Payment details
    payment_status = Column(String, default=PaymentStatus.PENDING)
    payment_method = Column(String, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    payment_proof = Column(String, nullable=True)  # Path to uploaded proof image
    payment_reference = Column(String, nullable=True)  # Reference/transaction number
    
    # Additional info
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    subscription = relationship("Subscription", back_populates="bills")
    user = relationship("User")