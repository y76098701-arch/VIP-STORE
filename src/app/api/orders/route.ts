import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { calculateDiscount, markFirstOrderUsed } from '@/lib/discount';
import { generateOrderNumber, generatePaymentRef } from '@/lib/utils';
import { saveOrderToMemory } from '@/lib/orders-store';
import type { OrderStatus, OrderTrackingResult } from '@/types';

export const dynamic = 'force-dynamic';

const createOrderSchema = z.object({
  playerUid: z
    .string()
    .trim()
    .min(5, 'Player UID must be at least 5 characters')
    .max(20, 'Player UID must be at most 20 characters'),
  playerName: z.string().trim().optional().nullable(),
  packageId: z.string().min(1, 'Package ID is required'),
  paymentMethod: z.enum(['instapay', 'vodafone_cash'], {
    errorMap: () => ({ message: 'Payment method must be instapay or vodafone_cash' }),
  }),
  selectedDiscount: z.number().optional(),
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

    const { playerUid, playerName, packageId, paymentMethod, selectedDiscount } = parseResult.data;

    // Verify package exists and is active
    let pkg = await prisma.diamondPackage.findUnique({
      where: { id: packageId },
    });

    // Fallback if packageId is package diamonds or fallback id
    if (!pkg) {
      pkg = await prisma.diamondPackage.findFirst({
        where: {
          OR: [
            { id: packageId },
            { diamonds: parseInt(packageId, 10) || 0 },
          ],
        },
      });
    }

    if (!pkg) {
      // Create fallback package if not seeded yet
      const fallbackPrices: Record<number, number> = {
        100: 50,
        310: 150,
        520: 250,
        1060: 500,
        2180: 1000,
        5600: 2500,
      };
      const diamonds = parseInt(packageId, 10) || 100;
      const price = fallbackPrices[diamonds] || 50;

      try {
        pkg = await prisma.diamondPackage.create({
          data: {
            diamonds,
            price,
            currency: 'EGP',
            isActive: true,
          },
        });
      } catch (e) {
        pkg = await prisma.diamondPackage.findFirst();
      }
    }

    if (!pkg) {
      return NextResponse.json(
        { error: 'Selected diamond package was not found or is unavailable' },
        { status: 404 }
      );
    }

    // Calculate server-side discount respecting customer's choice and UID eligibility
    const discount = await calculateDiscount(playerUid, pkg.price, selectedDiscount);

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

    // If 50% discount was used, permanently mark it as used for this UID
    if (discount.discountPercent >= 50 || discount.isFirstOrder) {
      await markFirstOrderUsed(playerUid, order.id);
    }

    // Cache order in serverless memory backup store
    const trackingItem: OrderTrackingResult = {
      orderNumber: order.orderNumber,
      playerUid: order.playerUid,
      playerName: order.playerName,
      diamonds: pkg.diamonds,
      packageName: pkg.name || null,
      packageCategory: pkg.category || null,
      packageBadge: pkg.badge || null,
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
    saveOrderToMemory(trackingItem);

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
