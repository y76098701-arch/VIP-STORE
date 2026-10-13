import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { saveOrderToMemory } from '@/lib/orders-store';
import type { OrderStatus, OrderTrackingResult } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order } = body;

    if (!order || !order.orderNumber) {
      return NextResponse.json({ error: 'Order data is required' }, { status: 400 });
    }

    // Save to memory cache immediately
    saveOrderToMemory(order as OrderTrackingResult);

    // Also attempt to upsert in Prisma SQLite
    try {
      const existing = await prisma.order.findUnique({
        where: { orderNumber: order.orderNumber },
      });

      if (!existing) {
        // Find or create package
        let pkg = await prisma.diamondPackage.findFirst({
          where: { diamonds: order.diamonds || 100 },
        });

        if (!pkg) {
          pkg = await prisma.diamondPackage.findFirst();
        }

        if (pkg) {
          await prisma.order.create({
            data: {
              orderNumber: order.orderNumber,
              playerUid: order.playerUid || '000000',
              playerName: order.playerName || null,
              packageId: pkg.id,
              originalPrice: order.originalPrice || pkg.price,
              discountPercent: order.discountPercent || 20,
              discountAmount: order.discountAmount || 0,
              finalPrice: order.finalPrice || pkg.price,
              isFirstOrder: order.isFirstOrder || false,
              paymentMethod: order.paymentMethod || 'instapay',
              status: order.status || 'PENDING_PAYMENT',
            },
          });
        }
      }
    } catch (e) {
      console.warn('Could not sync order to local SQLite, retained in memory:', e);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to sync order' }, { status: 500 });
  }
}
