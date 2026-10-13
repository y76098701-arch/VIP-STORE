import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { OrderTrackingResult, OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber || !orderNumber.trim()) {
      return NextResponse.json(
        { error: 'Order number query parameter is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      include: {
        package: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const sanitizedResult: OrderTrackingResult = {
      orderNumber: order.orderNumber,
      playerUid: order.playerUid,
      playerName: order.playerName,
      diamonds: order.package.diamonds,
      originalPrice: order.originalPrice,
      discountAmount: order.discountAmount,
      finalPrice: order.finalPrice,
      status: order.status as OrderStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        status: h.status as OrderStatus,
        note: h.note,
        createdAt: h.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(sanitizedResult);
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order tracking details' },
      { status: 500 }
    );
  }
}
