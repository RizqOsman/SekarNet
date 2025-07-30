# SEKAR NET - Internet Service Provider Platform

SEKAR NET adalah platform lengkap untuk Internet Service Provider (ISP) yang melayani 3 jenis pengguna: Customers, Field Technicians, dan Admins.

## 🚀 Fitur Utama

### ✅ Fitur yang Sudah Diimplementasi

#### 1. **Authentication & User Management**
- ✅ User registration dan login dengan JWT
- ✅ Role-based access control (customer, technician, admin)
- ✅ Password hashing dengan bcrypt
- ✅ Profile management

#### 2. **Internet Subscription Management**
- ✅ Browse available packages (speed, price, features)
- ✅ Request new installation
- ✅ Track installation status
- ✅ View current active package

#### 3. **Billing & Payment System**
- ✅ Monthly billing dengan due dates
- ✅ Payment history tracking
- ✅ QRIS payment integration
- ✅ Payment proof upload
- ✅ Downloadable QRIS images

#### 4. **Support & Troubleshooting**
- ✅ Submit service issues via form
- ✅ Track resolution progress
- ✅ File attachments support
- ✅ View history of submitted complaints

#### 5. **Real-time Notifications**
- ✅ WebSocket integration untuk live updates
- ✅ Email notifications dengan templates
- ✅ SMS notifications via Twilio
- ✅ Broadcast messages untuk maintenance/outages

#### 6. **Admin Panel**
- ✅ User/customer management
- ✅ Installation & complaint request management
- ✅ Job assignment untuk technicians
- ✅ Payment tracking
- ✅ Broadcast announcements

#### 7. **Technician Portal**
- ✅ View assigned jobs
- ✅ Google Maps integration untuk navigation
- ✅ Job completion photo upload
- ✅ Update complaint resolution status

#### 8. **Advanced Features**
- ✅ **Integration Testing** - Comprehensive API testing
- ✅ **Real-time Features** - WebSocket untuk live updates
- ✅ **Payment Gateway** - QRIS image generation dan download
- ✅ **File Upload** - Image/document upload untuk payment proof
- ✅ **Email/SMS** - Notification system dengan templates
- ✅ **Maps Integration** - Google Maps untuk coverage area
- ✅ **Speed Test** - Internet speed testing feature
- ✅ **Reporting** - Export data ke Excel/PDF

## 🛠 Tech Stack

### Frontend
- **React.js** + TypeScript
- **Tailwind CSS** + ShadCN UI components
- **React Query** untuk state management
- **Wouter** untuk routing
- **Framer Motion** untuk animasi
- **Lucide React** untuk icons

### Backend
- **Node.js/Express** - API utama
- **FastAPI** (Python) - API alternatif
- **PostgreSQL** dengan Drizzle ORM
- **JWT** authentication
- **WebSocket** untuk real-time features

### Additional Libraries
- **Multer** - File upload handling
- **Nodemailer** - Email notifications
- **Twilio** - SMS notifications
- **ExcelJS** - Excel report generation
- **PDFKit** - PDF report generation
- **Vitest** - Testing framework

## 📊 Database Schema

Project memiliki 12 tabel utama:
- `users` - Manajemen pengguna (customer, technician, admin)
- `packages` - Paket internet
- `subscriptions` - Langganan pelanggan
- `installation_requests` - Permintaan instalasi
- `bills` - Tagihan dan pembayaran
- `support_tickets` - Tiket dukungan teknis
- `notifications` - Notifikasi sistem
- `technician_jobs` - Pekerjaan teknisi
- `user_activities` - Aktivitas pengguna
- `connection_stats` - Statistik koneksi

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Python 3.8+ (untuk FastAPI backend)

### 1. Clone Repository
```bash
git clone <repository-url>
cd SekarNet
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies (Python)
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Environment Setup
Buat file `.env` di root directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sekar_net

# JWT
JWT_SECRET=your-secret-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Push database schema
npm run db:push

# Run migrations (if using Alembic)
cd backend
alembic upgrade head
cd ..
```

### 5. Start Development Server
```bash
# Start frontend and backend together
npm run dev

# Or start separately
npm run dev:frontend
npm run dev:backend
```

## 📱 Usage

### Customer Portal
1. **Register/Login** - Buat akun atau login
2. **Browse Packages** - Lihat paket internet yang tersedia
3. **Request Installation** - Ajukan permintaan instalasi
4. **View Billing** - Lihat tagihan dan lakukan pembayaran
5. **Speed Test** - Test kecepatan internet
6. **Support** - Ajukan tiket support

### Technician Portal
1. **View Jobs** - Lihat pekerjaan yang ditugaskan
2. **Job Map** - Navigasi ke lokasi dengan Google Maps
3. **Update Status** - Update status pekerjaan
4. **Upload Photos** - Upload foto bukti pekerjaan

### Admin Panel
1. **Dashboard** - Overview sistem
2. **Customer Management** - Kelola pelanggan
3. **Installation Management** - Kelola permintaan instalasi
4. **Support Management** - Kelola tiket support
5. **Reports** - Generate laporan Excel/PDF
6. **Notifications** - Kirim broadcast messages

## 🧪 Testing

### Run API Tests
```bash
npm run test:api
```

### Run All Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📊 Reporting

### Generate Reports
```javascript
// Excel Report
const reportGenerator = require('./server/reports');
await reportGenerator.generateBillingReport({
  format: 'excel',
  dateRange: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
});

// PDF Report
await reportGenerator.generateCustomerReport({
  format: 'pdf',
  filters: { status: 'active' }
});
```

### Available Report Types
- **Customer Report** - Complete customer list
- **Billing Report** - Payment statistics
- **Installation Report** - Installation requests
- **Support Report** - Support tickets
- **Comprehensive Report** - All data overview

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/:id` - Update user

### Packages
- `GET /api/packages` - Get all packages
- `POST /api/packages` - Create package (admin only)

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription

### Installations
- `GET /api/installation-requests` - Get installation requests
- `POST /api/installation-requests` - Create installation request
- `PATCH /api/installation-requests/:id` - Update installation

### Billing
- `GET /api/bills` - Get bills
- `POST /api/bills` - Create bill (admin only)
- `PATCH /api/bills/:id/payment` - Update payment

### Support
- `GET /api/support-tickets` - Get support tickets
- `POST /api/support-tickets` - Create support ticket
- `PATCH /api/support-tickets/:id` - Update ticket

### Payments
- `GET /api/payment/qris/:billId` - Get QRIS data
- `GET /api/payment/qris/:billId/download` - Download QRIS image
- `POST /api/payment/qris/:billId/verify` - Verify payment

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification (admin only)

### Speed Test
- `GET /api/speedtest/ping` - Ping test
- `GET /api/speedtest/download` - Download speed test
- `POST /api/speedtest/upload` - Upload speed test

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Different permissions for different user types
- **Password Hashing** - Bcrypt for secure password storage
- **Input Validation** - Zod schema validation
- **File Upload Security** - File type and size validation
- **CORS Protection** - Cross-origin resource sharing protection

## 📈 Performance Features

- **Real-time Updates** - WebSocket for live data updates
- **Caching** - React Query for efficient data caching
- **Optimized Queries** - Efficient database queries
- **File Compression** - Optimized file uploads
- **Lazy Loading** - Component and route lazy loading

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - Theme switching capability
- **Modern Components** - ShadCN UI component library
- **Smooth Animations** - Framer Motion animations
- **Accessibility** - WCAG compliant design
- **Progressive Web App** - PWA capabilities

## 📱 Mobile Features

- **Touch-friendly Interface** - Optimized for mobile devices
- **Offline Capability** - Works without internet connection
- **Push Notifications** - Real-time notifications
- **Camera Integration** - Photo upload for technicians
- **GPS Integration** - Location services for technicians

## 🔄 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t sekar-net .
docker run -p 5000:5000 sekar-net
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-secret
SMTP_HOST=your-production-smtp-host
TWILIO_ACCOUNT_SID=your-production-twilio-sid
GOOGLE_MAPS_API_KEY=your-production-maps-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@sekar.net or create an issue in the repository.

## 🗺️ Roadmap

### Phase 2 Features (Planned)
- [ ] Advanced analytics dashboard
- [ ] AI-powered customer support
- [ ] Mobile app (React Native)
- [ ] Advanced payment gateways
- [ ] Network monitoring tools
- [ ] Customer self-service portal
- [ ] Advanced reporting with charts
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Advanced security features

---

**SEKAR NET** - Connecting Indonesia, One Connection at a Time 🌐 