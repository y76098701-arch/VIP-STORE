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
  name?: string | null;
  category?: 'DIAMONDS' | 'MEMBERSHIP' | 'AIRDROP' | string | null;
  badge?: string | null;
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
  packageName?: string | null;
  packageCategory?: string | null;
  packageBadge?: string | null;
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
