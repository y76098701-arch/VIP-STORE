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
