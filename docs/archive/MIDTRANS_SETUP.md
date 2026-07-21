# Midtrans Setup Guide

## Configuration

Untuk menggunakan Midtrans, Anda perlu mengatur environment variables di file `.env`:

```env
# Midtrans Configuration (Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server-YourServerKeyHere
MIDTRANS_CLIENT_KEY=SB-Mid-client-YourClientKeyHere
MIDTRANS_IS_PRODUCTION=false
```

## Getting Midtrans Keys

1. Daftar di [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Buat akun merchant
3. Dapatkan Server Key dan Client Key dari dashboard
4. Untuk testing, gunakan Sandbox keys

## Sandbox Test Credentials

### Credit Card
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp Month: `02`
- Exp Year: `2025`
- OTP/3DS: `112233`

### Bank Transfer
- BCA: `1111111111111111`
- BNI: `1111111111111111`
- BRI: `1111111111111111`

## Production Setup

Untuk production, ubah:
```env
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=Mid-server-YourProductionServerKey
MIDTRANS_CLIENT_KEY=Mid-client-YourProductionClientKey
```

## Testing

1. Set environment variables
2. Restart backend server
3. Test dengan pembayaran non-COD
4. Gunakan test credentials di atas
