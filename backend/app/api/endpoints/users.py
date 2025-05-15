from typing import List, Any
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import EmailStr
from sqlalchemy.orm import Session

from ...api.deps import get_db, get_current_active_user, get_current_admin
from ...core.security import get_password_hash, verify_password
from ...models.user import User
from ...schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Retrieve users. Admin only.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    email: EmailStr = Body(None),
    phone: str = Body(None),
    address: str = Body(None),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = UserUpdate(**current_user_data)
    
    if password is not None:
        user_in.password = password
    if full_name is not None:
        user_in.full_name = full_name
    if email is not None:
        user_in.email = email
    if phone is not None:
        user_in.phone = phone
    if address is not None:
        user_in.address = address
        
    # Check if email already exists
    if email and email != current_user.email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
    
    # Update user data
    if user_in.password:
        hashed_password = get_password_hash(user_in.password)
        current_user.hashed_password = hashed_password
    
    if user_in.full_name:
        current_user.full_name = user_in.full_name
    
    if user_in.email:
        current_user.email = user_in.email
    
    if user_in.phone:
        current_user.phone = user_in.phone
    
    if user_in.address:
        current_user.address = user_in.address
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/{user_id}", response_model=UserSchema)
def read_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    
    # Only admins can get other users info
    if user.id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
        
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Update a user. Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
        
    # Check if email already exists
    if user_in.email and user_in.email != user.email:
        user_with_email = db.query(User).filter(User.email == user_in.email).first()
        if user_with_email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
    
    # Update user data
    if user_in.password:
        hashed_password = get_password_hash(user_in.password)
        user.hashed_password = hashed_password
    
    if user_in.full_name:
        user.full_name = user_in.full_name
    
    if user_in.email:
        user.email = user_in.email
    
    if user_in.phone:
        user.phone = user_in.phone
    
    if user_in.address:
        user.address = user_in.address
    
    if user_in.role:
        user.role = user_in.role
    
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user