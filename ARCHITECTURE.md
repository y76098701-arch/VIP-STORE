# VIP STORE — Architecture Reference

Project Root: `C:\Users\Administrator\.gemini\antigravity\scratch\vip-store`

## Tech Stack
- Next.js 14.2 (App Router) + TypeScript
- Tailwind CSS 3.4
- Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- NextAuth.js 4 (credentials provider, JWT)
- framer-motion 11 for animations
- lucide-react for icons
- bcryptjs, nanoid, zod, clsx, tailwind-merge

## Directory Structure
```
vip-store/
├── .env.example
├── .env
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/
└── src/
    ├── middleware.ts
    ├── types/
    │   └── index.ts
    ├── lib/
    │   ├── db.ts
    │   ├── auth.ts
    │   ├── discount.ts
    │   ├── topup-provider.ts
    │   ├── utils.ts
    │   └── i18n.ts
    ├── contexts/
    │   └── LanguageContext.tsx
    ├── hooks/
    │   ├── useLanguage.ts
    │   └── useToast.ts
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   ├── page.tsx                    ← Homepage
    │   ├── topup/
    │   │   └── page.tsx
    │   ├── checkout/
    │   │   └── page.tsx
    │   ├── track/
    │   │   └── page.tsx
    │   ├── admin/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx                ← Admin dashboard
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── orders/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       └── page.tsx
    │   │   ├── packages/
    │   │   │   └── page.tsx
    │   │   └── settings/
    │   │       └── page.tsx
    │   └── api/
    │       ├── auth/
    │       │   └── [...nextauth]/
    │       │       └── route.ts
    │       ├── packages/
    │       │   └── route.ts
    │       ├── verify-uid/
    │       │   └── route.ts
    │       ├── orders/
    │       │   └── route.ts
    │       ├── upload-receipt/
    │       │   └── route.ts
    │       ├── track/
    │       │   └── route.ts
    │       └── admin/
    │           ├── orders/
    │           │   ├── route.ts
    │           │   └── [id]/
    │           │       ├── route.ts
    │           │       ├── verify/
    │           │       │   └── route.ts
    │           │       └── deliver/
    │           │           └── route.ts
    │           ├── packages/
    │           │   ├── route.ts
    │           │   └── [id]/
    │           │       └── route.ts
    │           ├── settings/
    │           │   └── route.ts
    │           └── stats/
    │               └── route.ts
    └── components/
        ├── ui/
        │   ├── Button.tsx
        │   ├── Input.tsx
        │   ├── Card.tsx
        │   ├── Badge.tsx
        │   ├── Modal.tsx
        │   ├── Toast.tsx
        │   ├── FileUpload.tsx
        │   ├── LoadingSpinner.tsx
        │   └── CopyButton.tsx
        ├── layout/
        │   ├── Navbar.tsx
        │   ├── Footer.tsx
        │   └── LanguageSwitcher.tsx
        ├── home/
        │   ├── HeroSection.tsx
        │   ├── PackagesPreview.tsx
        │   ├── FeaturesSection.tsx
        │   └── ParticleBackground.tsx
        └── admin/
            ├── Sidebar.tsx
            ├── OrdersTable.tsx
            ├── StatsCards.tsx
            ├── ReceiptViewer.tsx
            └── PackageForm.tsx
```

---

## FOUNDATIONAL FILE CONTENTS

### package.json
```json
{
  "name": "vip-store",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "npx tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "setup": "npm run db:generate && npm run db:push && npm run db:seed"
  },
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.1.1",
    "framer-motion": "^11.11.0",
    "lucide-react": "^0.454.0",
    "nanoid": "^5.0.8",
    "next": "14.2.15",
    "next-auth": "^4.24.8",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.4",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.17.0",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "prisma": "^5.20.0",
    "tailwindcss": "^3.4.14",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

### postcss.config.mjs
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
```

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vip: {
          bg: '#0a0a0f',
          card: '#13131a',
          'card-hover': '#1a1a25',
          border: '#1e1e2e',
          'border-light': '#2a2a3e',
          purple: { DEFAULT: '#7c3aed', light: '#a855f7', dark: '#6d28d9', glow: 'rgba(124,58,237,0.3)' },
          blue: { DEFAULT: '#3b82f6', light: '#60a5fa', dark: '#2563eb', glow: 'rgba(59,130,246,0.3)' },
          cyan: { DEFAULT: '#06b6d4', light: '#22d3ee' },
          gold: { DEFAULT: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
          text: { primary: '#f5f5f5', secondary: '#a0a0b0', muted: '#6b6b80' },
          success: '#22c55e',
          error: '#ef4444',
          warning: '#f59e0b',
        },
      },
      fontFamily: { arabic: ['Tajawal', 'sans-serif'] },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': { '0%,100%': { boxShadow: '0 0 20px rgba(124,58,237,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(124,58,237,0.6)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-down': { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
export default config;
```

### .env.example
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="change-me-in-production-use-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@vipstore.com"
ADMIN_PASSWORD="admin123456"
INSTAPAY_NAME="VIP STORE"
INSTAPAY_NUMBER="01069954152"
VODAFONE_CASH_NUMBER="01069954152"
TOPUP_PROVIDER_URL=""
TOPUP_PROVIDER_API_KEY=""
UID_VERIFICATION_ENABLED="false"
UID_VERIFICATION_API_URL=""
UID_VERIFICATION_API_KEY=""
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE_MB="5"
```

### .env (same as .env.example for dev)
Same content as .env.example.

### .gitignore
```
node_modules/
.next/
out/
*.tsbuildinfo
next-env.d.ts
.env
.env.local
prisma/dev.db
prisma/dev.db-journal
public/uploads/*
!public/uploads/.gitkeep
```

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model DiamondPackage {
  id        String   @id @default(cuid())
  diamonds  Int
  price     Float
  currency  String   @default("EGP")
  isActive  Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}

model Order {
  id              String          @id @default(cuid())
  orderNumber     String          @unique
  playerUid       String
  playerName      String?
  packageId       String
  package         DiamondPackage  @relation(fields: [packageId], references: [id])
  originalPrice   Float
  discountPercent Float           @default(0)
  discountAmount  Float           @default(0)
  finalPrice      Float
  isFirstOrder    Boolean         @default(false)
  paymentMethod   String?
  paymentRef      String?
  receiptUrl      String?
  status          String          @default("PENDING_PAYMENT")
  providerTxId    String?
  adminNotes      String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  statusHistory   StatusHistory[]
}

model StatusHistory {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  status    String
  note      String?
  createdAt DateTime @default(now())
}

model UidDiscount {
  id        String   @id @default(cuid())
  playerUid String   @unique
  orderId   String
  usedAt    DateTime @default(now())
}

model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String
}
```

### prisma/seed.ts
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123456', 12);
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@vipstore.com' },
    update: {},
    create: { email: process.env.ADMIN_EMAIL || 'admin@vipstore.com', password: hashedPassword, name: 'Admin', role: 'admin' },
  });

  const packages = [
    { diamonds: 100, price: 25, sortOrder: 1 },
    { diamonds: 310, price: 75, sortOrder: 2 },
    { diamonds: 520, price: 125, sortOrder: 3 },
    { diamonds: 1060, price: 250, sortOrder: 4 },
    { diamonds: 2180, price: 500, sortOrder: 5 },
    { diamonds: 5600, price: 1250, sortOrder: 6 },
  ];
  for (const pkg of packages) {
    const existing = await prisma.diamondPackage.findFirst({ where: { diamonds: pkg.diamonds } });
    if (!existing) await prisma.diamondPackage.create({ data: pkg });
  }

  const defaults: Record<string, string> = {
    instapay_name: 'VIP STORE',
    instapay_number: '01069954152',
    vodafone_cash_number: '01069954152',
    first_order_discount: '50',
    regular_discount: '20',
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log('Database seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

### src/types/index.ts
```typescript
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'UNDER_REVIEW'
  | 'PAID'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'REFUNDED';

export type PaymentMethod = 'instapay' | 'vodafone_cash';
export type Language = 'ar' | 'en';

export interface DiamondPackage {
  id: string;
  diamonds: number;
  price: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  playerUid: string;
  playerName: string | null;
  packageId: string;
  package?: DiamondPackage;
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  isFirstOrder: boolean;
  paymentMethod: string | null;
  paymentRef: string | null;
  receiptUrl: string | null;
  status: OrderStatus;
  providerTxId: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory?: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface OrderTrackingResult {
  orderNumber: string;
  playerUid: string;
  playerName: string | null;
  diamonds: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  status: OrderStatus;
  paymentMethod: string | null;
  createdAt: string;
  statusHistory: StatusHistoryEntry[];
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface DiscountInfo {
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  isFirstOrder: boolean;
}
```

### src/lib/db.ts
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
```

### src/lib/auth.ts
```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const admin = await prisma.admin.findUnique({ where: { email: credentials.email } });
        if (!admin) return null;
        const valid = await bcrypt.compare(credentials.password, admin.password);
        if (!valid) return null;
        return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).role = token.role; (session.user as any).id = token.id; }
      return session;
    },
  },
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### src/lib/discount.ts
```typescript
import prisma from './db';
import type { DiscountInfo } from '@/types';

export async function getDiscountSettings(): Promise<{ firstOrderDiscount: number; regularDiscount: number }> {
  const settings = await prisma.setting.findMany({ where: { key: { in: ['first_order_discount', 'regular_discount'] } } });
  const first = settings.find(s => s.key === 'first_order_discount');
  const regular = settings.find(s => s.key === 'regular_discount');
  return {
    firstOrderDiscount: first ? parseFloat(first.value) : 50,
    regularDiscount: regular ? parseFloat(regular.value) : 20,
  };
}

export async function calculateDiscount(playerUid: string, originalPrice: number): Promise<DiscountInfo> {
  const { firstOrderDiscount, regularDiscount } = await getDiscountSettings();
  const existing = await prisma.uidDiscount.findUnique({ where: { playerUid } });
  const isFirstOrder = !existing;
  const discountPercent = isFirstOrder ? firstOrderDiscount : regularDiscount;
  const discountAmount = Math.round((originalPrice * discountPercent) / 100 * 100) / 100;
  const finalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);
  return { discountPercent, discountAmount, finalPrice, isFirstOrder };
}

export async function markFirstOrderUsed(playerUid: string, orderId: string): Promise<void> {
  await prisma.uidDiscount.upsert({ where: { playerUid }, update: {}, create: { playerUid, orderId } });
}
```

### src/lib/topup-provider.ts
```typescript
export interface TopupRequest { playerUid: string; diamonds: number; orderId: string; }
export interface TopupResponse { success: boolean; transactionId?: string; error?: string; }

export async function isProviderConfigured(): Promise<boolean> {
  const url = process.env.TOPUP_PROVIDER_URL;
  const key = process.env.TOPUP_PROVIDER_API_KEY;
  return !!(url && key && url.length > 0 && key.length > 0);
}

export async function submitTopup(request: TopupRequest): Promise<TopupResponse> {
  if (!(await isProviderConfigured())) {
    return { success: false, error: 'Top-up provider not configured. Set TOPUP_PROVIDER_URL and TOPUP_PROVIDER_API_KEY.' };
  }
  try {
    const res = await fetch(process.env.TOPUP_PROVIDER_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.TOPUP_PROVIDER_API_KEY}` },
      body: JSON.stringify({ player_id: request.playerUid, diamonds: request.diamonds, reference: request.orderId }),
    });
    if (!res.ok) return { success: false, error: `Provider returned ${res.status}` };
    const data = await res.json();
    return { success: true, transactionId: data.transaction_id || data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function verifyPlayerUid(uid: string): Promise<{ valid: boolean; playerName?: string; error?: string }> {
  if (process.env.UID_VERIFICATION_ENABLED !== 'true' || !process.env.UID_VERIFICATION_API_URL) {
    return { valid: false, error: 'خدمة التحقق من الـ ID غير متاحة حالياً. يرجى إدخال الـ UID والمتابعة.' };
  }
  try {
    const res = await fetch(`${process.env.UID_VERIFICATION_API_URL}?uid=${uid}`, {
      headers: { Authorization: `Bearer ${process.env.UID_VERIFICATION_API_KEY || ''}` },
    });
    if (!res.ok) return { valid: false, error: 'فشل التحقق من الـ ID' };
    const data = await res.json();
    return { valid: true, playerName: data.name || data.player_name || data.nickname };
  } catch {
    return { valid: false, error: 'خدمة التحقق غير متاحة' };
  }
}
```

### src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const genOrderId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
export function generateOrderNumber(): string { return `VIP-${genOrderId()}`; }

const genPayRef = customAlphabet('0123456789', 12);
export function generatePaymentRef(): string { return genPayRef(); }

export function formatPrice(price: number): string { return `${price.toFixed(2)} ج.م`; }
export function formatPriceEn(price: number): string { return `EGP ${price.toFixed(2)}`; }

export function formatDate(date: Date | string, lang: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const ORDER_STATUSES = {
  PENDING_PAYMENT: { ar: 'في انتظار الدفع', en: 'Pending Payment', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  UNDER_REVIEW: { ar: 'قيد المراجعة', en: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  PAID: { ar: 'تم الدفع', en: 'Paid', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  PROCESSING: { ar: 'جاري التنفيذ', en: 'Processing', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
  COMPLETED: { ar: 'مكتمل', en: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
  REJECTED: { ar: 'مرفوض', en: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  REFUNDED: { ar: 'مسترد', en: 'Refunded', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUSES;
export function getStatusLabel(status: string, lang: string = 'ar'): string {
  const s = ORDER_STATUSES[status as OrderStatusKey];
  return s ? (lang === 'ar' ? s.ar : s.en) : status;
}
export function getStatusStyle(status: string): string {
  const s = ORDER_STATUSES[status as OrderStatusKey];
  return s ? s.bg : 'bg-gray-400/10 border-gray-400/30';
}
export function getStatusColor(status: string): string {
  const s = ORDER_STATUSES[status as OrderStatusKey];
  return s ? s.color : 'text-gray-400';
}
```

### src/lib/i18n.ts
```typescript
export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    siteName: 'VIP STORE',
    heroTitle: 'اشحن جواهر فري فاير بأفضل الأسعار!',
    heroSubtitle: 'خصومات مميزة، دفع آمن، ومتابعة لطلبك خطوة بخطوة.',
    topupNow: 'اشحن دلوقتي',
    trackOrder: 'تتبع طلبك',
    home: 'الرئيسية',
    topup: 'الشحن',
    tracking: 'تتبع الطلب',
    diamonds: 'جوهرة',
    price: 'السعر',
    originalPrice: 'السعر الأصلي',
    discount: 'الخصم',
    finalPrice: 'السعر النهائي',
    verifyId: 'تحقق من الـ ID',
    playerUid: 'معرف اللاعب (UID)',
    playerName: 'اسم اللاعب',
    enterUid: 'أدخل معرف اللاعب',
    selectPackage: 'اختر باقة الجواهر',
    checkout: 'إتمام الطلب',
    paymentMethod: 'طريقة الدفع',
    instapay: 'إنستاباي (InstaPay)',
    vodafoneCash: 'فودافون كاش / كاش',
    transferTo: 'حوّل إلى الرقم',
    recipientName: 'اسم المستلم',
    amount: 'المبلغ المطلوب',
    uploadReceipt: 'ارفع إيصال التحويل',
    uploadReceiptDesc: 'ارفع صورة أو لقطة شاشة لإيصال التحويل',
    submit: 'إرسال',
    orderNumber: 'رقم الطلب',
    orderStatus: 'حالة الطلب',
    orderDetails: 'تفاصيل الطلب',
    orderDate: 'تاريخ الطلب',
    paymentStatus: 'حالة الدفع',
    deliveryStatus: 'حالة التسليم',
    statusTimeline: 'سجل الحالات',
    firstOrderDiscount: 'خصم الطلب الأول (50%)',
    regularDiscount: 'خصم عادي (20%)',
    copyNumber: 'نسخ الرقم',
    copied: 'تم النسخ!',
    invalidUid: 'معرف اللاعب غير صالح',
    verificationUnavailable: 'خدمة التحقق غير متاحة حالياً',
    orderPlaced: 'تم تسجيل طلبك بنجاح!',
    receiptUploaded: 'تم رفع الإيصال. طلبك قيد المراجعة.',
    trackingTitle: 'تتبع طلبك',
    enterOrderNumber: 'أدخل رقم الطلب',
    search: 'بحث',
    orderNotFound: 'لم يتم العثور على الطلب',
    paymentDetails: 'تفاصيل الدفع',
    paymentRef: 'مرجع الدفع',
    choosePayment: 'اختر طريقة الدفع',
    continueToPayment: 'متابعة للدفع',
    backToPackages: 'العودة للباقات',
    proceedToUpload: 'رفع إيصال الدفع',
    orderSummary: 'ملخص الطلب',
    awaitingVerification: 'في انتظار التحقق من الدفع',
    features: 'لماذا VIP STORE؟',
    securePayment: 'دفع آمن',
    securePaymentDesc: 'نستخدم أحدث تقنيات الأمان لحماية معاملاتك',
    fastDelivery: 'توصيل فوري',
    fastDeliveryDesc: 'استلم جواهرك فور التحقق من الدفع',
    bestPrices: 'أفضل الأسعار',
    bestPricesDesc: 'خصومات حصرية وأسعار تنافسية',
    support: 'دعم متواصل',
    supportDesc: 'فريقنا متواجد لمساعدتك في أي وقت',
    featuredPackages: 'باقات الجواهر',
    allRightsReserved: '© 2024 VIP STORE. جميع الحقوق محفوظة.',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
    back: 'رجوع',
    next: 'التالي',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    save: 'حفظ',
    close: 'إغلاق',
    yes: 'نعم',
    no: 'لا',
    noPackages: 'لا توجد باقات متاحة حالياً',
    step: 'خطوة',
    of: 'من',
    requiredField: 'هذا الحقل مطلوب',
    invalidFile: 'نوع الملف غير مدعوم',
    fileTooLarge: 'حجم الملف كبير جداً',
    providerNotConfigured: 'خدمة الشحن غير مهيأة بعد',
  },
  en: {
    siteName: 'VIP STORE',
    heroTitle: 'Top Up Free Fire Diamonds at the Best Prices!',
    heroSubtitle: 'Great discounts, secure payment, and step-by-step order tracking.',
    topupNow: 'Top Up Now',
    trackOrder: 'Track Order',
    home: 'Home',
    topup: 'Top Up',
    tracking: 'Track Order',
    diamonds: 'Diamonds',
    price: 'Price',
    originalPrice: 'Original Price',
    discount: 'Discount',
    finalPrice: 'Final Price',
    verifyId: 'Verify ID',
    playerUid: 'Player UID',
    playerName: 'Player Name',
    enterUid: 'Enter Player UID',
    selectPackage: 'Select Diamond Package',
    checkout: 'Checkout',
    paymentMethod: 'Payment Method',
    instapay: 'InstaPay',
    vodafoneCash: 'Vodafone Cash / Cash',
    transferTo: 'Transfer to',
    recipientName: 'Recipient Name',
    amount: 'Amount Due',
    uploadReceipt: 'Upload Transfer Receipt',
    uploadReceiptDesc: 'Upload a photo or screenshot of your transfer receipt',
    submit: 'Submit',
    orderNumber: 'Order Number',
    orderStatus: 'Order Status',
    orderDetails: 'Order Details',
    orderDate: 'Order Date',
    paymentStatus: 'Payment Status',
    deliveryStatus: 'Delivery Status',
    statusTimeline: 'Status Timeline',
    firstOrderDiscount: 'First Order Discount (50%)',
    regularDiscount: 'Regular Discount (20%)',
    copyNumber: 'Copy Number',
    copied: 'Copied!',
    invalidUid: 'Invalid Player UID',
    verificationUnavailable: 'Verification service unavailable',
    orderPlaced: 'Your order has been placed successfully!',
    receiptUploaded: 'Receipt uploaded. Your order is under review.',
    trackingTitle: 'Track Your Order',
    enterOrderNumber: 'Enter Order Number',
    search: 'Search',
    orderNotFound: 'Order not found',
    paymentDetails: 'Payment Details',
    paymentRef: 'Payment Reference',
    choosePayment: 'Choose Payment Method',
    continueToPayment: 'Continue to Payment',
    backToPackages: 'Back to Packages',
    proceedToUpload: 'Upload Payment Receipt',
    orderSummary: 'Order Summary',
    awaitingVerification: 'Awaiting payment verification',
    features: 'Why VIP STORE?',
    securePayment: 'Secure Payment',
    securePaymentDesc: 'We use the latest security to protect your transactions',
    fastDelivery: 'Instant Delivery',
    fastDeliveryDesc: 'Receive your diamonds right after payment verification',
    bestPrices: 'Best Prices',
    bestPricesDesc: 'Exclusive discounts and competitive prices',
    support: 'Always Available',
    supportDesc: 'Our team is available to help you anytime',
    featuredPackages: 'Diamond Packages',
    allRightsReserved: '© 2024 VIP STORE. All rights reserved.',
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    noPackages: 'No packages available',
    step: 'Step',
    of: 'of',
    requiredField: 'This field is required',
    invalidFile: 'Unsupported file type',
    fileTooLarge: 'File is too large',
    providerNotConfigured: 'Top-up service not yet configured',
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;
```

### src/contexts/LanguageContext.tsx
```tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('vip-lang') as Language;
    if (saved === 'ar' || saved === 'en') setLanguageState(saved);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vip-lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => translations[language][key] || key;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguageContext must be used within LanguageProvider');
  return ctx;
}
```

### src/hooks/useLanguage.ts
```typescript
export { useLanguageContext as useLanguage } from '@/contexts/LanguageContext';
```

### src/hooks/useToast.ts
```typescript
'use client';
import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast { id: string; message: string; type: ToastType; }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);
  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, addToast, removeToast };
}
```

### src/middleware.ts
```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
        return !!token && (token as any).role === 'admin';
      }
      if (req.nextUrl.pathname.startsWith('/api/admin')) {
        return !!token && (token as any).role === 'admin';
      }
      return true;
    },
  },
});

export const config = { matcher: ['/admin/((?!login).*)','  /api/admin/:path*'] };
```

### src/app/globals.css
```css
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

html { scroll-behavior: smooth; }
body { font-family: 'Tajawal', sans-serif; background: #0a0a0f; color: #f5f5f5; overflow-x: hidden; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #3a3a5e; }
::selection { background: rgba(124,58,237,0.3); }

@layer utilities {
  .neon-border { border: 1px solid rgba(124,58,237,0.3); box-shadow: 0 0 15px rgba(124,58,237,0.1), inset 0 0 15px rgba(124,58,237,0.05); }
  .neon-border-blue { border: 1px solid rgba(59,130,246,0.3); box-shadow: 0 0 15px rgba(59,130,246,0.1); }
  .neon-border-gold { border: 1px solid rgba(245,158,11,0.3); box-shadow: 0 0 15px rgba(245,158,11,0.1); }
  .neon-glow { box-shadow: 0 0 20px rgba(124,58,237,0.4), 0 0 40px rgba(124,58,237,0.2); }
  .neon-text { text-shadow: 0 0 10px rgba(124,58,237,0.5), 0 0 20px rgba(124,58,237,0.3); }
  .neon-text-gold { text-shadow: 0 0 10px rgba(245,158,11,0.5), 0 0 20px rgba(245,158,11,0.3); }
  .glass { background: rgba(19,19,26,0.8); backdrop-filter: blur(12px); }
  .text-gradient { background: linear-gradient(135deg, #a855f7, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .text-gradient-gold { background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
}
```

### src/app/providers.tsx
```tsx
'use client';
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/contexts/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  );
}
```

### src/app/layout.tsx
```tsx
import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'VIP STORE | شحن جواهر فري فاير',
  description: 'اشحن جواهر فري فاير بأفضل الأسعار! خصومات مميزة، دفع آمن، ومتابعة لطلبك خطوة بخطوة.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-vip-bg text-vip-text-primary font-arabic antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## API ROUTE SPECIFICATIONS

All API routes are in `src/app/api/`. Use `NextResponse.json()` for responses. Validate input with Zod. Return proper HTTP status codes.

### GET /api/packages
Returns active diamond packages ordered by sortOrder. Response: `{ packages: DiamondPackage[] }`

### POST /api/verify-uid
Body: `{ uid: string }`
Calls `verifyPlayerUid(uid)` from topup-provider. Returns `{ valid, playerName?, error? }`.

### POST /api/orders
Body: `{ playerUid: string, playerName?: string, packageId: string, paymentMethod: 'instapay' | 'vodafone_cash' }`
1. Look up package, validate it's active.
2. Call `calculateDiscount(playerUid, package.price)`.
3. Generate order number and payment ref.
4. Create order in DB with status PENDING_PAYMENT.
5. Create initial StatusHistory entry.
6. If isFirstOrder, call `markFirstOrderUsed`.
7. Return `{ order: Order, paymentRef }`.

### POST /api/upload-receipt
Multipart form: `orderNumber`, `receipt` (file).
1. Find order by orderNumber.
2. Validate file (image, max 5MB).
3. Save file to `public/uploads/` with unique name.
4. Update order: receiptUrl, status = UNDER_REVIEW.
5. Add StatusHistory entry.
6. Return `{ success: true, message }`.

### GET /api/track?orderNumber=XXX
Find order by orderNumber. Return sanitized OrderTrackingResult (no receipt URL, no admin notes).

### GET /api/admin/orders?status=X&search=X&page=X
List orders with filters, pagination. Include package details and status history.

### GET /api/admin/orders/[id]
Full order details including receipt URL.

### POST /api/admin/orders/[id]/verify
Body: `{ action: 'approve' | 'reject', notes?: string }`
- approve: status → PAID, add history
- reject: status → REJECTED, add history

### POST /api/admin/orders/[id]/deliver
Calls `submitTopup()` if provider is configured. Updates status to PROCESSING then COMPLETED or keeps as PAID with error note if provider fails.

### GET /api/admin/packages
All packages (including inactive).

### POST /api/admin/packages
Create new package. Body: `{ diamonds, price, currency?, sortOrder? }`

### PUT /api/admin/packages/[id]
Update package. Body: partial DiamondPackage fields.

### DELETE /api/admin/packages/[id]
Soft-deactivate package (set isActive=false).

### GET /api/admin/settings
Return all settings as key-value pairs.

### PUT /api/admin/settings
Body: `{ settings: { key: string, value: string }[] }`
Upsert each setting.

### GET /api/admin/stats
Return AdminStats: totalOrders, pendingOrders, completedOrders, rejectedOrders, totalRevenue, todayOrders, todayRevenue.

### GET /api/auth/[...nextauth]
NextAuth handler. Use `authOptions` from `@/lib/auth`.

---

## COMPONENT SPECIFICATIONS

### Design System
- All components use dark theme: bg-vip-card, border-vip-border, text-vip-text-primary/secondary
- Buttons: gradient bg from purple to blue, hover glow effect, rounded-lg
- Cards: bg-vip-card, rounded-xl, neon-border, hover:border-vip-purple/50 transition
- Inputs: bg-vip-bg, border-vip-border, focus:border-vip-purple, rounded-lg
- Arabic RTL is default, use `useLanguageContext()` for direction-aware styling

### UI Components (src/components/ui/)

**Button.tsx**: Variants: primary (gradient purple→blue), secondary (outline), danger (red), ghost. Sizes: sm, md, lg. Props: variant, size, loading, disabled, children, className, onClick, type.

**Input.tsx**: Styled input with label. Props: label, error, className, and all HTMLInputElement props. RTL-aware.

**Card.tsx**: Container with neon-border effect. Props: children, className, hover (boolean for hover effect).

**Badge.tsx**: Status badges with colored backgrounds. Props: status (OrderStatusKey), lang. Uses getStatusStyle/getStatusLabel.

**Modal.tsx**: Overlay modal. Props: isOpen, onClose, title, children. Animate with framer-motion.

**Toast.tsx**: Renders toast notifications. Props: toasts, onRemove. Position: bottom-left (RTL: bottom-right). Color by type (success=green, error=red, etc.).

**FileUpload.tsx**: Drag & drop file upload area. Props: onFileSelect, accept, maxSizeMB, preview. Shows image preview.

**LoadingSpinner.tsx**: Animated spinner with optional text. Props: size (sm/md/lg), text.

**CopyButton.tsx**: Button that copies text to clipboard with "copied!" feedback. Props: text, label.

### Layout Components (src/components/layout/)

**Navbar.tsx**: Fixed top nav with glass effect. Logo "VIP STORE" on right (RTL), nav links (Home, Top Up, Track), LanguageSwitcher on left. Mobile hamburger menu. Active link highlighting.

**Footer.tsx**: Dark footer with copyright, links. Centered.

**LanguageSwitcher.tsx**: Toggle button AR/EN. Uses useLanguageContext.

### Home Components (src/components/home/)

**HeroSection.tsx**: Full-width hero with gradient background. Diamond icon animations (floating). Title, subtitle, CTA buttons. Uses framer-motion for entrance animations.

**PackagesPreview.tsx**: Grid of diamond packages with prices. Fetches from /api/packages. Shows discount badge. "اشحن" button on each card.

**FeaturesSection.tsx**: 4-column grid of features: Secure Payment, Fast Delivery, Best Prices, Support. Each with icon and description.

**ParticleBackground.tsx**: Canvas-based particle effect or CSS-only floating dots. Purple/blue glowing particles. Performance-friendly.

### Admin Components (src/components/admin/)

**Sidebar.tsx**: Vertical sidebar with links: Dashboard, Orders, Packages, Settings. Active state. Logo at top. Collapsible on mobile.

**OrdersTable.tsx**: Sortable/filterable table of orders. Props: orders[], onView. Columns: orderNumber, playerUid, diamonds, finalPrice, status, date, actions.

**StatsCards.tsx**: Grid of stat cards. Props: stats (AdminStats). Each card has icon, label, value with colored accent.

**ReceiptViewer.tsx**: Modal to view uploaded receipt image. Props: url, isOpen, onClose.

**PackageForm.tsx**: Form to create/edit diamond package. Props: package? (for edit), onSubmit, onCancel.

---

## PAGE SPECIFICATIONS

### Homepage (src/app/page.tsx)
- Navbar
- ParticleBackground (behind hero)
- HeroSection
- PackagesPreview
- FeaturesSection
- Footer

### Top Up Page (src/app/topup/page.tsx)
Multi-step form:
1. Enter UID → verify button → show player name or error
2. Select diamond package → show price with discount calculation (fetch discount from API or calculate client-side display)
3. Review order summary
4. Confirm → POST /api/orders → redirect to checkout

### Checkout Page (src/app/checkout/page.tsx)
Receives order data via URL search params (orderNumber).
Steps:
1. Show payment method selection (InstaPay or Vodafone Cash)
2. Show payment details: number to transfer to, amount, payment ref
3. Upload receipt: file upload component
4. Submit: POST /api/upload-receipt
5. Show confirmation: order number, status, "track your order" link

### Track Page (src/app/track/page.tsx)
- Input for order number
- Search button
- Displays: order details, status badge, status timeline with timestamps
- Clean, card-based layout

### Admin Login (src/app/admin/login/page.tsx)
- Centered login form with email/password
- Uses signIn from next-auth/react
- Redirects to /admin on success
- Gaming-themed but clean

### Admin Dashboard (src/app/admin/page.tsx)
- StatsCards at top
- Recent orders table (last 10)
- Quick action buttons

### Admin Orders (src/app/admin/orders/page.tsx)
- Full orders table with filters (status, search)
- Pagination
- Click to view order detail

### Admin Order Detail (src/app/admin/orders/[id]/page.tsx)
- Full order info
- Receipt viewer
- Action buttons: Approve/Reject payment, Deliver diamonds
- Status history timeline
- Admin notes field

### Admin Packages (src/app/admin/packages/page.tsx)
- List of all packages with edit/deactivate
- Add new package form/modal
- Toggle active/inactive

### Admin Settings (src/app/admin/settings/page.tsx)
- Payment settings: InstaPay name, number; Vodafone Cash number
- Discount settings: first order %, regular %
- Provider settings: URL, API key (masked)
- Save button

---

## IMPORTANT CONVENTIONS
1. All `'use client'` components must have the directive as the FIRST line.
2. Use `@/` path alias for all imports.
3. Use `cn()` from `@/lib/utils` for conditional classes.
4. Use `useLanguageContext()` from `@/contexts/LanguageContext` for translations.
5. All prices in EGP. Use `formatPrice()` for display.
6. All dates use `formatDate()`.
7. Error handling: try/catch in API routes, return proper status codes.
8. File uploads: save to `public/uploads/` with uuid-based filenames.
9. Admin routes are protected by middleware (NextAuth).
10. Never expose receipt URLs or admin notes in public API responses.
