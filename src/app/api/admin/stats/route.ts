import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { AdminStats } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      rejectedOrders,
      totalRevenueAgg,
      todayOrders,
      todayRevenueAgg,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING_PAYMENT', 'UNDER_REVIEW'],
          },
        },
      }),
      prisma.order.count({
        where: {
          status: 'COMPLETED',
        },
      }),
      prisma.order.count({
        where: {
          status: 'REJECTED',
        },
      }),
      prisma.order.aggregate({
        _sum: {
          finalPrice: true,
        },
        where: {
          status: 'COMPLETED',
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      prisma.order.aggregate({
        _sum: {
          finalPrice: true,
        },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
    ]);

    const stats: AdminStats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      rejectedOrders,
      totalRevenue: totalRevenueAgg._sum.finalPrice || 0,
      todayOrders,
      todayRevenue: todayRevenueAgg._sum.finalPrice || 0,
    };

    return NextResponse.json({
      ...stats,
      stats,
    });
  } catch (error: any) {
    console.error('Error calculating admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate admin statistics' },
      { status: 500 }
    );
  }
}
