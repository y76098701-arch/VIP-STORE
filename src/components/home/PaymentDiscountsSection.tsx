'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Percent,
  ShieldCheck,
  CreditCard,
  Zap,
  Phone,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';

export const PaymentDiscountsSection: React.FC = () => {
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Discounts Explanation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <Card
            glow="purple"
            hover={false}
            className="h-full p-6 sm:p-8 border-vip-purple/40 bg-gradient-to-br from-vip-card via-[#120f24] to-vip-card relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-vip-purple/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-vip-gold/15 border border-vip-gold/30 text-vip-gold mb-4">
                <Flame className="w-4 h-4 text-vip-gold animate-pulse" />
                <span>{isArabic ? 'نظام الخصومات الحصري' : 'Exclusive Discount System'}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
                {isArabic ? 'وفر حتى 50% على شحنتك الأولى!' : 'Save up to 50% on Your First Top-Up!'}
              </h3>

              <p className="text-sm sm:text-base text-vip-text-secondary leading-relaxed mb-6">
                {isArabic
                  ? 'في VIP STORE، يتم احتساب الخصومات آلياً ومباشرة عبر خوادمنا بدون الحاجة لأي كود خصم، لضمان أعلى مستوى من الأمان والسرعة.'
                  : 'At VIP STORE, discounts are calculated dynamically on the server with no promo code required, ensuring maximum speed and security.'}
              </p>

              <div className="space-y-4">
                {/* 50% New Users */}
                <div className="p-4 rounded-xl bg-vip-bg/80 border border-vip-purple/30 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vip-purple to-vip-blue flex items-center justify-center text-white shrink-0 font-black text-sm">
                    50%
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{isArabic ? 'للعملاء الجدد (الطلب الأول)' : 'New Users (1st Order)'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-vip-gold text-black">
                        {isArabic ? 'تلقائي' : 'Auto'}
                      </span>
                    </h4>
                    <p className="text-xs text-vip-text-muted mt-1 leading-relaxed">
                      {isArabic
                        ? 'خصم 50% يطبق تلقائياً على أول عملية شحن لكل معرف لاعب (Free Fire UID). كل معرف مؤهل لمرة واحدة فقط.'
                        : '50% discount applied automatically on the first order per Free Fire UID. Valid once per UID.'}
                    </p>
                  </div>
                </div>

                {/* 20% Regular Users */}
                <div className="p-4 rounded-xl bg-vip-bg/80 border border-vip-border flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-vip-gold/15 border border-vip-gold/30 flex items-center justify-center text-vip-gold shrink-0 font-black text-sm">
                    20%
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {isArabic ? 'للعملاء الحاليين (خصم دائم)' : 'Regular Users (20% OFF)'}
                    </h4>
                    <p className="text-xs text-vip-text-muted mt-1 leading-relaxed">
                      {isArabic
                        ? 'خصم 20% مستمر على كافة الطلبات التالية لجميع باقات الجواهر طوال العام.'
                        : '20% continuous discount on all subsequent diamond packages year-round.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-vip-border/60 flex items-center gap-2 text-xs text-vip-text-muted">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isArabic
                  ? 'يتم التحقق من الأهلية عبر السيرفر لمنع التلاعب وضمان حق كل لاعب'
                  : 'Eligibility strictly validated server-side to guarantee fairness'}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Payment Methods Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full"
        >
          <Card
            glow="blue"
            hover={false}
            className="h-full p-6 sm:p-8 border-vip-blue/40 bg-gradient-to-br from-vip-card via-[#0c1428] to-vip-card relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-vip-blue/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-vip-cyan/15 border border-vip-cyan/30 text-vip-cyan mb-4">
                <CreditCard className="w-4 h-4" />
                <span>{isArabic ? 'وسائل الدفع المعتمدة' : 'Official Payment Methods'}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
                {isArabic ? 'دفع آمن، فوري، وموثق بإيصال' : 'Secure & Verified Payment Options'}
              </h3>

              <p className="text-sm sm:text-base text-vip-text-secondary leading-relaxed mb-6">
                {isArabic
                  ? 'نوفر طرق دفع محلية وسريعة في مصر مع متابعة دقيقة لكل تحويل وتسليم فوري للجواهر بعد التحقق.'
                  : 'Fast and convenient Egyptian payment methods with transaction verification before diamonds delivery.'}
              </p>

                {/* Payment Methods Badges */}
                <div className="space-y-3.5 mb-6">
                  {/* InstaPay */}
                  <div className="p-4 rounded-xl bg-vip-bg/80 border border-purple-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-base">
                        ⚡
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {isArabic ? 'إنستاباي (InstaPay)' : 'InstaPay'}
                        </h4>
                        <p className="text-xs text-vip-text-muted mt-0.5">
                          {isArabic ? 'تحويل فوري لحظي من جميع البنوك والمحافظ' : 'Instant bank transfer'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/30">
                      {isArabic ? 'فوري' : 'Instant'}
                    </span>
                  </div>

                  {/* Vodafone Cash */}
                  <div className="p-4 rounded-xl bg-vip-bg/80 border border-red-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center font-bold text-base">
                        📱
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {isArabic ? 'فودافون كاش والمحافظ الإلكترونية' : 'Vodafone Cash & Mobile Wallets'}
                        </h4>
                        <p className="text-xs text-vip-text-muted mt-0.5">
                          {isArabic ? 'تحويل مباشر وسريع عبر كافة المحافظ الذكية' : 'Direct mobile wallet transfer'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-red-500/15 text-red-300 font-semibold border border-red-500/30">
                      010
                    </span>
                  </div>
                </div>

              {/* Official Transfer Phone Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-vip-purple/20 to-vip-blue/20 border border-vip-purple/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-vip-text-secondary block font-medium">
                    {isArabic ? 'رقم التحويل الرسمي المعتمد لجميع المعاملات:' : 'Official Transfer Phone Number:'}
                  </span>
                  <span className="text-lg font-mono font-black text-white tracking-wider">
                    01069954152
                  </span>
                </div>
                <CopyButton text="01069954152" label={isArabic ? 'نسخ الرقم' : 'Copy'} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-vip-border/60 flex items-center gap-2 text-xs text-vip-text-muted">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isArabic
                  ? 'رفع الإيصال مطلوب بعد التحويل للتحقق من العملية قبل إرسال الجواهر'
                  : 'Receipt upload required after transfer to verify payment before delivery'}
              </span>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentDiscountsSection;
