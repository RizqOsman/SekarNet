from sqlalchemy import Boolean, Column, String, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from ..db.base_class import Base

class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TicketCategory(str, enum.Enum):
    TECHNICAL = "technical"
    BILLING = "billing"
    SERVICE = "service"
    INSTALLATION = "installation"
    OTHER = "other"

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Ticket details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default=TicketCategory.TECHNICAL)
    status = Column(String, default=TicketStatus.OPEN)
    priority = Column(String, default=TicketPriority.MEDIUM)
    
    # Ticket handling
    opened_at = Column(DateTime, server_default=func.now())
    assigned_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    # Resolution details
    resolution = Column(Text, nullable=True)
    
    # Additional info
    attachments = Column(Text, nullable=True)  # JSON string containing file paths
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    technician = relationship("User", foreign_keys=[technician_id])
    ticket_replies = relationship("TicketReply", back_populates="ticket")


class TicketReply(Base):
    __tablename__ = "ticket_replies"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Reply details
    message = Column(Text, nullable=False)
    attachments = Column(Text, nullable=True)  # JSON string containing file paths
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    ticket = relationship("SupportTicket", back_populates="ticket_replies")
    user = relationship("User")