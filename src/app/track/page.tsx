'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Gem,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Calendar,
  CreditCard,
  User,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CopyButton from '@/components/ui/CopyButton';
import Toast from '@/components/ui/Toast';

import { useLanguageContext } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/useToast';
import { cn, formatPrice, formatDate, getStatusLabel, getStatusColor, getStatusStyle, getPaymentMethodLabel } from '@/lib/utils';
import type { OrderTrackingResult, OrderStatus, StatusHistoryEntry } from '@/types';

// Flow steps for standard progression
const STANDARD_STEPS: { status: OrderStatus; labelAr: string; labelEn: string; descAr: string; descEn: string }[] = [
  {
    status: 'PENDING_PAYMENT',
    labelAr: 'في انتظار الدفع',
    labelEn: 'Pending Payment',
    descAr: 'تم تسجيل الطلب وبانتظار تحويل المبلغ',
    descEn: 'Order placed, waiting for payment transfer',
  },
  {
    status: 'UNDER_REVIEW',
    labelAr: 'قيد المراجعة',
    labelEn: 'Under Review',
    descAr: 'تم استلام الإيصال وجاري مراجعته',
    descEn: 'Receipt received, under verification',
  },
  {
    status: 'PAID',
    labelAr: 'تم تأكيد الدفع',
    labelEn: 'Paid',
    descAr: 'تم التحقق من التحويل بنجاح',
    descEn: 'Payment verified successfully',
  },
  {
    status: 'PROCESSING',
    labelAr: 'جاري التنفيذ',
    labelEn: 'Processing',
    descAr: 'جاري إرسال الجواهر إلى حسابك',
    descEn: 'Diamonds are being sent to your account',
  },
  {
    status: 'COMPLETED',
    labelAr: 'مكتمل',
    labelEn: 'Completed',
    descAr: 'تم شحن الجواهر بنجاح إلى حساب اللاعب',
    descEn: 'Diamonds successfully credited',
  },
];

function getStepProgressIndex(status: OrderStatus): number {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 0;
    case 'UNDER_REVIEW':
      return 1;
    case 'PAID':
      return 2;
    case 'PROCESSING':
      return 3;
    case 'COMPLETED':
      return 4;
    default:
      return -1;
  }
}

function TrackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const { language, t, dir } = useLanguageContext();
  const { toasts, addToast, removeToast } = useToast();

  const [orderQuery, setOrderQuery] = useState<string>(initialOrderNumber);
  const [order, setOrder] = useState<OrderTrackingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTracking = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال رقم الطلب للبحث' : 'Please enter an order number');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/track?orderNumber=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setOrder(null);
          setErrorMessage(t('orderNotFound'));
        } else {
          throw new Error(data.error || (language === 'ar' ? 'فشل البحث عن الطلب' : 'Failed to search order'));
        }
        return;
      }

      const resultOrder = data.order || data;
      setOrder(resultOrder);
      // Update browser URL query without reload
      router.replace(`/track?orderNumber=${encodeURIComponent(trimmed)}`);
    } catch (err: any) {
      console.error(err);
      setOrder(null);
      setErrorMessage(err.message || t('orderNotFound'));
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if orderNumber is in query params on mount
  useEffect(() => {
    if (initialOrderNumber) {
      setOrderQuery(initialOrderNumber);
      fetchTracking(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderQuery);
  };

  const currentStepIndex = order ? getStepProgressIndex(order.status) : -1;
  const isTerminated = order && (order.status === 'REJECTED' || order.status === 'REFUNDED');

  return (
    <div className="min-h-screen bg-vip-bg text-vip-text-primary flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vip-purple/10 border border-vip-purple/30 text-vip-purple-light text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'خدمة المتابعة الفورية' : 'Live Tracking Service'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('trackingTitle')}
          </h1>
          <p className="text-sm sm:text-base text-vip-text-secondary mt-2">
            {language === 'ar'
              ? 'أدخل رقم طلبك لمتابعة حالة الشحن وإرسال الجواهر خطوة بخطوة'
              : 'Enter your order number to track your diamonds top-up status step-by-step'}
          </p>
        </div>

        {/* Search Card */}
        <Card className="p-6 sm:p-8 neon-border mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <Input
                  label={t('orderNumber')}
                  placeholder="VIP-XXXXXXXX"
                  value={orderQuery}
                  onChange={(e) => {
                    setOrderQuery(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="font-mono text-base uppercase tracking-wider h-[46px]"
                />
              </div>
              <div className="sm:self-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={!orderQuery.trim() || loading}
                  className="w-full sm:w-auto h-[46px] px-8 flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(124,58,237,0.35)]"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('search')}</span>
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text={t('loading')} />
          </div>
        )}

        {/* Not Found Error */}
        {!loading && hasSearched && !order && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center bg-vip-card rounded-2xl border border-vip-error/30 max-w-2xl mx-auto space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-vip-error/10 border border-vip-error/30 flex items-center justify-center text-vip-error mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{errorMessage}</h3>
              <p className="text-sm text-vip-text-secondary">
                {language === 'ar'
                  ? 'يرجى التأكد من كتابة رقم الطلب بشكل صحيح (مثال: VIP-12345678) أو التواصل مع الدعم الفني.'
                  : 'Please check that the order number is typed correctly (e.g. VIP-12345678) or reach out to support.'}
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="secondary"
                onClick={() => router.push('/topup')}
                className="px-6"
              >
                <span>{t('topupNow')}</span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Order Details & Timeline */}
        {!loading && order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Order Header Summary Banner */}
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-vip-card via-vip-card-hover to-vip-card border border-vip-purple/40 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs uppercase tracking-wider text-vip-text-muted">{t('orderNumber')}</span>
                    <Badge status={order.status} lang={language} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-wider">
                    {order.orderNumber}
                  </h2>
                  <p className="text-xs text-vip-text-muted mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(order.createdAt, language)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <CopyButton text={order.orderNumber} label={language === 'ar' ? 'نسخ رقم الطلب' : 'Copy'} />
                </div>
              </div>

              {/* Order Info Metrics */}
              <div className="mt-6 pt-6 border-t border-vip-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-vip-text-muted block">{t('playerUid')}</span>
                  <span className="text-base font-mono font-bold text-white tracking-wider">{order.playerUid}</span>
                </div>
                <div>
                  <span className="text-xs text-vip-text-muted block">{t('playerName')}</span>
                  <span className="text-base font-semibold text-white">
                    {order.playerName || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-vip-text-muted block">{t('diamonds')}</span>
                  <span className="text-base font-extrabold text-vip-gold flex items-center gap-1">
                    <Gem className="w-4 h-4" />
                    {order.diamonds?.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-vip-text-muted block">{t('finalPrice')}</span>
                  <span className="text-xl font-extrabold text-vip-success font-mono">
                    {formatPrice(order.finalPrice)}
                  </span>
                </div>
              </div>

              {/* Price Details row */}
              <div className="mt-4 pt-3 border-t border-vip-border/30 flex flex-wrap items-center justify-between gap-3 text-xs text-vip-text-secondary">
                <div className="flex items-center gap-4">
                  <span>{t('originalPrice')}: {formatPrice(order.originalPrice)}</span>
                  {order.discountAmount > 0 && (
                    <span className="text-vip-gold">
                      {t('discount')}: {formatPrice(order.discountAmount)}
                    </span>
                  )}
                </div>
                <div>
                  <span>{t('paymentMethod')}: </span>
                  <span className="text-white font-semibold">
                    {getPaymentMethodLabel(order.paymentMethod, language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Payment Callout (if order is awaiting receipt) */}
            {order.status === 'PENDING_PAYMENT' && (
              <div className="p-5 rounded-2xl bg-vip-warning/10 border border-vip-warning/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-vip-warning flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {language === 'ar' ? 'طلبك في انتظار استلام إيصال الدفع' : 'Awaiting payment receipt upload'}
                    </h4>
                    <p className="text-xs text-vip-text-secondary mt-0.5">
                      {language === 'ar'
                        ? 'يرجى تحويل المبلغ المطلوب ورفع صورة الإيصال ليتم مراجعة الطلب وتنفيذه فورا.'
                        : 'Please transfer the payment and upload the transfer receipt to process your order.'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push(`/checkout?orderNumber=${order.orderNumber}`)}
                  className="whitespace-nowrap px-6 font-bold shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                >
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                  <span>{language === 'ar' ? 'رفع الإيصال الآن' : 'Upload Receipt Now'}</span>
                </Button>
              </div>
            )}

            {/* If Rejected or Refunded */}
            {isTerminated && (
              <div className="p-5 rounded-2xl bg-vip-error/10 border border-vip-error/30 flex items-center gap-3 text-vip-error">
                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-base">
                    {order.status === 'REJECTED'
                      ? language === 'ar' ? 'تم رفض الطلب' : 'Order Rejected'
                      : language === 'ar' ? 'تم استرداد الطلب' : 'Order Refunded'}
                  </h4>
                  <p className="text-xs text-vip-text-secondary mt-0.5">
                    {language === 'ar'
                      ? 'يرجى التواصل مع خدمة العملاء للمساعدة أو إعادة المحاولة بإيصال صالح.'
                      : 'Please contact customer support for assistance or retry with a valid receipt.'}
                  </p>
                </div>
              </div>
            )}

            {/* Horizontal Step Progression Bar (if not terminated) */}
            {!isTerminated && (
              <Card className="p-6 md:p-8 neon-border">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-vip-purple-light" />
                  <span>{language === 'ar' ? 'مراحل تنفيذ الطلب' : 'Order Progress'}</span>
                </h3>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-vip-border z-0" />
                  <div
                    className="hidden sm:block absolute top-5 left-8 h-1 bg-gradient-to-r from-vip-purple via-vip-blue to-vip-success z-0 transition-all duration-500"
                    style={{
                      width: `${(Math.max(0, currentStepIndex) / (STANDARD_STEPS.length - 1)) * 100}%`,
                    }}
                  />

                  {/* Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                    {STANDARD_STEPS.map((s, idx) => {
                      const isComplete = currentStepIndex > idx;
                      const isCurrent = currentStepIndex === idx;
                      const isFuture = currentStepIndex < idx;

                      return (
                        <div key={s.status} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 flex-shrink-0',
                              isComplete && 'bg-vip-success text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]',
                              isCurrent && 'bg-vip-purple text-white shadow-[0_0_20px_rgba(124,58,237,0.6)] ring-4 ring-vip-purple/20 scale-110',
                              isFuture && 'bg-vip-card text-vip-text-muted border border-vip-border'
                            )}
                          >
                            {isComplete ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : isCurrent ? (
                              <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div>
                            <p
                              className={cn(
                                'text-xs font-bold transition-colors',
                                isCurrent ? 'text-vip-purple-light text-sm' : isComplete ? 'text-white' : 'text-vip-text-muted'
                              )}
                            >
                              {language === 'ar' ? s.labelAr : s.labelEn}
                            </p>
                            <p className="text-[11px] text-vip-text-secondary hidden sm:block mt-0.5">
                              {language === 'ar' ? s.descAr : s.descEn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Vertical Status Timeline (Audit trail) */}
            <Card className="p-6 md:p-8 neon-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-vip-blue/20 flex items-center justify-center text-vip-blue">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('statusTimeline')}</h3>
                    <p className="text-xs text-vip-text-secondary">
                      {language === 'ar' ? 'سجل العمليات والتحديثات الخاصة بطلبك' : 'Detailed timeline of updates on your order'}
                    </p>
                  </div>
                </div>
              </div>

              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div className="relative space-y-6 before:absolute before:inset-0 before:left-3.5 rtl:before:right-3.5 rtl:before:left-auto before:h-full before:w-0.5 before:bg-vip-border">
                  {order.statusHistory.map((item: StatusHistoryEntry, index: number) => {
                    const isLatest = index === order.statusHistory.length - 1;
                    return (
                      <div key={item.id || index} className="relative flex items-start gap-4">
                        {/* Dot indicator */}
                        <div
                          className={cn(
                            'relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-vip-card transition-all',
                            isLatest
                              ? 'border-vip-purple bg-vip-purple/20 text-vip-purple shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                              : 'border-vip-border-light text-vip-text-muted'
                          )}
                        >
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              isLatest ? 'bg-vip-purple animate-pulse' : 'bg-vip-text-muted'
                            )}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 rounded-xl bg-vip-bg border border-vip-border/80">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <Badge status={item.status} lang={language} />
                              <span className="text-sm font-bold text-white">
                                {getStatusLabel(item.status, language)}
                              </span>
                            </div>
                            <span className="text-xs text-vip-text-muted font-mono">
                              {formatDate(item.createdAt, language)}
                            </span>
                          </div>

                          {item.note && (
                            <p className="text-xs text-vip-text-secondary mt-2 pt-2 border-t border-vip-border/40">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-vip-bg border border-vip-border text-center text-xs text-vip-text-muted">
                  {language === 'ar' ? 'لا توجد تحديثات إضافية حتى الآن.' : 'No additional updates recorded yet.'}
                </div>
              )}
            </Card>

            {/* Back to Home / Topup CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                variant="primary"
                onClick={() => router.push('/topup')}
                className="px-8 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
              >
                <Gem className="w-4 h-4 ml-2" />
                <span>{language === 'ar' ? 'شحن طلب جديد' : 'New Top Up Order'}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="px-6 text-vip-text-secondary hover:text-white"
              >
                <span>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-vip-bg flex items-center justify-center">
          <LoadingSpinner size="lg" text="جاري التحميل..." />
        </div>
      }
    >
      <TrackInner />
    </Suspense>
  );
}
