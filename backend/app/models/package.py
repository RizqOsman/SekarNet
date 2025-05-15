from sqlalchemy import Boolean, Column, String, Integer, Float, DateTime, Text
from sqlalchemy.sql import func

from ..db.base import Base

class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    speed = Column(Integer, nullable=False)  # Mbps
    data_limit = Column(Integer)  # GB, null means unlimited
    price = Column(Float, nullable=False)
    setup_fee = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    features = Column(Text)  # Stored as JSON string
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())