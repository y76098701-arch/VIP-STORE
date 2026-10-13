import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updatePackageSchema = z.object({
  name: z.string().nullable().optional(),
  category: z.string().optional(),
  badge: z.string().nullable().optional(),
  diamonds: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().positive().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const parseResult = updatePackageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const existingPackage = await prisma.diamondPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Diamond package not found' },
        { status: 404 }
      );
    }

    const updatedPackage = await prisma.diamondPackage.update({
      where: { id },
      data: parseResult.data,
    });

    return NextResponse.json({ package: updatedPackage });
  } catch (error: any) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Failed to update diamond package' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingPackage = await prisma.diamondPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Diamond package not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.diamondPackage.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Package deactivated successfully',
    });
  } catch (error: any) {
    console.error('Error deactivating package:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate diamond package' },
      { status: 500 }
    );
  }
}
