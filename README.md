# Onlyarm OMS

An SQL-first e-commerce order management foundation built with React, Express, TypeScript, and PostgreSQL.

## Included

- JWT registration/login with bcrypt password hashing
- Product catalog with inventory, search, filtering, sorting, and pagination
- Transactional order creation with row-level stock locking and reservation
- PostgreSQL constraints and partial/composite indexes for high-volume queries
- Zod validation and snake_case JSON across the API
- Swagger UI and Docker Compose development stack
- Responsive React/Tailwind operations dashboard

## Quick start with Docker

1. Copy `.env.example` to `.env` and replace `JWT_SECRET` with a secure value of at least 32 characters.
2. Start the stack:

   ```bash
   docker compose up --build
   ```

3. Open:

   - Dashboard: http://localhost:5173
   - Swagger: http://localhost:4000/docs
   - Health check: http://localhost:4000/health

4. Load the demo accounts and optional local product data:

   ```bash
   npm run seed:dev
   ```

5. Choose **Admin** or **Customer** on the sign-in screen. The local demo accounts are
   `admin@onlyarm.test` and `customer@onlyarm.test`; both use `OnlyarmDemo123!`.

The initial SQL migration runs automatically the first time the PostgreSQL volume is created.

## Local development

Requirements: Node.js 22+, npm 10+, and PostgreSQL 16+.

```bash
cp .env.example .env
npm install
npm run dev
```

Apply `database/migrations/001_initial_schema.sql` to the local database before starting the API. The backend checks both its own directory and the repository root for `.env`.

## Commands

```bash
npm run typecheck
npm run lint
npm run build
```

## API overview

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | Register a customer |
| POST | `/api/v1/auth/login` | Public | Issue an access token |
| GET | `/api/v1/products` | Public | Search and paginate products |
| POST | `/api/v1/products` | Admin/staff | Create product and inventory |
| GET | `/api/v1/orders` | Required | List accessible orders |
| POST | `/api/v1/orders` | Required | Create order and reserve stock |

## Database and index choices

- `users_email_active_uq` and `products_sku_active_uq` preserve uniqueness while allowing a soft-deleted value to be reused.
- `products_list_idx (status, created_at DESC)` supports the default product listing; `products_name_search_idx` supports prefix search without a sequential scan.
- `orders_user_list_idx (user_id, created_at DESC)` supports customer order history, while `orders_status_list_idx` supports operations queues.
- `order_items_order_idx` and `order_status_history_order_idx` make order-detail reads independent of total table size.
- Order creation locks only requested inventory rows, validates all stock, inserts the order/items, and reserves quantities in one transaction.

## Deployment

- **Database (Neon):** run the migration and use its pooled connection string as `DATABASE_URL`.
- **Backend (Render):** deploy `backend`, build with `npm ci && npm run build`, start with `npm start`, and set the backend environment variables from `.env.example`.
- **Frontend (Vercel):** deploy `frontend`, use `npm run build`, output `dist`, and set `VITE_API_URL` to the Render API URL ending in `/api/v1`.

For production, set `CORS_ORIGIN` to the exact frontend URL and rotate a cryptographically random `JWT_SECRET`.
