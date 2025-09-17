from typing import Optional, Union
from pydantic import BaseModel, EmailStr, Field


# Shared properties
class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = True


# Properties to receive via API on creation
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str = "customer"
    is_active: bool = True


# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None


# Properties to return via API
class User(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# Properties for login
class UserLogin(BaseModel):
    username: str
    password: str