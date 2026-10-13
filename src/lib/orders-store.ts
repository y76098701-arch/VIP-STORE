import type { OrderTrackingResult } from '@/types';

// In-memory global store to safeguard orders across serverless warm restarts
const globalForOrders = globalThis as unknown as {
  vipOrdersMap: Map<string, OrderTrackingResult> | undefined;
};

export const ordersStore: Map<string, OrderTrackingResult> =
  globalForOrders.vipOrdersMap ?? new Map<string, OrderTrackingResult>();

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
  globalForOrders.vipOrdersMap = ordersStore;
}

export function saveOrderToMemory(order: OrderTrackingResult) {
  if (!order || !order.orderNumber) return;
  ordersStore.set(order.orderNumber.toUpperCase(), order);
  if (order.playerUid) {
    ordersStore.set(`UID_${order.playerUid}`, order);
  }
}

export function getOrderFromMemory(query: string): OrderTrackingResult | null {
  if (!query) return null;
  const q = query.trim().toUpperCase();
  if (ordersStore.has(q)) return ordersStore.get(q)!;
  if (ordersStore.has(`VIP-${q}`)) return ordersStore.get(`VIP-${q}`)!;
  if (ordersStore.has(`UID_${q}`)) return ordersStore.get(`UID_${q}`)!;

  // Search through entries for matching playerUid
  let found: OrderTrackingResult | null = null;
  ordersStore.forEach((entry) => {
    if (!found && (entry.playerUid === query.trim() || entry.orderNumber.toUpperCase() === q)) {
      found = entry;
    }
  });
  return found;
}
