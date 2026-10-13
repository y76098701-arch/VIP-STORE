# VIP STORE — Professional Free Fire Diamonds Top-Up Platform 💎

A production-ready, high-performance Free Fire diamond top-up web application featuring a gaming aesthetic (black, purple, electric blue, and gold accents), real payment verification, server-side dynamic discount calculation, transfer receipt handling, real top-up provider integration with sandbox and live modes, customer order tracking, and an administrative management dashboard.

---

## 🌟 Key Features

### 1. 🎨 Premium Gaming Aesthetic & Bilingual UI
- **Dark Gaming Theme**: Obsidian backdrop (`#0a0a0f`), vibrant purple (`#7c3aed`), electric blue (`#06b6d4`), and metallic gold (`#f59e0b`).
- **Dynamic Effects**: Animated diamond floating badges, glowing buttons, interactive particle background, and responsive cards.
- **Bilingual Arabic (RTL primary) & English (LTR)**: Instant one-click language toggle across all customer and administrative pages.

### 2. 💰 Advanced Discount Engine (Server-Side Enforced)
- **New Customers (50% OFF)**: First-time Free Fire Player UIDs automatically receive a 50% discount. Validated on the backend against database records to prevent abuse.
- **Returning Customers (20% OFF)**: Regular 20% discount applied automatically on subsequent orders.
- **Tamper-Proof**: Prices, discounts, and final totals are calculated on the server and strictly validated.
- **Admin Configurable**: Discount rates can be adjusted at runtime from the Admin Dashboard.

### 3. 🔍 Free Fire Player UID Verification
- Numeric Free Fire UID validation.
- Live player name lookup integration with authorized Free Fire provider APIs.
- **Honest Verification**: Displays the real in-game name when configured, or transparently indicates that lookup is unavailable without ever displaying fake simulated names.

### 4. 💳 Supported Payment Methods
- **InstaPay**: Dedicated payment screen displaying account name, InstaPay IPA/handle, exact amount, and reference code.
- **DaQan Cash / Dakahlia Cash (دكان كاش / دقهلية كاش)**: Dedicated wallet payment workflow.
- **Mobile Wallets (Vodafone Cash, etc.)**: Direct mobile wallet transfers.
- **Official Transfer Number**: Prominently displayed **`01069954152`** with a one-click copy button.
- **Receipt Image Upload**: Customers upload screenshots of their transfer (supports PNG, JPG, WebP up to 5MB) securely linked to their order.

### 5. ⚡ Real Payment Verification & Provider Dispatch Workflow
1. **Order Placed**: Customer selects diamonds and enters UID (`PENDING_PAYMENT`).
2. **Receipt Uploaded**: Receipt image stored securely, order transitions to `UNDER_REVIEW`.
3. **Payment Verification**: Administrator verifies transaction against actual bank/wallet records and clicks **Approve** (`PAID`) or **Reject** with a reason (`REJECTED`).
4. **Automated / Manual Diamond Delivery**:
   - In **Sandbox Mode**: Executes full provider pipeline, logs a test transaction, and issues a verified provider transaction ID.
   - In **Live Mode**: Submits HTTPS request to the configured authorized top-up provider API (Smile.One, UniPin, Garena Partner), verifies provider response, stores provider transaction ID, and marks as `COMPLETED`.
   - **Idempotency Protection**: Ensures orders cannot be double-charged or delivered twice.

### 6. 📊 Protected Administrator Dashboard
- **Authentication**: Bcrypt-hashed credentials and NextAuth JWT sessions with server-side middleware route guards.
- **Order Management**: Search by UID, Order Number, Payment Reference, or Provider Transaction ID; filter by status; review receipts in full-resolution modal; approve or reject submissions.
- **Top-Up Delivery Execution**: One-click diamond delivery via provider, manual completion, or refund workflow.
- **Package Management**: Add, update prices, toggle active/inactive, or reorder diamond packages.
- **Settings Panel**: Configure payment accounts, transfer phone numbers, discount rates, top-up provider mode (Live / Sandbox), and UID verification endpoints.
- **Live Sales Analytics**: Real-time sales metrics, revenue totals, today's order counts, and order distribution.

### 7. 📍 Customer Order Tracking
- Dedicated tracking page (`/track?orderNumber=VIP-XXXX`).
- Visual step progression bar and timestamped audit timeline.
- Privacy-preserving: exposes no sensitive admin notes or other customer records.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or 20+ LTS
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
cd vip-store
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"

ADMIN_EMAIL="admin@vipstore.com"
ADMIN_PASSWORD="admin123456"

INSTAPAY_NAME="VIP STORE"
INSTAPAY_NUMBER="01069954152"
DAQAN_CASH_NAME="VIP STORE - دكان كاش"
DAQAN_CASH_NUMBER="01069954152"
TRANSFER_PHONE_NUMBER="01069954152"
VODAFONE_CASH_NUMBER="01069954152"

FIRST_ORDER_DISCOUNT="50"
REGULAR_DISCOUNT="20"

TOPUP_PROVIDER_MODE="sandbox"
TOPUP_PROVIDER_NAME="Garena / Smile.One API"
TOPUP_PROVIDER_URL=""
TOPUP_PROVIDER_API_KEY=""
```

### 3. Initialize & Seed Database
```bash
npm run setup
```
This runs:
1. `npx prisma generate` — Generates Prisma Client.
2. `npx prisma db push` — Creates the database schema.
3. `npx tsx prisma/seed.ts` — Seeds default packages, store settings, and administrator account.

### 4. Run the Application
Development server:
```bash
npm run dev
```
Production build:
```bash
npm run build
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Default Admin Access

- **Login URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email**: `admin@vipstore.com`
- **Password**: `admin123456`

*(You can change admin credentials and email directly from the database or environment variables).*

---

## 🛠 Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Compile optimized production build |
| `npm run start` | Run production Next.js server |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed initial packages, settings, and admin |
| `npm run setup` | Full database initialization pipeline |
| `npm run lint` | Check linting and formatting |

---

## 🌐 Production Deployment

### Option A: Node.js VPS / Ubuntu
1. Install Node.js 20 LTS and Git.
2. Clone repository and run `npm install`.
3. Set production `NEXTAUTH_SECRET` and `NEXTAUTH_URL="https://yourdomain.com"`.
4. Run `npm run setup` and `npm run build`.
5. Use **PM2** to manage the process:
   ```bash
   npm install -g pm2
   pm2 start npm --name "vip-store" -- start
   pm2 save
   ```
6. Configure Nginx reverse proxy with SSL (Let's Encrypt Certbot) forwarding to `http://localhost:3000`.

### Option B: Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

### Option C: Vercel / Supabase (PostgreSQL)
1. In `prisma/schema.prisma`, update provider to `postgresql`.
2. Connect Supabase or Neon PostgreSQL via `DATABASE_URL`.
3. Deploy directly to Vercel and set environment variables in project settings.

---

## 📜 License & Compliance
This software is built for authorized digital goods top-up services and complies with data integrity, server-side validation, and secure authentication protocols.
