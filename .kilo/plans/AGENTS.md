# Exstream App — Agent Reference

E-commerce app for "Jas Hujan Extrime" (raincoat store). FastAPI backend + React/Vite frontend. Payment via Midtrans (transfer) and Komerce (COD).

## Project Structure

```
backend/   → FastAPI (Python 3.12, SQLAlchemy, Pydantic)
frontend/  → React 19 + Vite 7 + Tailwind CSS 4
```

## Backend (FastAPI)

**Run:** `cd backend && python main.py` (uses uvicorn with reload on port 8000)
**Test:** `cd backend && pytest`
**Env:** `backend/.env` — DATABASE_URL, Midtrans keys, Komerce API keys, JWT secret

### Architecture

Entry: `main.py` → routers → services → models + schemas

- **`main.py`** — App init, CORS (`allow_origins=["*"]`), router includes, `Base.metadata.create_all`
- **`core/config.py`** — Pydantic `Settings` from `.env` (API_PREFIX, DB, Midtrans, Komerce, JWT)
- **`db/database.py`** — SQLAlchemy engine/session/Base, `create_tables()`, `ensure_status_column()` migration
- **`routers/`** — `auth_route`, `order_route` (unified COD+Transfer), `transaksi_route` (legacy), `store_order_route` (legacy COD), `domestic_route` (shipping cost), `wilayah_route` (Indonesian regions)
- **`service/`** — Business logic: `order_service.OrderService.create_order()`, `auth_service` (JWT bcrypt), `payment_gateway_service` (Midtrans Snap), `store_order_service` (Komerce API), `raja_ongkir_service`
- **`models/`** — `order_model` (unified `Order`/`OrderItem`), `transaksi_model` (legacy `Barang`), `store_order_model`, `admin_model`, `wilayah_model` (pre-seeded region tables)
- **`schemas/`** — Pydantic V2 DTOs (`from_attributes = True`, not `orm_mode`)
- **`utils/`** — `auth_middleware` (JWT Bearer guard), phone formatter, location ID helpers

### Key API Endpoints

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/api/v1/auth/login` | POST | No | Returns JWT bearer token |
| `/api/v1/orders/` | POST | No | **Unified** order creation (COD→Komerce, Transfer→Midtrans) |
| `/api/v1/orders/{id}/status` | GET | No | Order status |
| `/api/v1/transaksi/enhanced` | POST | No | Legacy transaction (still used by frontend) |
| `/api/v1/transaksi/callback` | POST | No | Midtrans webhook |
| `/api/v1/store_order/store_order` | POST | No | Legacy COD via Komerce |
| `/api/v1/domestic/domestic-cost` | POST | No | Shipping cost calc |
| `/api/v1/wilayah/provinsi` | GET | No | Province list (filtered: Java+Sumatra+Bali) |

### Database

- MySQL via `pymysql`. URL in `.env`: `mysql+pymysql://root:hasumin@localhost:3306/extrime_db`
- Two order systems: **legacy** `transaksi` table (`Barang` model) and **unified** `orders`/`order_items` tables
- Wilayah tables (`reg_provinces`, `reg_regencies`, `reg_districts`, `reg_villages`) are pre-seeded, read-only
- `ensure_status_column()` in `database.py` runs ALTER TABLE migration on startup for legacy `transaksi` table
- **All models use `Mapped[]` / `mapped_column()` (SQLAlchemy 2.0 style)** except legacy `transaksi_model.py` and `store_order_model.py` which use old `Column()` style

### Auth

- JWT via `python-jose`, bcrypt via `passlib`
- Hardcoded defaults in `config.py`: username `admin`, password `admin123` — **change for production**

## Frontend (React + Vite)

**Run:** `cd frontend && npm run dev`
**Build:** `cd frontend && npm run build`
**Lint:** `cd frontend && npm run lint`
**Deploy:** `frontend/deploy.sh` — builds + SCP to `extrime@145.79.8.52:/var/www/fe_extrime/`

### Architecture

- **`src/main.jsx`** → `App.jsx` (BrowserRouter) → pages + features
- **Routes:** `/` (LandingPage), `/admin/login`, `/admin/dashboard` (ProtectedRoute), `/admin/orders` (ProtectedRoute)
- **`src/services/`** — API clients: `transactionService.js` (1534 lines, main checkout logic), `paymentService.js`, `authService.js`, `storeOrder.js`, `dataWilayah.js`, `hitungCostOngkir.js`
- **`src/hooks/`** — `useCart`, `useShipping`, `useLocationSelector`
- **`src/features/`** — Domain features: `landing/`, `products/`, `testimonials/`, `blog/`, `transactions/`
- **`components/`** — `layout/` (Navbar, Footer), `common/` (ErrorBoundary, ProtectedRoute, form inputs), `order/` (DiscountBanner, VariantSelector, ShippingForm, PaymentSection, OrderSummary)

### Key Details

- **API base URL:** `transactionService.js` uses `https://service.extremestore.my.id` (prod), `authService.js` uses `http://localhost:8000/api/v1` — **inconsistent**, auth won't work in prod against this service
- **Midtrans Snap.js** loaded via `<script>` tag in `index.html` (production client key `Mid-client-S556xu9my6BPr1ig`)
- **Transaction flow:** `TransactionPage.jsx` → `createUnifiedOrder()` → `POST /api/v1/transaksi/enhanced` → if transfer, Midtrans Snap popup → WhatsApp redirect on success; if COD → WhatsApp redirect immediately
- **`transactionService.js`** is the largest file (1534+ lines) with WhatsApp receipt builder, Midtrans payment handlers, and store order formatting all in one file
- **Auth token** stored in `localStorage` as `admin_token`
- **Product constants** in `features/transactions/constants.js`: PRICE=299000, DISCOUNT=54.84%, WEIGHT=1000g

## Gotchas

1. **Dual order systems** — Legacy `transaksi` table (Barang) and unified `orders` table coexist. New code should use `orders`.
2. **Duplicate logic** — `storeOrder.js` and `transactionService.js` both have `parseShippingMethod`, `formatOrderData`, and courier mappers with slightly different implementations.
3. **CORS** — `allow_origins=["*"]` and `allow_credentials=True` together are incompatible per Fetch spec. Some browsers may block this.
4. **CSP** — Backend `main.py` has CSP middleware commented out, but `CSP_SOLUTION.md` documents it. `index.html` has inline styles for snap-container.
5. **Midtrans env mismatch** — `.env` has `MIDTRANS_IS_PRODUCTION = true` but uses `mid-server-` / `mid-client-` prefixed keys (sandbox format). `index.html` loads production Snap.js URL.
6. **Python version** — `.python-version` says `3.12`, project requires `>=3.12`
7. **No typecheck** — Frontend has no TypeScript; no `typecheck` script exists
8. **Admin order page** — `OrderListPage.jsx` is a placeholder ("dalam pengembangan")
