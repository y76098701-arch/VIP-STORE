import prisma from './db';
import type { DiscountInfo } from '@/types';

export async function getDiscountSettings(): Promise<{ firstOrderDiscount: number; regularDiscount: number }> {
  try {
    const settings = await prisma.setting.findMany({ where: { key: { in: ['first_order_discount', 'regular_discount'] } } });
    const first = settings.find(s => s.key === 'first_order_discount');
    const regular = settings.find(s => s.key === 'regular_discount');
    return {
      firstOrderDiscount: first ? parseFloat(first.value) : 50,
      regularDiscount: regular ? parseFloat(regular.value) : 20,
    };
  } catch (error) {
    console.error('Error fetching discount settings:', error);
    return { firstOrderDiscount: 50, regularDiscount: 20 };
  }
}

export async function checkUidEligibility(playerUid: string): Promise<{ hasUsed50Discount: boolean }> {
  try {
    const existing = await prisma.uidDiscount.findUnique({ where: { playerUid } });
    if (existing) {
      return { hasUsed50Discount: true };
    }

    const orderWith50 = await prisma.order.findFirst({
      where: {
        playerUid,
        discountPercent: { gte: 40 },
      },
    });

    return { hasUsed50Discount: !!orderWith50 };
  } catch (error) {
    console.error('Error checking UID eligibility:', error);
    return { hasUsed50Discount: false };
  }
}

export async function calculateDiscount(
  playerUid: string,
  originalPrice: number,
  requestedDiscount?: number
): Promise<DiscountInfo> {
  const { firstOrderDiscount, regularDiscount } = await getDiscountSettings();
  const { hasUsed50Discount } = await checkUidEligibility(playerUid);

  let discountPercent = regularDiscount;
  let isFirstOrder = false;

  if (requestedDiscount === 50) {
    if (!hasUsed50Discount) {
      discountPercent = firstOrderDiscount;
      isFirstOrder = true;
    } else {
      // 50% already used for this UID - enforce 20%
      discountPercent = regularDiscount;
      isFirstOrder = false;
    }
  } else if (requestedDiscount === 20) {
    // Customer explicitly chose 20% permanent discount
    discountPercent = regularDiscount;
    isFirstOrder = false;
  } else {
    // Default fallback based on eligibility
    if (!hasUsed50Discount) {
      discountPercent = firstOrderDiscount;
      isFirstOrder = true;
    } else {
      discountPercent = regularDiscount;
      isFirstOrder = false;
    }
  }

  const discountAmount = Math.round((originalPrice * discountPercent) / 100 * 100) / 100;
  const finalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);

  return { discountPercent, discountAmount, finalPrice, isFirstOrder };
}

export async function markFirstOrderUsed(playerUid: string, orderId: string): Promise<void> {
  try {
    await prisma.uidDiscount.upsert({
      where: { playerUid },
      update: { orderId, usedAt: new Date() },
      create: { playerUid, orderId },
    });
  } catch (error) {
    console.error('Error marking first order discount used:', error);
  }
}
