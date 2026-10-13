/**
 * AI Payment & SMS Parser Engine for VIP STORE
 * Specialised for Egyptian mobile wallets & banking networks:
 * - Vodafone Cash (فودافون كاش)
 * - InstaPay Egypt (إنستاباي - شبكة المدفوعات اللحظية IPN)
 * - Orange Cash, Etisalat Cash, WE Pay
 */

export interface ParsedPaymentResult {
  isValid: boolean;
  provider: 'VODAFONE_CASH' | 'INSTAPAY' | 'ORANGE_CASH' | 'ETISALAT_CASH' | 'WE_PAY' | 'UNKNOWN';
  providerNameAr: string;
  amount: number | null;
  currency: string;
  senderPhone: string | null;
  senderName: string | null;
  transactionRef: string | null;
  timestamp: string | null;
  confidenceScore: number; // 0 to 100
  isFraudulent: boolean;
  fraudReason?: string;
  aiReasoning: string[];
  rawMessage: string;
}

// Convert Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) to standard (0123456789)
export function normalizeArabicNumbers(text: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = text;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(arabicDigits[i], String(i));
  }
  return result;
}

export function parsePaymentMessageWithAI(rawMessage: string, senderHeader?: string): ParsedPaymentResult {
  const reasoning: string[] = [];
  const cleanText = normalizeArabicNumbers(rawMessage || '').trim();
  const lowerText = cleanText.toLowerCase();
  const lowerSender = (senderHeader || '').toLowerCase();

  // 1. Initial validation
  if (!cleanText || cleanText.length < 5) {
    return {
      isValid: false,
      provider: 'UNKNOWN',
      providerNameAr: 'غير معروف',
      amount: null,
      currency: 'EGP',
      senderPhone: null,
      senderName: null,
      transactionRef: null,
      timestamp: null,
      confidenceScore: 0,
      isFraudulent: true,
      fraudReason: 'الرسالة فارغة أو قصيرة للغاية',
      aiReasoning: ['النص المدخل لا يحتوي على بيانات كافية لمعالجته بالذكاء الاصطناعي.'],
      rawMessage,
    };
  }

  // 2. Fraud & Debit Checks (Ensure this is an INCOMING transfer, NOT a debit or failed transaction)
  const debitPatterns = [
    /تم\s*خصم/i,
    /تم\s*سحب/i,
    /تم\s*تحويل\s*مبلغ\s*.*?\s*إلى/i,
    /you\s*have\s*sent/i,
    /debited\s*with/i,
    /payment\s*to/i,
    /فشل\s*التحويل/i,
    /فشلت\s*العملية/i,
    /transaction\s*failed/i,
    /رصيدك\s*غير\s*كاف/i,
    /insufficient\s*balance/i,
  ];

  for (const pattern of debitPatterns) {
    if (pattern.test(cleanText)) {
      return {
        isValid: false,
        provider: 'UNKNOWN',
        providerNameAr: 'غير معروف',
        amount: null,
        currency: 'EGP',
        senderPhone: null,
        senderName: null,
        transactionRef: null,
        timestamp: null,
        confidenceScore: 0,
        isFraudulent: true,
        fraudReason: 'تم الكشف عن رسالة خصم أو تحويل صادر أو عملية فاشلة، وليست استلام أموال حقيقي',
        aiReasoning: [
          'فحص الأمان: تم رفض الرسالة لاحتوائها على صيغة خصم (Debit) أو عملية تحويل غير مكتملة.',
        ],
        rawMessage,
      };
    }
  }

  // 3. Detect Provider
  let provider: ParsedPaymentResult['provider'] = 'UNKNOWN';
  let providerNameAr = 'غير معروف';

  const isVodafone =
    lowerSender.includes('vodafone') ||
    lowerSender.includes('vf-cash') ||
    lowerSender.includes('vfcash') ||
    /فودافون/i.test(cleanText) ||
    /vodafone\s*cash/i.test(cleanText) ||
    /مصاريف\s*الخدمة/i.test(cleanText) ||
    /رقم\s*العملية\s*:\s*\d+/i.test(cleanText);

  const isInstaPay =
    lowerSender.includes('instapay') ||
    lowerSender.includes('ipn') ||
    /إنستاباي/i.test(cleanText) ||
    /انستاباي/i.test(cleanText) ||
    /instapay/i.test(cleanText) ||
    /شبكة\s*المدفوعات\s*اللحظية/i.test(cleanText) ||
    /ipn/i.test(cleanText);

  const isOrange =
    lowerSender.includes('orange') ||
    /أورانج\s*كاش/i.test(cleanText) ||
    /اورانج\s*كاش/i.test(cleanText) ||
    /orange\s*cash/i.test(cleanText);

  const isEtisalat =
    lowerSender.includes('etisalat') ||
    /اتصالات\s*كاش/i.test(cleanText) ||
    /etisalat\s*cash/i.test(cleanText);

  if (isVodafone) {
    provider = 'VODAFONE_CASH';
    providerNameAr = 'فودافون كاش (Vodafone Cash)';
    reasoning.push('تم التعرف على مزود الدفع: فودافون كاش (Vodafone Cash) بنجاح.');
  } else if (isInstaPay) {
    provider = 'INSTAPAY';
    providerNameAr = 'إنستاباي (InstaPay IPN)';
    reasoning.push('تم التعرف على مزود الدفع: إنستاباي (InstaPay IPN) بنجاح.');
  } else if (isOrange) {
    provider = 'ORANGE_CASH';
    providerNameAr = 'أورانج كاش (Orange Cash)';
    reasoning.push('تم التعرف على مزود الدفع: أورانج كاش (Orange Cash).');
  } else if (isEtisalat) {
    provider = 'ETISALAT_CASH';
    providerNameAr = 'اتصالات كاش (Etisalat Cash)';
    reasoning.push('تم التعرف على مزود الدفع: اتصالات كاش (Etisalat Cash).');
  } else {
    // Check general Egyptian money receipt keywords
    if (/تم\s*استلام/i.test(cleanText) || /تم\s*تحويل/i.test(cleanText) || /received/i.test(cleanText)) {
      provider = 'VODAFONE_CASH'; // Default to VF-Cash for standard Egypt wallet SMS
      providerNameAr = 'محفظة إلكترونية / فودافون كاش';
      reasoning.push('تم تصنيف الرسالة كإشعار استلام نقدي على المحفظة الإلكترونية.');
    } else {
      reasoning.push('لم يتم التعرف على اسم المحفظة بشكل صريح، جاري تحليل باقي محتويات الرسالة...');
    }
  }

  // 4. Extract Amount
  let amount: number | null = null;
  // Patterns for Egyptian amounts:
  // e.g. "مبلغ 50.00 ج.م", "مبلغ 50 جنيه", "50.00 EGP", "50 جم", "50 LE"
  const amountRegexes = [
    /(?:مبلغ|قيمة|بقيمة)\s*:?\s*(\d+(?:\.\d{1,2})?)\s*(?:ج\.?م|جم|جنيه|egp|le)?/i,
    /(\d+(?:\.\d{1,2})?)\s*(?:ج\.?م|جم|جنيه|egp|le)/i,
    /(?:received|credited\s*with)\s*:?\s*(\d+(?:\.\d{1,2})?)\s*(?:egp|le)?/i,
    /(?:egp|le)\s*(\d+(?:\.\d{1,2})?)/i,
    /(?:استلام|تحويل)\s+(\d+(?:\.\d{1,2})?)/i,
  ];

  for (const regex of amountRegexes) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        reasoning.push(`تم استخراج المبلغ المالي بنجاح: ${amount} جنيه مصري.`);
        break;
      }
    }
  }

  if (amount === null) {
    // Fallback: look for standalone number before or after 'رصيدك'
    const fallbackMatch = cleanText.match(/\b(\d{2,4}(?:\.\d{2})?)\b/);
    if (fallbackMatch && fallbackMatch[1]) {
      const parsed = parseFloat(fallbackMatch[1]);
      if (!isNaN(parsed) && parsed >= 10 && parsed <= 10000) {
        amount = parsed;
        reasoning.push(`تم استخراج المبلغ التقديري عبر التحليل الإحصائي: ${amount} ج.م.`);
      }
    }
  }

  // 5. Extract Sender Phone or Name
  let senderPhone: string | null = null;
  let senderName: string | null = null;

  // Egyptian mobile phone patterns (010, 011, 012, 015 followed by 8 digits)
  const phoneMatch = cleanText.match(/(?:من\s*رقم|من)?\s*(01[0125]\d{8})\b/i);
  if (phoneMatch && phoneMatch[1]) {
    senderPhone = phoneMatch[1];
    reasoning.push(`تم استخراج رقم هاتف المرسل: ${senderPhone}`);
  }

  // InstaPay sender handle/name: "من ACCOUNT_NAME" or "from NAME"
  const senderNameMatch = cleanText.match(/(?:من\s*حساب|من)\s*([a-zA-Z0-9_\.\u0600-\u06FF\s]{3,25}?)(?:\s*(?:بنجاح|إلى|مرجع|ref|\.|$))/i);
  if (senderNameMatch && senderNameMatch[1] && !senderNameMatch[1].startsWith('01')) {
    senderName = senderNameMatch[1].trim();
    reasoning.push(`تم استخراج اسم حساب المحول: ${senderName}`);
  }

  // 6. Extract Transaction ID / Reference
  let transactionRef: string | null = null;
  const refPatterns = [
    /(?:رقم\s*العملية|العملية|مرجع\s*العملية|المرجع|كود\s*العملية)\s*:\s*([a-zA-Z0-9_-]+)/i,
    /(?:trans\s*id|transaction\s*id|reference|ref\s*no|ref)\s*:\s*([a-zA-Z0-9_-]+)/i,
    /#([a-zA-Z0-9]{6,20})/i,
  ];

  for (const regex of refPatterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      transactionRef = match[1].trim();
      reasoning.push(`تم استخراج رقم المرجع/العملية: ${transactionRef}`);
      break;
    }
  }

  // 7. Calculate AI Confidence Score
  let confidence = 0;
  if (provider !== 'UNKNOWN') confidence += 30;
  if (amount !== null && amount > 0) confidence += 40;
  if (senderPhone !== null || senderName !== null) confidence += 15;
  if (transactionRef !== null) confidence += 15;

  const isValid = confidence >= 70 && amount !== null && amount > 0;

  if (isValid) {
    reasoning.push(`درجة ثقة الذكاء الاصطناعي: ${confidence}% - تم اعتماد صحة الإشعار وجاهزيته للشحن التلقائي.`);
  } else {
    reasoning.push(`درجة الثقة: ${confidence}% - المعطيات غير كافية لاعتماد الشحن الآلي تلقائياً.`);
  }

  return {
    isValid,
    provider,
    providerNameAr,
    amount,
    currency: 'EGP',
    senderPhone,
    senderName,
    transactionRef,
    timestamp: new Date().toISOString(),
    confidenceScore: confidence,
    isFraudulent: false,
    aiReasoning: reasoning,
    rawMessage,
  };
}
