# Setup QRIS Payment - SEKAR NET

## 📋 Overview

SEKAR NET menggunakan gambar QRIS statis untuk sistem pembayaran. Ini berarti Anda hanya perlu menyediakan satu gambar QRIS yang akan digunakan untuk semua pembayaran.

## 🖼️ Setup QRIS Image

### 1. Siapkan Gambar QRIS Anda

**Lokasi File:**
```
public/assets/qris-sekar-net.png
```

**Spesifikasi Gambar:**
- **Format**: PNG (direkomendasikan) atau JPG
- **Ukuran**: 300x300 pixel atau lebih besar (format persegi)
- **Ukuran File**: Di bawah 1MB
- **Kualitas**: Resolusi tinggi untuk scanning yang jelas

### 2. Konten QRIS Image

Gambar QRIS Anda harus berisi:
- **Nama Merchant**: SEKAR NET
- **Merchant ID**: ID QRIS merchant Anda
- **QRIS Code**: Bisa static (jumlah tetap) atau dynamic (jumlah variabel)

### 3. Cara Kerja Sistem

#### Flow Pembayaran:
1. **Customer** melihat tagihan di halaman billing
2. **Customer** klik "Pay Now" pada tagihan
3. **Sistem** menampilkan modal QRIS payment
4. **Customer** melihat gambar QRIS Anda
5. **Customer** scan QRIS dengan e-wallet
6. **Customer** masukkan nominal sesuai tagihan
7. **Customer** upload bukti pembayaran
8. **Admin** verifikasi pembayaran

#### Fitur yang Tersedia:
- ✅ **Display QRIS Image** - Menampilkan gambar QRIS
- ✅ **Download QRIS** - Customer bisa download gambar
- ✅ **Payment Instructions** - Instruksi pembayaran lengkap
- ✅ **Payment Proof Upload** - Upload bukti pembayaran
- ✅ **Payment Verification** - Verifikasi oleh admin

## 🔧 Konfigurasi

### Environment Variables
```env
# QRIS Configuration (optional)
QRIS_MERCHANT_NAME=SEKAR NET
QRIS_MERCHANT_ID=your-merchant-id
QRIS_MERCHANT_CITY=Jakarta
QRIS_POSTAL_CODE=12345
```

### API Endpoints
```javascript
// Get QRIS data
GET /api/payment/qris/:billId

// Download QRIS image
GET /api/payment/qris/:billId/download

// Submit payment proof
POST /api/payment/qris/:billId/verify
```

## 📱 Penggunaan

### Untuk Customer:
1. Login ke aplikasi SEKAR NET
2. Buka halaman "Billing"
3. Klik "Pay Now" pada tagihan yang ingin dibayar
4. Scan QRIS code dengan e-wallet
5. Masukkan nominal pembayaran
6. Upload bukti pembayaran
7. Tunggu verifikasi admin

### Untuk Admin:
1. Login ke admin panel
2. Buka halaman "Billing"
3. Lihat payment proofs yang diupload
4. Verifikasi pembayaran
5. Update status bill menjadi "paid"

## 🎨 Customization

### Mengubah Tampilan QRIS
File: `client/src/components/payment/QRISPayment.tsx`

```typescript
// Ubah ukuran gambar
<img 
  src={qrisData.qrImageUrl} 
  alt="QRIS Code" 
  className="w-64 h-64 object-contain" // Ubah ukuran di sini
/>

// Ubah instruksi pembayaran
const instructions = [
  "1. Buka aplikasi e-wallet Anda",
  "2. Scan QRIS code di atas",
  "3. Masukkan nominal pembayaran",
  // Tambah instruksi sesuai kebutuhan
];
```

### Mengubah Payment Instructions
File: `server/routes.ts`

```javascript
const qrisData = {
  // ... other data
  instructions: [
    "1. Buka aplikasi e-wallet atau mobile banking Anda",
    "2. Pilih fitur Scan QRIS",
    "3. Scan kode QR di atas",
    "4. Masukkan nominal pembayaran sesuai tagihan",
    "5. Periksa detail pembayaran",
    "6. Konfirmasi pembayaran",
    "7. Simpan bukti pembayaran",
    "8. Upload bukti pembayaran di halaman billing"
  ]
};
```

## 🔒 Security Considerations

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

### Test QRIS Payment Flow:
1. **Setup Test Data:**
   ```bash
   # Buat test bill
   curl -X POST /api/bills \
     -H "Authorization: Bearer admin-token" \
     -d '{"userId": 1, "amount": 500000, "period": "December 2024"}'
   ```

2. **Test QRIS Display:**
   - Login sebagai customer
   - Buka billing page
   - Klik "Pay Now"
   - Verifikasi gambar QRIS muncul

3. **Test Download:**
   - Klik "Download QRIS Image"
   - Verifikasi file terdownload

4. **Test Payment Proof Upload:**
   - Upload file bukti pembayaran
   - Verifikasi file tersimpan

## 🚀 Production Deployment

### 1. Upload QRIS Image
```bash
# Upload ke server
scp qris-sekar-net.png user@server:/path/to/public/assets/
```

### 2. Set Permissions
```bash
# Set proper permissions
chmod 644 /path/to/public/assets/qris-sekar-net.png
chown www-data:www-data /path/to/public/assets/qris-sekar-net.png
```

### 3. Verify Setup
```bash
# Test endpoint
curl -H "Authorization: Bearer token" \
  https://your-domain.com/api/payment/qris/1
```

## 📞 Support

Jika ada masalah dengan setup QRIS:

1. **Check File Path** - Pastikan file ada di `public/assets/qris-sekar-net.png`
2. **Check File Permissions** - Pastikan file bisa diakses web server
3. **Check Console Logs** - Lihat error di browser console
4. **Check Server Logs** - Lihat error di server logs

## 🔄 Updates

### Mengganti QRIS Image:
1. Upload gambar QRIS baru dengan nama yang sama
2. Restart aplikasi jika diperlukan
3. Test pembayaran untuk memastikan berfungsi

### Menambah Payment Methods:
1. Buat komponen payment method baru
2. Tambah endpoint API baru
3. Update billing page untuk menampilkan opsi baru

---

**SEKAR NET** - QRIS Payment System Ready! 🎉 