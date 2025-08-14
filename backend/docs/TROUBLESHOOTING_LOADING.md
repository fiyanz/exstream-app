# Troubleshooting: "Memuat Terus" Issue

## Problem
Dropdown "Provinsi" stuck di "Memuat..." (Loading...) dan tidak bisa load data lokasi.

## Root Causes

### 1. Backend Not Running
- ✅ Backend process tidak berjalan
- ✅ Port 8000 tidak terbuka
- ✅ Connection refused error

### 2. Import Error
- ✅ Model import tidak sesuai
- ✅ `Provinsi` vs `Province` naming mismatch
- ✅ Database connection issues

### 3. Frontend API Call Issues
- ✅ CORS problems
- ✅ Network timeout
- ✅ API endpoint not found

## Solution Steps

### Step 1: Check Backend Status
```bash
# Check if uvicorn process is running
ps aux | grep uvicorn

# Check if port 8000 is open
netstat -tlnp | grep 8000
# or
ss -tlnp | grep 8000

# Test backend connection
curl -v "http://localhost:8000/docs"
```

### Step 2: Fix Import Issues
```python
# Wrong import (causes error)
from models.data_wilayah import Provinsi, Kota, Kecamatan, Desa

# Correct import
from models.data_wilayah import Province, Regency, District, Village
```

### Step 3: Restart Backend
```bash
# Kill existing processes
pkill -f "uvicorn main:app"

# Start backend in foreground to see errors
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or start in background
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
```

### Step 4: Test API Endpoints
```bash
# Test province endpoint
curl "http://localhost:8000/api/v1/wilayah/provinsi"

# Test city endpoint
curl "http://localhost:8000/api/v1/wilayah/kota?province_id=32"

# Test subdistrict endpoint
curl "http://localhost:8000/api/v1/wilayah/kecamatan?city_id=3201"

# Test village endpoint
curl "http://localhost:8000/api/v1/wilayah/desa?subdistrict_id=320101"
```

## Common Issues & Fixes

### Issue 1: "Address already in use"
```bash
# Solution: Kill existing process
lsof -i :8000
kill -9 <PID>
```

### Issue 2: Import Error
```bash
# Check model names in data_wilayah.py
cat models/data_wilayah.py

# Fix import statements in transaksi.py
# Change Provinsi → Province, Kota → Regency, etc.
```

### Issue 3: Database Connection
```bash
# Check database connection
# Ensure .env file has correct DATABASE_URL
# Test database connection manually
```

### Issue 4: Frontend CORS
```python
# In main.py, ensure CORS is properly configured
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing Checklist

### Backend Health Check
- [ ] Backend process running
- [ ] Port 8000 open and accessible
- [ ] No import errors in logs
- [ ] Database connection working
- [ ] API endpoints responding

### Frontend Integration
- [ ] CORS properly configured
- [ ] API calls reaching backend
- [ ] Response data format correct
- [ ] Error handling implemented
- [ ] Loading states managed

### Data Flow
- [ ] Province data loads
- [ ] City dropdown populates after province selection
- [ ] Subdistrict dropdown populates after city selection
- [ ] Village dropdown populates after subdistrict selection
- [ ] Shipping cost calculation works

## Debug Commands

### Check Backend Logs
```bash
# Run backend in foreground to see real-time logs
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Check for specific errors
grep -r "Error" logs/
```

### Test Database
```bash
# Connect to database directly
mysql -u username -p database_name

# Test queries
SELECT * FROM reg_provinces LIMIT 5;
SELECT * FROM reg_regencies LIMIT 5;
```

### Network Debug
```bash
# Check if port is accessible
telnet localhost 8000

# Test with different tools
wget http://localhost:8000/docs
python -c "import requests; print(requests.get('http://localhost:8000/docs').status_code)"
```

## Prevention

### 1. Proper Error Handling
- ✅ Frontend timeout for API calls
- ✅ Fallback data if API fails
- ✅ User-friendly error messages

### 2. Health Checks
- ✅ Backend status monitoring
- ✅ API endpoint testing
- ✅ Database connection validation

### 3. Development Workflow
- ✅ Always check backend status before testing
- ✅ Use foreground mode for debugging
- ✅ Monitor logs for errors
- ✅ Test API endpoints independently

## Quick Fix Commands

```bash
# Complete reset and restart
pkill -f "uvicorn main:app"
sleep 2
cd /path/to/backend
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test immediately
curl "http://localhost:8000/api/v1/wilayah/provinsi"
```
