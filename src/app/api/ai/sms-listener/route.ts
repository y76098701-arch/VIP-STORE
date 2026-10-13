import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { parsePaymentMessageWithAI } from '@/lib/ai-payment-parser';
import { matchAndFulfillOrderWithAI } from '@/lib/ai-order-matcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ACTIVE',
    service: 'VIP STORE AI SMS Listener & Auto-Topup Webhook',
    phone: '01069954152',
    supportedWallets: ['Vodafone Cash', 'InstaPay Egypt IPN', 'Orange Cash', 'Etisalat Cash'],
    instructions: 'Send POST requests with { "message": "SMS_TEXT", "sender": "SENDER_NAME", "secretKey": "YOUR_SECRET" }',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = body.message || body.text || body.body || body.content || '';
    const sender = body.sender || body.from || body.phone || 'PhoneWebhook';
    const secretKey = body.secretKey || body.key || body.token || request.headers.get('x-api-key') || '';

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Check Secret Key if configured in settings
    const settingSecret = await prisma.setting.findUnique({
      where: { key: 'ai_phone_webhook_secret' },
    });

    if (settingSecret && settingSecret.value && settingSecret.value.trim().length > 0) {
      if (secretKey !== settingSecret.value.trim()) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid webhook secretKey' },
          { status: 401 }
        );
      }
    }

    // 1. AI Parsing
    const parsed = parsePaymentMessageWithAI(message, sender);

    // 2. Matching & Auto-Fulfillment
    const fulfillResult = await matchAndFulfillOrderWithAI(parsed, sender);

    return NextResponse.json({
      success: fulfillResult.success,
      matched: fulfillResult.matched,
      autoFulfilled: fulfillResult.autoFulfilled,
      order: fulfillResult.order
        ? {
            orderNumber: fulfillResult.order.orderNumber,
            playerUid: fulfillResult.order.playerUid,
            playerName: fulfillResult.order.playerName,
            diamonds: fulfillResult.diamondsCharged,
            status: fulfillResult.order.status,
          }
        : null,
      diamondsCharged: fulfillResult.diamondsCharged,
      providerTxId: fulfillResult.providerTxId,
      message: fulfillResult.message,
      aiAnalysis: {
        provider: parsed.providerNameAr,
        amount: parsed.amount,
        senderPhone: parsed.senderPhone,
        transactionRef: parsed.transactionRef,
        confidenceScore: parsed.confidenceScore,
        reasoning: parsed.aiReasoning,
      },
    });
  } catch (error: any) {
    console.error('Error in AI SMS Listener webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error processing SMS with AI', details: error.message },
      { status: 500 }
    );
  }
}
