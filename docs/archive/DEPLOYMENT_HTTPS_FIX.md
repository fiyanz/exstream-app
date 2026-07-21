# HTTPS Deployment Fix - Mixed Content Error

## Problem
**Mixed Content Error** terjadi ketika frontend berjalan di HTTPS tapi mencoba fetch data dari backend yang masih HTTP.

```
Mixed Content: The page at 'https://jashujanextrime.my.id/' was loaded over HTTPS, 
but requested an insecure resource 'http://service.jashujanextrime.my.id/api/v1/wilayah/provinsi'. 
This request has been blocked; the content must be served over HTTPS.
```

## Root Cause
- ✅ **Frontend**: `https://jashujanextrime.my.id/` (HTTPS)
- ❌ **Backend**: `http://service.jashujanextrime.my.id/` (HTTP)
- 🚫 **Browser**: Memblokir request HTTP dari halaman HTTPS

## Solution

### 1. Update API Base URL
**File**: `frontend/src/Data/dataWilayah.js`

```javascript
// BEFORE (causes Mixed Content Error)
const productionApiUrl = 'http://service.jashujanextrime.my.id';

// AFTER (fixed)
const productionApiUrl = 'https://service.jashujanextrime.my.id';
```

### 2. Files Affected
Semua file yang menggunakan `API_BASE_URL` akan otomatis terupdate:

- ✅ `frontend/src/Data/dataWilayah.js` - Main API configuration
- ✅ `frontend/src/Data/transactionService.js` - Transaction API calls
- ✅ `frontend/src/Data/hitungCostOngkir.js` - Shipping cost API calls
- ✅ Semua komponen yang import dari file-file di atas

## Deployment Checklist

### Frontend (HTTPS)
- [x] **Domain**: `jashujanextrime.my.id`
- [x] **Protocol**: HTTPS enabled
- [x] **SSL Certificate**: Valid and trusted
- [x] **API Base URL**: Updated to HTTPS

### Backend (HTTPS)
- [ ] **Domain**: `service.jashujanextrime.my.id`
- [ ] **Protocol**: HTTPS enabled
- [ ] **SSL Certificate**: Valid and trusted
- [ ] **Port**: 443 (HTTPS) or custom port with SSL

## VPS Configuration

### 1. Nginx Configuration
```nginx
# Frontend (jashujanextrime.my.id)
server {
    listen 80;
    server_name jashujanextrime.my.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name jashujanextrime.my.id;
    
    ssl_certificate /path/to/frontend.crt;
    ssl_certificate_key /path/to/frontend.key;
    
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
    }
}

# Backend (service.jashujanextrime.my.id)
server {
    listen 80;
    server_name service.jashujanextrime.my.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name service.jashujanextrime.my.id;
    
    ssl_certificate /path/to/backend.crt;
    ssl_certificate_key /path/to/backend.key;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. SSL Certificate Setup
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate for frontend
sudo certbot --nginx -d jashujanextrime.my.id

# Get SSL certificate for backend
sudo certbot --nginx -d service.jashujanextrime.my.id

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Backend Service Configuration
```bash
# Update backend to listen on all interfaces
# In backend/main.py or uvicorn command
uvicorn main:app --host 0.0.0.0 --port 8000

# Or use systemd service
sudo nano /etc/systemd/system/exstream-backend.service

[Unit]
Description=Exstream Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/backend/.venv/bin
ExecStart=/path/to/backend/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable exstream-backend
sudo systemctl start exstream-backend
sudo systemctl status exstream-backend
```

## Testing Steps

### 1. Check SSL Certificates
```bash
# Test frontend SSL
curl -I https://jashujanextrime.my.id

# Test backend SSL
curl -I https://service.jashujanextrime.my.id

# Test API endpoint
curl https://service.jashujanextrime.my.id/api/v1/wilayah/provinsi
```

### 2. Check Frontend Console
```javascript
// Should show HTTPS URL
console.log('API Base URL being used:', API_BASE_URL);
// Expected: https://service.jashujanextrime.my.id
```

### 3. Test API Endpoints
```bash
# Test provinces
curl https://service.jashujanextrime.my.id/api/v1/wilayah/provinsi

# Test cities
curl "https://service.jashujanextrime.my.id/api/v1/wilayah/kota?provinsi_id=32"

# Test shipping
curl -X POST https://service.jashujanextrime.my.id/api/v1/pengiriman-lokal/cek-ongkir \
  -H "Content-Type: application/json" \
  -d '{"receiver_destination_id":"3201","weight":1000}'
```

## Troubleshooting

### Issue 1: SSL Certificate Not Trusted
```bash
# Check certificate validity
openssl s_client -connect service.jashujanextrime.my.id:443 -servername service.jashujanextrime.my.id

# Renew certificate if expired
sudo certbot renew --force-renewal
```

### Issue 2: Backend Not Accessible
```bash
# Check if backend is running
sudo systemctl status exstream-backend

# Check if port 8000 is open
sudo netstat -tlnp | grep 8000

# Check nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

### Issue 3: CORS Issues
```python
# In backend/main.py, ensure CORS allows HTTPS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jashujanextrime.my.id",
        "http://localhost:5173"  # For development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 4: Mixed Content Still Occurring
```bash
# Check if there are any hardcoded HTTP URLs
grep -r "http://" frontend/src/

# Check if API_BASE_URL is being overridden
grep -r "API_BASE_URL" frontend/src/
```

## Environment Variables

### Frontend (.env)
```bash
# Production
VITE_API_BASE_URL=https://service.jashujanextrime.my.id

# Development
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (.env)
```bash
# Database
DATABASE_URL=mysql+pymysql://user:password@localhost/database

# Midtrans
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=true

# CORS
FRONTEND_URL=https://jashujanextrime.my.id
```

## Monitoring

### 1. SSL Certificate Expiry
```bash
# Check certificate expiry dates
sudo certbot certificates

# Set up monitoring
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 2. Backend Health
```bash
# Health check endpoint
curl https://service.jashujanextrime.my.id/health

# Monitor logs
sudo journalctl -u exstream-backend -f
```

### 3. Frontend Errors
```javascript
// Add error monitoring
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to monitoring service
});

// Monitor API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API call to:', args[0]);
  return originalFetch.apply(this, args);
};
```

## Quick Fix Commands

```bash
# 1. Update frontend API URL
cd frontend/src/Data
sed -i 's/http:\/\/service/https:\/\/service/g' dataWilayah.js

# 2. Restart backend
sudo systemctl restart exstream-backend

# 3. Reload nginx
sudo systemctl reload nginx

# 4. Test endpoints
curl https://service.jashujanextrime.my.id/api/v1/wilayah/provinsi
```

## Expected Results

### Before Fix
- ❌ Mixed Content Error
- ❌ API calls blocked
- ❌ Dropdowns stuck loading
- ❌ Console errors

### After Fix
- ✅ No Mixed Content errors
- ✅ API calls successful
- ✅ Dropdowns load data
- ✅ Clean console
- ✅ HTTPS everywhere

## Security Benefits

### 1. Data Encryption
- ✅ All API calls encrypted
- ✅ User data protected
- ✅ Payment information secure

### 2. Browser Trust
- ✅ Modern browsers support
- ✅ No security warnings
- ✅ Better user experience

### 3. SEO Benefits
- ✅ Google prefers HTTPS
- ✅ Better search rankings
- ✅ User trust indicators
