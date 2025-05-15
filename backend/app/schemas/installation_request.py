from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from .package import Package
from .user import User


# Shared properties
class InstallationRequestBase(BaseModel):
    user_id: Optional[int] = None
    package_id: Optional[int] = None
    technician_id: Optional[int] = None
    requested_date: Optional[datetime] = None
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    status: Optional[str] = "pending"
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_notes: Optional[str] = None
    equipment_needed: Optional[str] = None
    installation_notes: Optional[str] = None
    completion_notes: Optional[str] = None
    customer_signature: Optional[str] = None


# Properties to receive via API on creation
class InstallationRequestCreate(BaseModel):
    user_id: int
    package_id: int
    requested_date: datetime
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_notes: Optional[str] = None
    equipment_needed: Optional[str] = None
    installation_notes: Optional[str] = None


# Properties to receive via API on update
class InstallationRequestUpdate(InstallationRequestBase):
    pass


# Properties specific to technician scheduling
class InstallationRequestSchedule(BaseModel):
    technician_id: int
    scheduled_date: datetime
    installation_notes: Optional[str] = None


# Properties specific to completion
class InstallationRequestComplete(BaseModel):
    completed_date: datetime
    status: str = "completed"
    completion_notes: str
    customer_signature: Optional[str] = None


# Properties to return via API
class InstallationRequest(BaseModel):
    id: int
    user_id: int
    package_id: int
    technician_id: Optional[int] = None
    requested_date: datetime
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    status: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_notes: Optional[str] = None
    equipment_needed: Optional[str] = None
    installation_notes: Optional[str] = None
    completion_notes: Optional[str] = None
    customer_signature: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Installation request with expanded details
class InstallationRequestDetail(InstallationRequest):
    user: Optional[User] = None
    package: Optional[Package] = None
    technician: Optional[User] = None