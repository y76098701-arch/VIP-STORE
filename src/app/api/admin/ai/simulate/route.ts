import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parsePaymentMessageWithAI } from '@/lib/ai-payment-parser';
import { matchAndFulfillOrderWithAI } from '@/lib/ai-order-matcher';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const message = body.message || '';
    const sender = body.sender || 'AdminSimulator';

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'يرجى إدخال نص رسالة التحويل للتجربة' },
        { status: 400 }
      );
    }

    // 1. AI Parsing
    const parsed = parsePaymentMessageWithAI(message, sender);

    // 2. Matching & Fulfillment
    const result = await matchAndFulfillOrderWithAI(parsed, sender);

    return NextResponse.json({
      success: result.success,
      matched: result.matched,
      autoFulfilled: result.autoFulfilled,
      order: result.order,
      diamondsCharged: result.diamondsCharged,
      playerUid: result.playerUid,
      providerTxId: result.providerTxId,
      message: result.message,
      aiAnalysis: {
        provider: parsed.provider,
        providerNameAr: parsed.providerNameAr,
        amount: parsed.amount,
        senderPhone: parsed.senderPhone,
        senderName: parsed.senderName,
        transactionRef: parsed.transactionRef,
        confidenceScore: parsed.confidenceScore,
        isFraudulent: parsed.isFraudulent,
        reasoning: parsed.aiReasoning,
      },
    });
  } catch (error: any) {
    console.error('Error in AI Simulator:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to simulate AI charge' },
      { status: 500 }
    );
  }
}
