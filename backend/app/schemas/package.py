from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# Shared properties
class PackageBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    speed: Optional[int] = None  # Mbps
    data_limit: Optional[int] = None  # GB, null means unlimited
    price: Optional[float] = None
    setup_fee: Optional[float] = 0.0
    is_active: Optional[bool] = True
    features: Optional[str] = None


# Properties to receive via API on creation
class PackageCreate(BaseModel):
    name: str
    description: str
    speed: int
    data_limit: Optional[int] = None
    price: float
    setup_fee: float = 0.0
    features: Optional[str] = None
    is_active: bool = True


# Properties to receive via API on update
class PackageUpdate(PackageBase):
    pass


# Properties to return via API
class Package(BaseModel):
    id: int
    name: str
    description: str
    speed: int
    data_limit: Optional[int] = None
    price: float
    setup_fee: float
    is_active: bool
    features: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True