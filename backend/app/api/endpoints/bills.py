from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from datetime import datetime, timedelta
import pathlib

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

# QRIS Payment endpoints
@router.get("/{bill_id}/qris")
def get_qris_data(
    *,
    db: Session = Depends(get_db),
    bill_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get QRIS payment data for a bill.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found",
        )
    
    # Check permissions: users can only access their own bills, admins can access all
    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Static QRIS data with your existing QRIS image
    qris_data = {
        "billId": bill.id,
        "amount": bill.total_amount,
        "merchantName": "SEKAR NET",
        "merchantCity": "Jakarta",
        "postalCode": "12345",
        "billNumber": f"BILL-{bill.id:06d}",
        "reference1": f"REF-{bill.id}",
        "reference2": bill.description or f"Period {bill.bill_date.strftime('%B %Y')}",
        "qrImageUrl": "/assets/qris-sekar-net.png",  # Path to your QRIS image
        "validUntil": (datetime.now() + timedelta(hours=24)).isoformat()  # 24 hours
    }
    
    return {
        "qrisData": qris_data,
        "downloadUrl": f"/api/bills/{bill_id}/qris/download",
        "instructions": [
            "1. Buka aplikasi e-wallet atau mobile banking Anda",
            "2. Pilih fitur Scan QRIS",
            "3. Scan kode QR di atas",
            "4. Masukkan nominal pembayaran sesuai tagihan",
            "5. Periksa detail pembayaran",
            "6. Konfirmasi pembayaran",
            "7. Simpan bukti pembayaran",
            "8. Upload bukti pembayaran di halaman billing"
        ],
        "paymentDetails": {
            "amount": f"Rp {bill.total_amount:,}",
            "period": bill.description or f"Period {bill.bill_date.strftime('%B %Y')}",
            "dueDate": bill.due_date.strftime('%d/%m/%Y'),
            "billNumber": qris_data["billNumber"]
        }
    }


@router.get("/{bill_id}/qris/download")
def download_qris_image(
    *,
    db: Session = Depends(get_db),
    bill_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Download QRIS image for a bill.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found",
        )
    
    # Check permissions: users can only access their own bills, admins can access all
    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Path to your static QRIS image
    qris_image_path = pathlib.Path("public/assets/qris-sekar-net.png")
    
    # Check if file exists
    if not qris_image_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QRIS image not found",
        )
    
    # Return the file for download
    return FileResponse(
        path=qris_image_path,
        filename=f"qris-sekar-net-bill-{bill_id}.png",
        media_type="image/png"
    )


@router.post("/{bill_id}/qris/verify")
async def verify_qris_payment(
    *,
    db: Session = Depends(get_db),
    bill_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Submit payment proof for QRIS payment verification.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found",
        )
    
    # Check permissions: users can only upload for their own bills
    if bill.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
        )
    
    # Validate file size (2MB limit)
    if file.size > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 2MB",
        )
    
    # Create uploads directory if it doesn't exist
    uploads_dir = pathlib.Path("uploads/payment-proofs")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = pathlib.Path(file.filename).suffix
    filename = f"payment-proof-{bill_id}-{timestamp}{file_extension}"
    file_path = uploads_dir / filename
    
    # Save the file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )
    
    # Update bill with payment proof
    bill.payment_proof = str(file_path)
    bill.payment_status = PaymentStatus.PENDING_VERIFICATION
    bill.payment_date = datetime.now()
    
    db.commit()
    db.refresh(bill)
    
    return {
        "message": "Payment proof uploaded successfully",
        "bill": bill
    }