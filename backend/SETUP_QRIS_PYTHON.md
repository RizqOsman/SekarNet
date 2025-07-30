# Setup QRIS Payment - Python/FastAPI Backend

## 📋 Overview

Backend Python/FastAPI untuk SEKAR NET dengan dukungan QRIS payment system.

## 🖼️ Setup QRIS Image

### 1. Siapkan Gambar QRIS
**Lokasi File:**
```
public/assets/qris-sekar-net.png
```

**Spesifikasi:**
- Format: PNG (direkomendasikan)
- Ukuran: 300x300 pixel atau lebih besar
- File size: Di bawah 1MB
- Kualitas: Resolusi tinggi

### 2. Struktur Folder
```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/
│   │       └── bills.py          # QRIS endpoints
│   ├── models/
│   │   └── bill.py               # Bill model dengan QRIS support
│   ├── schemas/
│   │   └── bill.py               # Bill schemas
│   └── main.py                   # FastAPI app dengan static files
├── public/
│   └── assets/
│       └── qris-sekar-net.png    # Gambar QRIS Anda
├── uploads/
│   └── payment-proofs/           # Bukti pembayaran
└── requirements.txt              # Dependencies
```

## 🔧 QRIS Endpoints

### 1. Get QRIS Data
```http
GET /api/v1/bills/{bill_id}/qris
```

**Response:**
```json
{
  "qrisData": {
    "billId": 1,
    "amount": 500000,
    "merchantName": "SEKAR NET",
    "billNumber": "BILL-000001",
    "qrImageUrl": "/assets/qris-sekar-net.png",
    "validUntil": "2024-12-31T23:59:59"
  },
  "instructions": [
    "1. Buka aplikasi e-wallet Anda",
    "2. Scan QRIS code di atas",
    "3. Masukkan nominal pembayaran"
  ],
  "paymentDetails": {
    "amount": "Rp 500,000",
    "period": "December 2024",
    "dueDate": "31/12/2024"
  }
}
```

### 2. Download QRIS Image
```http
GET /api/v1/bills/{bill_id}/qris/download
```

**Response:** File PNG untuk download

### 3. Submit Payment Proof
```http
POST /api/v1/bills/{bill_id}/qris/verify
Content-Type: multipart/form-data

file: [payment_proof_file]
```

**Response:**
```json
{
  "message": "Payment proof uploaded successfully",
  "bill": {
    "id": 1,
    "payment_status": "pending_verification",
    "payment_proof": "uploads/payment-proofs/payment-proof-1-20241230_143022.png"
  }
}
```

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Environment
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file
DATABASE_URL=postgresql://user:password@localhost/sekar_net
SECRET_KEY=your-secret-key
```

### 3. Setup Database
```bash
# Run migrations
alembic upgrade head

# Or create tables directly
python -c "from app.db.base import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine)"
```

### 4. Upload QRIS Image
```bash
# Pastikan folder public/assets ada
mkdir -p public/assets

# Upload gambar QRIS Anda
cp /path/to/your/qris-image.png public/assets/qris-sekar-net.png
```

### 5. Run Backend
```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🔒 Security Features

### File Upload Security:
- ✅ **File Type Validation** - Hanya JPEG, PNG, PDF
- ✅ **File Size Limit** - Maksimal 2MB
- ✅ **Secure Storage** - File disimpan di folder terpisah
- ✅ **Access Control** - Hanya owner bill yang bisa upload

### Payment Verification:
- ✅ **Admin Verification** - Hanya admin yang bisa verifikasi
- ✅ **Payment Proof Required** - Bukti pembayaran wajib
- ✅ **Audit Trail** - Log semua aktivitas pembayaran

## 🧪 Testing

### Test QRIS Endpoints:
```bash
# Test QRIS data endpoint
curl -X GET "http://localhost:8000/api/v1/bills/1/qris" \
  -H "Authorization: Bearer your-token"

# Test QRIS download
curl -X GET "http://localhost:8000/api/v1/bills/1/qris/download" \
  -H "Authorization: Bearer your-token" \
  -o qris-image.png

# Test payment proof upload
curl -X POST "http://localhost:8000/api/v1/bills/1/qris/verify" \
  -H "Authorization: Bearer your-token" \
  -F "file=@payment-proof.png"
```

### Test dengan Python:
```python
import requests

# Get QRIS data
response = requests.get(
    "http://localhost:8000/api/v1/bills/1/qris",
    headers={"Authorization": "Bearer your-token"}
)
print(response.json())

# Upload payment proof
with open("payment-proof.png", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/v1/bills/1/qris/verify",
        headers={"Authorization": "Bearer your-token"},
        files={"file": f}
    )
print(response.json())
```

## 📊 Database Schema

### Bill Model Updates:
```python
class Bill(Base):
    __tablename__ = "bills"
    
    # Existing fields...
    payment_status = Column(String, default=PaymentStatus.PENDING)
    payment_proof = Column(String, nullable=True)  # Path to uploaded proof
    payment_date = Column(DateTime, nullable=True)
    
    # New PaymentStatus enum values:
    # - PENDING
    # - PENDING_VERIFICATION  # New status for QRIS payments
    # - PAID
    # - OVERDUE
    # - CANCELLED
```

## 🔄 Integration dengan Frontend

### Frontend Configuration:
```typescript
// API endpoints untuk QRIS
const QRIS_ENDPOINTS = {
  getQRISData: (billId: number) => `/api/v1/bills/${billId}/qris`,
  downloadQRIS: (billId: number) => `/api/v1/bills/${billId}/qris/download`,
  verifyPayment: (billId: number) => `/api/v1/bills/${billId}/qris/verify`,
};

// Usage dalam React component
const fetchQRISData = async (billId: number) => {
  const response = await fetch(QRIS_ENDPOINTS.getQRISData(billId), {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## 🚀 Production Deployment

### 1. Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost/sekar_net
SECRET_KEY=your-secret-key
CORS_ORIGINS=["https://your-domain.com"]
```

### 2. Static Files Setup
```bash
# Pastikan folder public/assets ada dan bisa diakses
chmod 755 public/assets
chown www-data:www-data public/assets/qris-sekar-net.png
```

### 3. Uploads Directory
```bash
# Buat folder uploads dengan permission yang tepat
mkdir -p uploads/payment-proofs
chmod 755 uploads
chown www-data:www-data uploads/payment-proofs
```

### 4. Nginx Configuration (Optional)
```nginx
location /assets/ {
    alias /path/to/backend/public/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📞 Troubleshooting

### Common Issues:

1. **QRIS Image Not Found**
   ```bash
   # Check file exists
   ls -la public/assets/qris-sekar-net.png
   
   # Check permissions
   chmod 644 public/assets/qris-sekar-net.png
   ```

2. **Upload Directory Issues**
   ```bash
   # Create uploads directory
   mkdir -p uploads/payment-proofs
   chmod 755 uploads/payment-proofs
   ```

3. **Database Migration Issues**
   ```bash
   # Reset database
   alembic downgrade base
   alembic upgrade head
   ```

4. **CORS Issues**
   ```python
   # Update CORS settings in main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000", "https://your-domain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

**SEKAR NET** - Python/FastAPI Backend QRIS Ready! 🎉 