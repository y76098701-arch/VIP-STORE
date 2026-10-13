import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPlayerUid } from '@/lib/topup-provider';

export const dynamic = 'force-dynamic';

const verifyUidSchema = z.object({
  uid: z
    .string()
    .trim()
    .regex(/^\d{5,20}$/, 'Player UID must be numeric and between 5 and 20 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = verifyUidSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          valid: false,
          error: parseResult.error.errors[0]?.message || 'Invalid player UID',
        },
        { status: 400 }
      );
    }

    const { uid } = parseResult.data;
    const result = await verifyPlayerUid(uid);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error verifying player UID:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to verify player UID due to an internal error',
      },
      { status: 500 }
    );
  }
}
