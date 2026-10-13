import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'ALL' && status.trim() !== '') {
      where.status = status.trim();
    }

    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { orderNumber: { contains: query } },
        { playerUid: { contains: query } },
        { paymentRef: { contains: query } },
        { providerTxId: { contains: query } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          package: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
