from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from .package import Package
from .user import User


# Shared properties
class SubscriptionBase(BaseModel):
    user_id: Optional[int] = None
    package_id: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    auto_renew: Optional[bool] = True
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    billing_cycle: Optional[str] = "monthly"
    billing_day: Optional[int] = 1
    notes: Optional[str] = None


# Properties to receive via API on creation
class SubscriptionCreate(BaseModel):
    user_id: int
    package_id: int
    status: str = "pending"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    auto_renew: bool = True
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    billing_cycle: str = "monthly"
    billing_day: int = 1
    notes: Optional[str] = None


# Properties to receive via API on update
class SubscriptionUpdate(SubscriptionBase):
    pass


# Properties to return via API
class Subscription(BaseModel):
    id: int
    user_id: int
    package_id: int
    status: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    auto_renew: bool
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    billing_cycle: str
    billing_day: int
    last_payment_date: Optional[datetime] = None
    next_payment_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Subscription with expanded package and user details
class SubscriptionDetail(Subscription):
    package: Optional[Package] = None
    user: Optional[User] = None