from datetime import datetime, timedelta
from typing import Any, Union, Optional
import re
from fastapi import HTTPException, Security, Depends
from fastapi.security import APIKeyCookie
from jose import jwt
from passlib.context import CryptContext

from .config import settings

# Password validation settings
PASSWORD_MIN_LENGTH = 8
PASSWORD_PATTERN = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new access token for a user
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any]) -> str:
    """
    Create a new refresh token for a user
    """
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password
    """
    # Validate password against policy
    if not validate_password(password):
        raise HTTPException(
            status_code=400,
            detail="Password does not meet security requirements"
        )
    return pwd_context.hash(password)

def validate_password(password: str) -> bool:
    """
    Validate password against security policy
    """
    if len(password) < PASSWORD_MIN_LENGTH:
        return False
    
    if not PASSWORD_PATTERN.match(password):
        return False
    
    return True

def validate_password_strength(password: str) -> dict:
    """
    Check password strength and return score
    """
    score = 0
    feedback = []

    # Length check
    if len(password) >= 12:
        score += 2
    elif len(password) >= 8:
        score += 1
    else:
        feedback.append("Password is too short")

    # Complexity checks
    if re.search(r"[A-Z]", password):
        score += 1
    else:
        feedback.append("Add uppercase letters")
    
    if re.search(r"[a-z]", password):
        score += 1
    else:
        feedback.append("Add lowercase letters")
    
    if re.search(r"\d", password):
        score += 1
    else:
        feedback.append("Add numbers")
    
    if re.search(r"[@$!%*?&]", password):
        score += 1
    else:
        feedback.append("Add special characters")

    # Calculate strength
    if score < 2:
        strength = "very weak"
    elif score < 3:
        strength = "weak"
    elif score < 4:
        strength = "medium"
    elif score < 5:
        strength = "strong"
    else:
        strength = "very strong"

    return {
        "score": score,
        "strength": strength,
        "feedback": feedback
    }

# CSRF Protection
csrf_cookie = APIKeyCookie(name="csrf_token")

def get_csrf_token(csrf_token: str = Security(csrf_cookie)) -> str:
    """
    Validate CSRF token
    """
    if not csrf_token:
        raise HTTPException(
            status_code=403,
            detail="CSRF token missing"
        )
    return csrf_token

def csrf_protect(csrf_token: str = Depends(get_csrf_token)):
    """
    CSRF protection dependency
    """
    return True