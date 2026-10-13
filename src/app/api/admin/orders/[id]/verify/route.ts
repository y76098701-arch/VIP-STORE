import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const verifySchema = z.object({
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: "Action must be either 'approve' or 'reject'" }),
  }),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const parseResult = verifySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { action, notes } = parseResult.data;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const targetStatus = action === 'approve' ? 'PAID' : 'REJECTED';
    const historyNote =
      notes?.trim() ||
      (action === 'approve'
        ? 'Payment verified and approved by admin'
        : 'Payment receipt rejected by admin');

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status: targetStatus,
          ...(notes !== undefined ? { adminNotes: notes } : {}),
        },
      }),
      prisma.statusHistory.create({
        data: {
          orderId: id,
          status: targetStatus,
          note: historyNote,
        },
      }),
    ]);

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        package: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error verifying order payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify order payment' },
      { status: 500 }
    );
  }
}
