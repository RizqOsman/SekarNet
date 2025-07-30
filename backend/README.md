# SEKAR NET - Python/FastAPI Backend

Backend Python/FastAPI untuk sistem ISP SEKAR NET dengan dukungan QRIS payment.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env dengan konfigurasi database Anda
DATABASE_URL=postgresql://user:password@localhost/sekar_net
SECRET_KEY=your-secret-key-here
```

### 3. Setup Database
```bash
# Run migrations
alembic upgrade head

# Atau create tables langsung
python -c "from app.db.base import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine)"
```

### 4. Setup QRIS Image
```bash
# Buat folder assets
mkdir -p public/assets

# Upload gambar QRIS Anda
cp /path/to/your/qris-image.png public/assets/qris-sekar-net.png
```

### 5. Run Backend
```bash
# Menggunakan script yang sudah disiapkan
python run_qris.py

# Atau langsung dengan uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📋 Features

### ✅ QRIS Payment System
- **QRIS Image Display** - Menampilkan gambar QRIS statis
- **QRIS Download** - Download gambar QRIS
- **Payment Proof Upload** - Upload bukti pembayaran
- **Payment Verification** - Verifikasi pembayaran oleh admin

### ✅ API Endpoints
- **Authentication** - JWT-based authentication
- **User Management** - CRUD operations untuk users
- **Bill Management** - CRUD operations untuk bills
- **Subscription Management** - CRUD operations untuk subscriptions
- **Package Management** - CRUD operations untuk packages

### ✅ Security Features
- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - Admin, Customer, Technician roles
- **File Upload Security** - Validasi file type dan size
- **CORS Support** - Cross-origin resource sharing

## 🔧 QRIS Endpoints

### Get QRIS Data
```http
GET /api/v1/bills/{bill_id}/qris
Authorization: Bearer {token}
```

### Download QRIS Image
```http
GET /api/v1/bills/{bill_id}/qris/download
Authorization: Bearer {token}
```

### Submit Payment Proof
```http
POST /api/v1/bills/{bill_id}/qris/verify
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [payment_proof_file]
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── api.py              # API router
│   │   ├── deps.py             # Dependencies
│   │   └── endpoints/          # API endpoints
│   │       ├── auth.py         # Authentication
│   │       ├── bills.py        # Bills & QRIS
│   │       ├── packages.py     # Packages
│   │       ├── subscriptions.py # Subscriptions
│   │       └── users.py        # Users
│   ├── core/
│   │   ├── config.py           # Configuration
│   │   └── security.py         # Security utilities
│   ├── db/
│   │   ├── base.py             # Database base
│   │   └── session.py          # Database session
│   ├── models/                 # SQLAlchemy models
│   │   ├── bill.py             # Bill model
│   │   ├── package.py          # Package model
│   │   ├── subscription.py     # Subscription model
│   │   └── user.py             # User model
│   ├── schemas/                # Pydantic schemas
│   │   ├── bill.py             # Bill schemas
│   │   ├── package.py          # Package schemas
│   │   ├── subscription.py     # Subscription schemas
│   │   └── user.py             # User schemas
│   └── main.py                 # FastAPI application
├── public/
│   └── assets/
│       └── qris-sekar-net.png  # QRIS image
├── uploads/                    # Uploaded files
│   ├── payment-proofs/         # Payment proofs
│   ├── support-attachments/    # Support attachments
│   └── installation-photos/    # Installation photos
├── requirements.txt            # Python dependencies
├── run_qris.py                # Run script
├── SETUP_QRIS_PYTHON.md       # QRIS setup guide
└── README.md                  # This file
```

## 🔒 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/sekar_net

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "https://your-domain.com"]

# API
API_V1_STR=/api/v1
PROJECT_NAME=SEKAR NET API

# Optional: Email/SMS (untuk notifikasi)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🧪 Testing

### Test QRIS Endpoints
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

### Test dengan Python
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

## 📊 Database Models

### Bill Model
```python
class Bill(Base):
    __tablename__ = "bills"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Bill details
    amount = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    bill_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    
    # Payment details
    payment_status = Column(String, default=PaymentStatus.PENDING)
    payment_method = Column(String, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    payment_proof = Column(String, nullable=True)  # Path to uploaded proof
    payment_reference = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

### Payment Status Enum
```python
class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PENDING_VERIFICATION = "pending_verification"  # QRIS payment
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
```

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
export DATABASE_URL="postgresql://user:password@prod-db/sekar_net"
export SECRET_KEY="your-production-secret-key"
export CORS_ORIGINS='["https://your-domain.com"]'
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Migration
```bash
alembic upgrade head
```

### 4. Setup Static Files
```bash
# Create directories
mkdir -p public/assets uploads/payment-proofs

# Upload QRIS image
cp qris-sekar-net.png public/assets/

# Set permissions
chmod 755 public/assets uploads/payment-proofs
chown www-data:www-data public/assets/qris-sekar-net.png
```

### 5. Run with Gunicorn
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 6. Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /assets/ {
        alias /path/to/backend/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📞 Support

### Troubleshooting

1. **QRIS Image Not Found**
   ```bash
   # Check file exists
   ls -la public/assets/qris-sekar-net.png
   
   # Check permissions
   chmod 644 public/assets/qris-sekar-net.png
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   python -c "from app.db.session import engine; print(engine.execute('SELECT 1').scalar())"
   ```

3. **Upload Directory Issues**
   ```bash
   # Create uploads directory
   mkdir -p uploads/payment-proofs
   chmod 755 uploads/payment-proofs
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

### Logs
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

---

**SEKAR NET** - Python/FastAPI Backend with QRIS Support! 🎉

Untuk informasi lebih lanjut tentang setup QRIS, lihat `SETUP_QRIS_PYTHON.md` 