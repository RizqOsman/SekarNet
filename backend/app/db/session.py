from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from ..core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} # Uncommented for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()