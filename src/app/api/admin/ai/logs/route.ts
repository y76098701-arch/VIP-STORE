import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const [logs, totalCount, autoFulfilledCount, totalAmountResult] = await Promise.all([
      prisma.aiPaymentLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiPaymentLog.count(),
      prisma.aiPaymentLog.count({
        where: { autoFulfilled: true },
      }),
      prisma.aiPaymentLog.aggregate({
        where: { autoFulfilled: true },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      logs,
      stats: {
        totalProcessed: totalCount,
        autoFulfilled: autoFulfilledCount,
        totalAmount: totalAmountResult._sum.amount || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching AI logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve AI payment logs' },
      { status: 500 }
    );
  }
}
