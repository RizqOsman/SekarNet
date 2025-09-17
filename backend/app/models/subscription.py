from sqlalchemy import Boolean, Column, String, Integer, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from ..db.base_class import Base

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"
    CANCELLED = "cancelled"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    
    # Subscription details
    status = Column(String, default=SubscriptionStatus.PENDING)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)  # For fixed-term subscriptions
    auto_renew = Column(Boolean, default=True)
    ip_address = Column(String, nullable=True)
    mac_address = Column(String, nullable=True)
    
    # Billing details
    billing_cycle = Column(String, default="monthly")  # monthly, quarterly, yearly
    billing_day = Column(Integer, default=1)  # day of month for billing
    last_payment_date = Column(DateTime, nullable=True)
    next_payment_date = Column(DateTime, nullable=True)
    
    # Additional info
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    package = relationship("Package")
    bills = relationship("Bill", back_populates="subscription")