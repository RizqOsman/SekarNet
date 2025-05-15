from sqlalchemy import Boolean, Column, String, Integer, DateTime, ForeignKey, Text, Enum, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from ..db.base import Base

class InstallationStatus(str, enum.Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"

class InstallationRequest(Base):
    __tablename__ = "installation_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Installation details
    requested_date = Column(DateTime, nullable=False)
    scheduled_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    status = Column(String, default=InstallationStatus.PENDING)
    
    # Location details
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_notes = Column(Text, nullable=True)
    
    # Technical details
    equipment_needed = Column(Text, nullable=True)  # JSON string of equipment
    installation_notes = Column(Text, nullable=True)
    completion_notes = Column(Text, nullable=True)
    
    # Customer signature on completion
    customer_signature = Column(Text, nullable=True)
    
    # Additional info
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    package = relationship("Package")
    technician = relationship("User", foreign_keys=[technician_id])