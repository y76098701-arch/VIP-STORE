import prisma from './db';
import { ParsedPaymentResult } from './ai-payment-parser';
import { submitTopup } from './topup-provider';

export interface AutoMatchAndFulfillResult {
  success: boolean;
  matched: boolean;
  autoFulfilled: boolean;
  order: any | null;
  logId?: string;
  diamondsCharged?: number;
  playerUid?: string;
  providerTxId?: string;
  message: string;
  aiExplanation: string;
}

export async function matchAndFulfillOrderWithAI(
  parsed: ParsedPaymentResult,
  senderHeader?: string
): Promise<AutoMatchAndFulfillResult> {
  const defaultExplanation = parsed.aiReasoning.join(' | ');

  // If parsed data is invalid or fraudulent
  if (!parsed.isValid || parsed.amount === null || parsed.amount <= 0) {
    const log = await prisma.aiPaymentLog.create({
      data: {
        sender: senderHeader || parsed.senderPhone || 'Unknown',
        rawMessage: parsed.rawMessage,
        provider: parsed.provider,
        amount: parsed.amount,
        senderPhone: parsed.senderPhone,
        transactionRef: parsed.transactionRef,
        confidence: parsed.confidenceScore,
        autoFulfilled: false,
        status: parsed.isFraudulent ? 'FRAUD_SUSPECTED' : 'INVALID',
        aiReasoning: parsed.fraudReason || defaultExplanation,
      },
    });

    return {
      success: false,
      matched: false,
      autoFulfilled: false,
      order: null,
      logId: log.id,
      message: parsed.fraudReason || 'فشل التحقق من صحة الإشعار عبر الذكاء الاصطناعي.',
      aiExplanation: defaultExplanation,
    };
  }

  // Check Settings
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['ai_auto_charge_enabled', 'ai_confidence_threshold'],
      },
    },
  });
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const autoChargeEnabled = settingsMap.ai_auto_charge_enabled !== 'false';
  const threshold = parseFloat(settingsMap.ai_confidence_threshold || '70');

  // Search for pending orders
  // Statuses eligible for auto-completion: PENDING_PAYMENT or UNDER_REVIEW
  const pendingOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ['PENDING_PAYMENT', 'UNDER_REVIEW'],
      },
    },
    include: {
      package: true,
    },
    orderBy: {
      createdAt: 'asc', // First-In, First-Out (oldest pending order first)
    },
  });

  if (pendingOrders.length === 0) {
    const log = await prisma.aiPaymentLog.create({
      data: {
        sender: senderHeader || parsed.senderPhone || 'Unknown',
        rawMessage: parsed.rawMessage,
        provider: parsed.provider,
        amount: parsed.amount,
        senderPhone: parsed.senderPhone,
        transactionRef: parsed.transactionRef,
        confidence: parsed.confidenceScore,
        autoFulfilled: false,
        status: 'NO_MATCH',
        aiReasoning: `تم استخراج مبلغ ${parsed.amount} ج.م بنجاح ولكن لا توجد حالياً أي طلبات معلقة في النظام.`,
      },
    });

    return {
      success: true,
      matched: false,
      autoFulfilled: false,
      order: null,
      logId: log.id,
      message: `تم التحقق من استلام ${parsed.amount} ج.م، ولكن لا يوجد طلب معلق ينتظر هذا المبلغ حالياً. تم حفظ العملية في السجل لمراجعتها.`,
      aiExplanation: `تم التحقق بنجاح (${parsed.providerNameAr} - ${parsed.amount} ج.م) بدون وجود طلب مطابق في الانتظار.`,
    };
  }

  // Matching Logic:
  // 1. Direct Order Number match in message
  let matchedOrder = pendingOrders.find((o) =>
    parsed.rawMessage.toUpperCase().includes(o.orderNumber.toUpperCase())
  );

  // 2. Exact amount match
  if (!matchedOrder) {
    matchedOrder = pendingOrders.find(
      (o) => Math.abs(o.finalPrice - parsed.amount!) < 0.5
    );
  }

  // 3. Sender phone match with paymentRef if provided by customer
  if (!matchedOrder && parsed.senderPhone) {
    matchedOrder = pendingOrders.find(
      (o) => o.paymentRef && o.paymentRef.includes(parsed.senderPhone!)
    );
  }

  // If no match found
  if (!matchedOrder) {
    const log = await prisma.aiPaymentLog.create({
      data: {
        sender: senderHeader || parsed.senderPhone || 'Unknown',
        rawMessage: parsed.rawMessage,
        provider: parsed.provider,
        amount: parsed.amount,
        senderPhone: parsed.senderPhone,
        transactionRef: parsed.transactionRef,
        confidence: parsed.confidenceScore,
        autoFulfilled: false,
        status: 'NO_MATCH',
        aiReasoning: `تم استخراج مبلغ ${parsed.amount} ج.م ولكن لا يوجد طلب معلق بنفس القيمة.`,
      },
    });

    return {
      success: true,
      matched: false,
      autoFulfilled: false,
      order: null,
      logId: log.id,
      message: `تم قراءة تحويل بقيمة ${parsed.amount} ج.م ولكن لم يتطابق مع أي طلب معلق. تم حفظ الإشعار في لوحة الإدارة.`,
      aiExplanation: `المبلغ (${parsed.amount} ج.م) لا يطابق أي طلب في قائمة الانتظار.`,
    };
  }

  // We have a matched order!
  // Check if Auto-Charge is enabled and confidence satisfies threshold
  const canAutoFulfill = autoChargeEnabled && parsed.confidenceScore >= threshold;

  if (!canAutoFulfill) {
    // Just mark as PAID or UNDER_REVIEW for manual admin dispatch
    await prisma.$transaction([
      prisma.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: 'PAID',
          paymentRef: parsed.transactionRef || matchedOrder.paymentRef,
          adminNotes: `تم التحقق من التحويل عبر الذكاء الاصطناعي (${parsed.providerNameAr} - ${parsed.amount} ج.م). بانتظار الشحن اليدوي.`,
        },
      }),
      prisma.statusHistory.create({
        data: {
          orderId: matchedOrder.id,
          status: 'PAID',
          note: `تم تأكيد استلام التحويل (${parsed.amount} ج.م) بواسطة الذكاء الاصطناعي`,
        },
      }),
    ]);

    const log = await prisma.aiPaymentLog.create({
      data: {
        sender: senderHeader || parsed.senderPhone || 'Unknown',
        rawMessage: parsed.rawMessage,
        provider: parsed.provider,
        amount: parsed.amount,
        senderPhone: parsed.senderPhone,
        transactionRef: parsed.transactionRef,
        matchedOrderId: matchedOrder.id,
        orderNumber: matchedOrder.orderNumber,
        playerUid: matchedOrder.playerUid,
        diamonds: matchedOrder.package.diamonds,
        confidence: parsed.confidenceScore,
        autoFulfilled: false,
        status: 'PAID_AWAITING_DELIVERY',
        aiReasoning: `تم تطابق الطلب ${matchedOrder.orderNumber} وتأكيد الدفع. ميزة الشحن التلقائي متوقفة حالياً ويتم الشحن يدوياً.`,
      },
    });

    return {
      success: true,
      matched: true,
      autoFulfilled: false,
      order: matchedOrder,
      logId: log.id,
      diamondsCharged: matchedOrder.package.diamonds,
      playerUid: matchedOrder.playerUid,
      message: `تم تأكيد دفع الطلب ${matchedOrder.orderNumber} للاعب (${matchedOrder.playerUid}) بنجاح.`,
      aiExplanation: `تم تأكيد الدفع بنجاح. الشحن التلقائي معطل لذلك يتطلب موافقة يدوية.`,
    };
  }

  // AUTO-FULFILL: Deliver diamonds immediately via Topup Provider!
  try {
    // 1. Mark as PAID first
    await prisma.$transaction([
      prisma.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: 'PROCESSING',
          paymentRef: parsed.transactionRef || matchedOrder.paymentRef,
          adminNotes: `تم تأكيد الدفع وشحن الجواهر تلقائياً بالذكاء الاصطناعي | المحفظة: ${parsed.providerNameAr} | المعاملة: ${parsed.transactionRef || 'N/A'}`,
        },
      }),
      prisma.statusHistory.create({
        data: {
          orderId: matchedOrder.id,
          status: 'PROCESSING',
          note: `الذكاء الاصطناعي: تم تأكيد الدفع وجاري إرسال ${matchedOrder.package.diamonds} جوهرة لحساب اللاعب`,
        },
      }),
    ]);

    // 2. Dispatch top-up to game provider
    const topupResult = await submitTopup({
      playerUid: matchedOrder.playerUid,
      diamonds: matchedOrder.package.diamonds,
      orderId: matchedOrder.orderNumber,
    });

    const txId = topupResult.transactionId || `AI-FF-${Date.now()}`;

    // 3. Complete the order
    await prisma.$transaction([
      prisma.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: 'COMPLETED',
          providerTxId: txId,
        },
      }),
      prisma.statusHistory.create({
        data: {
          orderId: matchedOrder.id,
          status: 'COMPLETED',
          note: `تم الشحن بنجاح وتلقائياً عبر الذكاء الاصطناعي. رقم العملية: ${txId}`,
        },
      }),
    ]);

    // 4. Save AI Log
    const log = await prisma.aiPaymentLog.create({
      data: {
        sender: senderHeader || parsed.senderPhone || 'Unknown',
        rawMessage: parsed.rawMessage,
        provider: parsed.provider,
        amount: parsed.amount,
        senderPhone: parsed.senderPhone,
        transactionRef: parsed.transactionRef,
        matchedOrderId: matchedOrder.id,
        orderNumber: matchedOrder.orderNumber,
        playerUid: matchedOrder.playerUid,
        diamonds: matchedOrder.package.diamonds,
        confidence: parsed.confidenceScore,
        autoFulfilled: true,
        deliveryTxId: txId,
        status: 'COMPLETED_SUCCESS',
        aiReasoning: `تم التحقق بنجاح بنسبة ثقة ${parsed.confidenceScore}%، وتطابق مع الطلب ${matchedOrder.orderNumber}، وشحن ${matchedOrder.package.diamonds} جوهرة لحساب اللاعب ${matchedOrder.playerUid} فوراً برقم إيصال: ${txId}.`,
      },
    });

    return {
      success: true,
      matched: true,
      autoFulfilled: true,
      order: matchedOrder,
      logId: log.id,
      diamondsCharged: matchedOrder.package.diamonds,
      playerUid: matchedOrder.playerUid,
      providerTxId: txId,
      message: `تم شحن ${matchedOrder.package.diamonds} جوهرة تلقائياً للاعب (${matchedOrder.playerUid}) للطلب (${matchedOrder.orderNumber})!`,
      aiExplanation: `تم التعرف على إشعار ${parsed.providerNameAr} بقيمة ${parsed.amount} ج.م، ومطابقة الطلب وشحنه فورياً برقم عملية: ${txId}.`,
    };
  } catch (error: any) {
    console.error('Error auto-fulfilling order with AI:', error);
    return {
      success: false,
      matched: true,
      autoFulfilled: false,
      order: matchedOrder,
      message: `تم تأكيد الدفع للطلب ولكن حدث خطأ أثناء الاتصال بمزود الشحن: ${error.message}`,
      aiExplanation: `تم تأكيد الدفع لكن حدث خطأ أثناء تنفيذ الشحن الآلي.`,
    };
  }
}
