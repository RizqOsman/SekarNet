from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...api.deps import get_db, get_current_active_user, get_current_admin
from ...models.user import User
from ...models.package import Package
from ...schemas.package import Package as PackageSchema, PackageCreate, PackageUpdate

router = APIRouter()


@router.get("/", response_model=List[PackageSchema])
def read_packages(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all packages.
    """
    packages = db.query(Package).filter(Package.is_active == True).offset(skip).limit(limit).all()
    return packages


@router.post("/", response_model=PackageSchema)
def create_package(
    *,
    db: Session = Depends(get_db),
    package_in: PackageCreate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Create new package. Admin only.
    """
    package = Package(
        name=package_in.name,
        description=package_in.description,
        speed=package_in.speed,
        data_limit=package_in.data_limit,
        price=package_in.price,
        setup_fee=package_in.setup_fee,
        features=package_in.features,
        is_active=package_in.is_active,
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    return package


@router.get("/{package_id}", response_model=PackageSchema)
def read_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
) -> Any:
    """
    Get package by ID.
    """
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found",
        )
    return package


@router.put("/{package_id}", response_model=PackageSchema)
def update_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    package_in: PackageUpdate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Update a package. Admin only.
    """
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found",
        )
        
    # Update package details
    if package_in.name:
        package.name = package_in.name
    if package_in.description:
        package.description = package_in.description
    if package_in.speed is not None:
        package.speed = package_in.speed
    if package_in.data_limit is not None:
        package.data_limit = package_in.data_limit
    if package_in.price is not None:
        package.price = package_in.price
    if package_in.setup_fee is not None:
        package.setup_fee = package_in.setup_fee
    if package_in.features is not None:
        package.features = package_in.features
    if package_in.is_active is not None:
        package.is_active = package_in.is_active
    
    db.add(package)
    db.commit()
    db.refresh(package)
    return package


@router.delete("/{package_id}", response_model=PackageSchema)
def delete_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Deactivate a package (soft delete). Admin only.
    """
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found",
        )
    
    # Soft delete by setting is_active to False
    package.is_active = False
    db.add(package)
    db.commit()
    db.refresh(package)
    return package