import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { calculateDiscount, markFirstOrderUsed } from '@/lib/discount';
import { generateOrderNumber, generatePaymentRef } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const createOrderSchema = z.object({
  playerUid: z
    .string()
    .trim()
    .min(5, 'Player UID must be at least 5 characters')
    .max(20, 'Player UID must be at most 20 characters'),
  playerName: z.string().trim().optional().nullable(),
  packageId: z.string().min(1, 'Package ID is required'),
  paymentMethod: z.enum(['instapay', 'daqan_cash', 'vodafone_cash'], {
    errorMap: () => ({ message: 'Payment method must be instapay, daqan_cash, or vodafone_cash' }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = createOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { playerUid, playerName, packageId, paymentMethod } = parseResult.data;

    // Verify package exists and is active
    const pkg = await prisma.diamondPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg || !pkg.isActive) {
      return NextResponse.json(
        { error: 'Selected diamond package was not found or is unavailable' },
        { status: 404 }
      );
    }

    // Calculate server-side discount
    const discount = await calculateDiscount(playerUid, pkg.price);

    // Generate unique order number and payment reference
    const orderNumber = generateOrderNumber();
    const paymentRef = generatePaymentRef();

    // Create order with initial status history
    const order = await prisma.order.create({
      data: {
        orderNumber,
        playerUid,
        playerName: playerName || null,
        packageId: pkg.id,
        originalPrice: pkg.price,
        discountPercent: discount.discountPercent,
        discountAmount: discount.discountAmount,
        finalPrice: discount.finalPrice,
        isFirstOrder: discount.isFirstOrder,
        paymentMethod,
        paymentRef,
        status: 'PENDING_PAYMENT',
        statusHistory: {
          create: {
            status: 'PENDING_PAYMENT',
            note: 'Order created, awaiting payment',
          },
        },
      },
      include: {
        package: true,
        statusHistory: true,
      },
    });

    // If first order discount was applied, mark it as used for this UID
    if (discount.isFirstOrder) {
      await markFirstOrderUsed(playerUid, order.id);
    }

    return NextResponse.json(
      {
        order,
        paymentRef,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order due to an internal error' },
      { status: 500 }
    );
  }
}
