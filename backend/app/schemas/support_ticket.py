from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from .user import User


# Ticket Reply schemas
class TicketReplyBase(BaseModel):
    ticket_id: Optional[int] = None
    user_id: Optional[int] = None
    message: Optional[str] = None
    attachments: Optional[str] = None


class TicketReplyCreate(BaseModel):
    ticket_id: int
    user_id: int
    message: str
    attachments: Optional[str] = None


class TicketReplyUpdate(TicketReplyBase):
    pass


class TicketReply(BaseModel):
    id: int
    ticket_id: int
    user_id: int
    message: str
    attachments: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Support Ticket schemas
class SupportTicketBase(BaseModel):
    user_id: Optional[int] = None
    technician_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = "technical"
    status: Optional[str] = "open"
    priority: Optional[str] = "medium"
    resolution: Optional[str] = None
    attachments: Optional[str] = None
    notes: Optional[str] = None


class SupportTicketCreate(BaseModel):
    user_id: int
    title: str
    description: str
    category: str = "technical"
    priority: str = "medium"
    attachments: Optional[str] = None
    notes: Optional[str] = None


class SupportTicketUpdate(SupportTicketBase):
    pass


class SupportTicketAssign(BaseModel):
    technician_id: int


class SupportTicketResolve(BaseModel):
    resolution: str
    status: str = "resolved"


class SupportTicket(BaseModel):
    id: int
    user_id: int
    technician_id: Optional[int] = None
    title: str
    description: str
    category: str
    status: str
    priority: str
    opened_at: datetime
    assigned_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    resolution: Optional[str] = None
    attachments: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Expanded ticket with user, technician, and replies
class SupportTicketDetail(SupportTicket):
    user: Optional[User] = None
    technician: Optional[User] = None
    ticket_replies: Optional[List[TicketReply]] = None