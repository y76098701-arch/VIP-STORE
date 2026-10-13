import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const createPackageSchema = z.object({
  diamonds: z.coerce.number().int().positive('Diamonds count must be a positive integer'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  currency: z.string().default('EGP').optional(),
  sortOrder: z.coerce.number().int().default(0).optional(),
  isActive: z.boolean().default(true).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const packages = await prisma.diamondPackage.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error('Error fetching admin packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diamond packages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = createPackageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { diamonds, price, currency, sortOrder, isActive } = parseResult.data;

    const newPackage = await prisma.diamondPackage.create({
      data: {
        diamonds,
        price,
        currency: currency || 'EGP',
        sortOrder: sortOrder ?? 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ package: newPackage }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create diamond package' },
      { status: 500 }
    );
  }
}
