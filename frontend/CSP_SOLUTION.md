# Content Security Policy (CSP) Solution for Midtrans

## Problem
Midtrans Snap.js requires `eval()` and inline scripts which are blocked by default CSP policies, causing errors:
- `Content-Security-Policy: The page's settings blocked an inline script (script-src-elem)`
- `Content-Security-Policy: The page's settings blocked a JavaScript eval (script-src)`

## Solution Implemented

### 1. Backend CSP Middleware
Added custom CSP middleware in `backend/main.py` that allows Midtrans domains:

```python
class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' "
            "https://app.sandbox.midtrans.com "
            "https://app.midtrans.com "
            "https://snap-assets.al-pc-id-b.cdn.gtflabs.io "
            "https://api.sandbox.midtrans.com "
            "https://api.midtrans.com "
            "https://pay.google.com "
            "https://js-agent.newrelic.com "
            "https://bam.nr-data.net; "
            # ... other directives
        )
        
        response.headers["Content-Security-Policy"] = csp_policy
        return response
```

### 2. Frontend Payment Handler
Enhanced payment handler with multiple fallback methods:

1. **Direct Redirect** (Most reliable)
   - Opens Midtrans URL in new window/tab
   - Falls back to direct navigation if popup blocked

2. **Snap.js Popup** (If available)
   - Uses `window.snap.pay()` if Snap.js loaded
   - Handles success/error callbacks

3. **Embedded Mode** (Alternative)
   - Uses `window.snap.embed()` for embedded payment

4. **Final Fallback**
   - Direct navigation to Midtrans URL

### 3. Allowed Domains
The CSP policy allows these Midtrans-related domains:
- `https://app.sandbox.midtrans.com` (Sandbox environment)
- `https://app.midtrans.com` (Production environment)
- `https://snap-assets.al-pc-id-b.cdn.gtflabs.io` (Midtrans assets)
- `https://api.sandbox.midtrans.com` (Sandbox API)
- `https://api.midtrans.com` (Production API)
- `https://pay.google.com` (Google Pay integration)
- `https://js-agent.newrelic.com` (New Relic monitoring)
- `https://bam.nr-data.net` (New Relic data)

## Testing

### 1. Restart Backend
```bash
cd backend
python main.py
```

### 2. Test Payment Flow
1. Add product to cart
2. Fill shipping form
3. Select "Transfer Bank, E-Wallet, Virtual Account"
4. Click "Beli Pesanan"
5. Check browser console for CSP errors

### 3. Expected Behavior
- No CSP errors in console
- Payment popup opens successfully
- Multiple fallback methods ensure payment interface always accessible

## Troubleshooting

### If CSP errors persist:
1. **Clear browser cache** - CSP headers are cached
2. **Check backend logs** - Ensure CSP middleware is active
3. **Verify domain whitelist** - Ensure all Midtrans domains are included
4. **Test in incognito mode** - Bypass browser extensions that might interfere

### Alternative Solutions:
1. **Disable CSP temporarily** (for development only)
2. **Use nonce-based CSP** (more secure but complex)
3. **Use hash-based CSP** (requires calculating script hashes)

## Security Notes
- `'unsafe-eval'` and `'unsafe-inline'` are required for Midtrans
- This is acceptable for payment processing as Midtrans is a trusted third-party
- In production, consider using nonce-based CSP for better security
