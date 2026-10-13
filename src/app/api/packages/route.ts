import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const packages = await prisma.diamondPackage.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diamond packages' },
      { status: 500 }
    );
  }
}
