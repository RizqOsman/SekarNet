from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import os
from datetime import datetime

from ...api.deps import get_db, get_current_active_user, get_current_admin
from ...models.user import User
from ...models.bill import Bill, PaymentStatus
from ...schemas.bill import (
    Bill as BillSchema,
    BillDetail,
    BillCreate,
    BillUpdate,
    BillPaymentUpdate
)

router = APIRouter()


@router.get("/", response_model=List[BillSchema])
def read_bills(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Retrieve all bills. Admin only.
    """
    bills = db.query(Bill).offset(skip).limit(limit).all()
    return bills


@router.get("/me", response_model=List[BillSchema])
def read_my_bills(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve current user's bills.
    """
    bills = db.query(Bill).filter(Bill.user_id == current_user.id).offset(skip).limit(limit).all()
    return bills


@router.post("/", response_model=BillSchema)
def create_bill(
    *,
    db: Session = Depends(get_db),
    bill_in: BillCreate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Create new bill. Admin only.
    """
    # Create bill
    bill = Bill(
        subscription_id=bill_in.subscription_id,
        user_id=bill_in.user_id,
        amount=bill_in.amount,
        tax=bill_in.tax,
        total_amount=bill_in.total_amount,
        description=bill_in.description,
        bill_date=bill_in.bill_date,
        due_date=bill_in.due_date,
        payment_status=bill_in.payment_status,
        payment_method=bill_in.payment_method,
        notes=bill_in.notes
    )
    
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@router.get("/{bill_id}", response_model=BillDetail)
def read_bill(
    *,
    db: Session = Depends(get_db),
    bill_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get bill by ID.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found",
        )
    
    # Check permissions: users can only see their own bills, admins can see all
    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
        
    return bill


@router.put("/{bill_id}", response_model=BillSchema)
def update_bill(
    *,
    db: Session = Depends(get_db),
    bill_id: int,
    bill_in: BillUpdate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Update a bill. Admin only.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found",
        )
    
    # Update bill fields if provided in the input
    if bill_in.amount is not None:
        bill.amount = bill_in.amount
    if bill_in.tax is not None:
        bill.tax = bill_in.tax
    if bill_in.total_amount is not None:
        bill.total_amount = bill_in.total_amount
    if bill_in.description is not None:
        bill.description = bill_in.description
    if bill_in.bill_date is not None:
        bill.bill_date = bill_in.bill_date
    if bill_in.due_date is not None:
        bill.due_date = bill_in.due_date
    if bill_in.payment_status is not None:
        bill.payment_status = bill_in.payment_status
    if bill_in.payment_method is not None:
        bill.payment_method = bill_in.payment_method
    if bill_in.payment_date is not None:
        bill.payment_date = bill_in.payment_date
    if bill_in.payment_proof is not None:
        bill.payment_proof = bill_in.payment_proof
    if bill_in.payment_reference is not None:
        bill.payment_reference = bill_in.payment_reference
    if bill_in.notes is not None:
        bill.notes = bill_in.notes
    
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@router.put("/{bill_id}/pay", response_model=BillSchema)
def pay_bill(
    *,
    db: Session = Depends(get_db),
    bill_id: int,
    payment_in: BillPaymentUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update bill payment details. Users can update their own bills.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found",
        )
    
    # Check permissions
    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Update payment details
    bill.payment_status = payment_in.payment_status
    bill.payment_method = payment_in.payment_method
    bill.payment_date = payment_in.payment_date
    
    if payment_in.payment_proof:
        bill.payment_proof = payment_in.payment_proof
        
    if payment_in.payment_reference:
        bill.payment_reference = payment_in.payment_reference
    
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@router.post("/{bill_id}/upload-payment-proof", response_model=BillSchema)
async def upload_payment_proof(
    *,
    db: Session = Depends(get_db),
    bill_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Upload payment proof for a bill.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found",
        )
    
    # Check permissions
    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Save the uploaded file
    upload_dir = "uploads/payment_proofs"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"payment_proof_{bill_id}_{current_user.id}_{timestamp}{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Write the file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Update bill with the proof path
    bill.payment_proof = file_path
    bill.payment_status = PaymentStatus.PENDING  # Change to pending for admin verification
    
    db.add(bill)
    db.commit()
    db.refresh(bill)
    
    return bill


@router.put("/{bill_id}/verify-payment", response_model=BillSchema)
def verify_payment(
    *,
    db: Session = Depends(get_db),
    bill_id: int,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Verify bill payment. Admin only.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found",
        )
    
    # Only pending payments can be verified
    if bill.payment_status != PaymentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot verify payment with status {bill.payment_status}",
        )
    
    # Update payment status to paid
    bill.payment_status = PaymentStatus.PAID
    
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill