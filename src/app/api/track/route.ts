import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrderFromMemory } from '@/lib/orders-store';
import type { OrderTrackingResult, OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('orderNumber') || searchParams.get('query');

    if (!rawQuery || !rawQuery.trim()) {
      return NextResponse.json(
        { error: 'Order number query parameter is required' },
        { status: 400 }
      );
    }

    const query = rawQuery.trim();
    const upperQuery = query.toUpperCase();

    // 1. Try exact orderNumber
    let order = await prisma.order.findUnique({
      where: { orderNumber: query },
      include: {
        package: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // 2. Try uppercase orderNumber
    if (!order && query !== upperQuery) {
      order = await prisma.order.findUnique({
        where: { orderNumber: upperQuery },
        include: {
          package: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    // 3. Try with 'VIP-' prefix if omitted
    if (!order && !upperQuery.startsWith('VIP-')) {
      order = await prisma.order.findUnique({
        where: { orderNumber: `VIP-${upperQuery}` },
        include: {
          package: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    // 4. Try searching by Player UID (find latest order for this player)
    if (!order) {
      order = await prisma.order.findFirst({
        where: { playerUid: query },
        orderBy: { createdAt: 'desc' },
        include: {
          package: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    // 5. If found in Prisma, return sanitized result
    if (order) {
      const sanitizedResult: OrderTrackingResult = {
        orderNumber: order.orderNumber,
        playerUid: order.playerUid,
        playerName: order.playerName,
        diamonds: order.package?.diamonds || 100,
        originalPrice: order.originalPrice,
        discountAmount: order.discountAmount,
        finalPrice: order.finalPrice,
        status: order.status as OrderStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
        statusHistory: order.statusHistory?.map((h) => ({
          id: h.id,
          status: h.status as OrderStatus,
          note: h.note,
          createdAt: h.createdAt.toISOString(),
        })) || [],
      };

      return NextResponse.json(sanitizedResult);
    }

    // 6. If not found in database, check memory store backup
    const cachedOrder = getOrderFromMemory(query);
    if (cachedOrder) {
      return NextResponse.json(cachedOrder);
    }

    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order tracking details' },
      { status: 500 }
    );
  }
}
