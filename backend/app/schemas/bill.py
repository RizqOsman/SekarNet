from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from .subscription import Subscription
from .user import User


# Shared properties
class BillBase(BaseModel):
    subscription_id: Optional[int] = None
    user_id: Optional[int] = None
    amount: Optional[float] = None
    tax: Optional[float] = 0.0
    total_amount: Optional[float] = None
    description: Optional[str] = None
    bill_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    payment_status: Optional[str] = "pending"
    payment_method: Optional[str] = None
    payment_date: Optional[datetime] = None
    payment_proof: Optional[str] = None
    payment_reference: Optional[str] = None
    notes: Optional[str] = None


# Properties to receive via API on creation
class BillCreate(BaseModel):
    subscription_id: int
    user_id: int
    amount: float
    tax: float = 0.0
    total_amount: float
    description: Optional[str] = None
    bill_date: datetime
    due_date: datetime
    payment_status: str = "pending"
    payment_method: Optional[str] = None
    notes: Optional[str] = None


# Properties to receive via API on payment update
class BillPaymentUpdate(BaseModel):
    payment_status: str
    payment_method: str
    payment_date: datetime
    payment_proof: Optional[str] = None
    payment_reference: Optional[str] = None


# Properties to receive via API on update
class BillUpdate(BillBase):
    pass


# Properties to return via API
class Bill(BaseModel):
    id: int
    subscription_id: int
    user_id: int
    amount: float
    tax: float
    total_amount: float
    description: Optional[str] = None
    bill_date: datetime
    due_date: datetime
    payment_status: str
    payment_method: Optional[str] = None
    payment_date: Optional[datetime] = None
    payment_proof: Optional[str] = None
    payment_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Bill with expanded subscription and user details
class BillDetail(Bill):
    subscription: Optional[Subscription] = None
    user: Optional[User] = None