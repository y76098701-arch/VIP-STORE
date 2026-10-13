import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isProviderConfigured, submitTopup } from '@/lib/topup-provider';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        package: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'PAID' && order.status !== 'PROCESSING') {
      return NextResponse.json(
        {
          error: `Order must be in PAID or PROCESSING status to deliver diamonds. Current status: ${order.status}`,
        },
        { status: 400 }
      );
    }

    // Check if provider is configured
    const configured = await isProviderConfigured();
    if (!configured) {
      return NextResponse.json(
        {
          success: false,
          error: 'Top-up provider is not configured. Please set TOPUP_PROVIDER_URL and TOPUP_PROVIDER_API_KEY in settings or environment.',
          order,
        },
        { status: 400 }
      );
    }

    // Update status to PROCESSING
    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: 'PROCESSING' },
      }),
      prisma.statusHistory.create({
        data: {
          orderId: id,
          status: 'PROCESSING',
          note: 'Diamond delivery initiated via provider',
        },
      }),
    ]);

    // Attempt diamond topup via provider
    const providerResult = await submitTopup({
      playerUid: order.playerUid,
      diamonds: order.package.diamonds,
      orderId: order.orderNumber,
    });

    if (providerResult.success) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            providerTxId: providerResult.transactionId || null,
          },
        }),
        prisma.statusHistory.create({
          data: {
            orderId: id,
            status: 'COMPLETED',
            note: providerResult.transactionId
              ? `Delivery completed successfully. Transaction ID: ${providerResult.transactionId}`
              : 'Delivery completed successfully',
          },
        }),
      ]);

      const completedOrder = await prisma.order.findUnique({
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
        order: completedOrder,
        providerResponse: providerResult,
      });
    } else {
      // Topup provider failed: keep status as PROCESSING, record error in notes
      const failureError = providerResult.error || 'Provider execution failed';
      const updatedNotes = order.adminNotes
        ? `${order.adminNotes} | Delivery failed: ${failureError}`
        : `Delivery failed: ${failureError}`;

      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: {
            adminNotes: updatedNotes,
          },
        }),
        prisma.statusHistory.create({
          data: {
            orderId: id,
            status: 'PROCESSING',
            note: `Top-up delivery failed: ${failureError}`,
          },
        }),
      ]);

      const processingOrder = await prisma.order.findUnique({
        where: { id },
        include: {
          package: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: failureError,
          order: processingOrder,
          providerResponse: providerResult,
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Error delivering order diamonds:', error);
    return NextResponse.json(
      { error: 'Failed to deliver diamonds due to an internal error' },
      { status: 500 }
    );
  }
}
