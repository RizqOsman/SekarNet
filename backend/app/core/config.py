import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, Field, PostgresDsn, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SEKAR NET"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Security
    SECRET_KEY: str = "8195de4977409de9c63994aa6c93b484f0eb53d5f522e5c6335c1017eab66f86"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/sekar_net"
    
    # Use SQLAlchemy 2.0 syntax
    @validator("DATABASE_URL", pre=True)
    def get_database_url(cls, v: Optional[str]) -> Any:
        if not v:
            return v
        return v.replace('postgres://', 'postgresql://')
        
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()