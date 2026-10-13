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

export function getPaymentMethodLabel(method: string | null | undefined, lang: string = 'ar'): string {
  if (!method) return lang === 'ar' ? 'غير محدد' : 'Not specified';
  switch (method) {
    case 'instapay':
      return lang === 'ar' ? 'إنستاباي (InstaPay)' : 'InstaPay';
    case 'daqan_cash':
      return lang === 'ar' ? 'دكان كاش / دقهلية كاش' : 'DaQan Cash / Dakahlia Cash';
    case 'vodafone_cash':
      return lang === 'ar' ? 'فودافون كاش / المحافظ الإلكترونية' : 'Vodafone Cash / Wallets';
    default:
      return method;
  }
}
