'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Gem,
  CheckCircle2,
  AlertCircle,
  Copy,
  Zap,
  ExternalLink,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Clock,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import FileUpload from '@/components/ui/FileUpload';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CopyButton from '@/components/ui/CopyButton';
import Toast from '@/components/ui/Toast';

import { useLanguageContext } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/useToast';
import { cn, formatPrice, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import { soundFx } from '@/lib/sound';
import { WhatsAppIcon } from '@/components/ui/WhatsAppHelpButton';
import type { OrderTrackingResult, PaymentMethod } from '@/types';

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  const { language, t, dir } = useLanguageContext();
  const { toasts, addToast, removeToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<OrderTrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);
  const [receiptUploaded, setReceiptUploaded] = useState<boolean>(false);

  // If no order number, redirect to topup
  useEffect(() => {
    if (!orderNumber) {
      router.replace('/topup');
    }
  }, [orderNumber, router]);

  // Fetch order details
  useEffect(() => {
    if (!orderNumber) return;

    async function fetchOrder() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/track?orderNumber=${encodeURIComponent(orderNumber!)}`);
        if (!res.ok) {
          if (res.status === 404) {
            // Check local storage fallback
            try {
              const stored = localStorage.getItem('vip_orders');
              if (stored) {
                const list = JSON.parse(stored);
                const found = list.find((o: any) => o.orderNumber === orderNumber);
                if (found) {
                  setOrder(found);
                  if (found.status !== 'PENDING_PAYMENT') setReceiptUploaded(true);
                  return;
                }
              }
            } catch (e) {}
            throw new Error(t('orderNotFound'));
          }
          throw new Error(language === 'ar' ? 'فشل تحميل بيانات الطلب' : 'Failed to fetch order details');
        }
        const data = await res.json();
        const orderData = data.order || data;
        setOrder(orderData);

        if (orderData.status !== 'PENDING_PAYMENT') {
          setReceiptUploaded(true);
        }
      } catch (err: any) {
        // Fallback on error
        try {
          const stored = localStorage.getItem('vip_orders');
          if (stored) {
            const list = JSON.parse(stored);
            const found = list.find((o: any) => o.orderNumber === orderNumber);
            if (found) {
              setOrder(found);
              if (found.status !== 'PENDING_PAYMENT') setReceiptUploaded(true);
              return;
            }
          }
        } catch (e) {}
        console.error(err);
        setError(err.message || t('error'));
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber, language, t]);

  // Handle receipt upload
  const handleUploadReceipt = async () => {
    if (!receiptFile || !orderNumber) {
      addToast(language === 'ar' ? 'يرجى اختيار صورة الإيصال أولاً' : 'Please select a receipt image first', 'warning');
      return;
    }

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('orderNumber', orderNumber);
      formData.append('receipt', receiptFile);

      const res = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (language === 'ar' ? 'فشل رفع الإيصال' : 'Failed to upload receipt'));
      }

      setReceiptUploaded(true);
      soundFx.playReceiptUploaded();
      addToast(t('receiptUploaded'), 'success');

      // Update order status locally
      if (order) {
        setOrder({
          ...order,
          status: 'UNDER_REVIEW',
        });
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || t('error'), 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="min-h-screen bg-vip-bg text-vip-text-primary flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" text={t('loading')} />
          </div>
        ) : error || !order ? (
          <Card className="p-8 text-center neon-border max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-vip-error/10 border border-vip-error/30 flex items-center justify-center text-vip-error mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {error || t('orderNotFound')}
              </h2>
              <p className="text-sm text-vip-text-secondary">
                {language === 'ar'
                  ? `لم نتمكن من العثور على طلب برقم: ${orderNumber}`
                  : `Could not find order with reference: ${orderNumber}`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="primary"
                onClick={() => router.push('/topup')}
                className="px-6"
              >
                <span>{t('topupNow')}</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push('/track')}
                className="px-6"
              >
                <span>{t('trackOrder')}</span>
              </Button>
            </div>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Header & Order Info Banner */}
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-vip-card via-vip-card-hover to-vip-card border border-vip-purple/40 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs uppercase tracking-wider text-vip-text-muted">{t('orderNumber')}</span>
                    <Badge status={order.status} lang={language} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-wider">
                    {order.orderNumber}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <CopyButton text={order.orderNumber} label={language === 'ar' ? 'نسخ رقم الطلب' : 'Copy'} />
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="mt-6 pt-6 border-t border-vip-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-vip-text-muted block">{t('playerUid')}</span>
                  <span className="text-base font-mono font-bold text-white tracking-wider">{order.playerUid}</span>
                </div>
                <div>
                  <span className="text-xs text-vip-text-muted block">
                    {order.packageName ? (language === 'ar' ? 'الباقة / العرض' : 'Package') : t('diamonds')}
                  </span>
                  <span className="text-base font-extrabold text-vip-gold flex items-center gap-1">
                    <Gem className="w-4 h-4 shrink-0" />
                    <span className="truncate">{order.packageName || `${order.diamonds?.toLocaleString()} ${t('diamonds')}`}</span>
                  </span>
                </div>
                <div>
                  <span className="text-xs text-vip-text-muted block">{t('finalPrice')}</span>
                  <span className="text-xl font-extrabold text-vip-success font-mono">
                    {formatPrice(order.finalPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-vip-text-muted block">{t('paymentMethod')}</span>
                  <span className="text-sm font-semibold text-white">
                    {getPaymentMethodLabel(order.paymentMethod, language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Transfer Information */}
            <Card className="p-6 md:p-8 neon-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-vip-gold/20 flex items-center justify-center text-vip-gold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t('paymentDetails')}</h2>
                  <p className="text-xs text-vip-text-secondary">
                    {language === 'ar'
                      ? 'قم بتحويل المبلغ المطلوب لحساب VIP STORE وأرسل الإيصال'
                      : 'Transfer the required amount to VIP STORE and submit the receipt'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Phone / Target Number */}
                <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('transferTo')}</span>
                    <span className="text-lg font-mono font-bold text-white tracking-wider">01069954152</span>
                  </div>
                  <CopyButton text="01069954152" />
                </div>

                {/* Recipient Name */}
                <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('recipientName')}</span>
                    <span className="text-lg font-bold text-white">VIP STORE</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-vip-purple/20 text-vip-purple-light">
                    {language === 'ar' ? 'معتمد' : 'Verified'}
                  </span>
                </div>

                {/* Exact Amount */}
                <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('amount')}</span>
                    <span className="text-xl font-mono font-extrabold text-vip-gold">
                      {formatPrice(order.finalPrice)}
                    </span>
                  </div>
                  <CopyButton text={order.finalPrice.toString()} label={language === 'ar' ? 'نسخ المبلغ' : 'Copy'} />
                </div>

                {/* Reference */}
                <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('paymentRef')}</span>
                    <span className="text-base font-mono font-bold text-vip-cyan">{order.orderNumber}</span>
                  </div>
                  <CopyButton text={order.orderNumber} />
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-xl bg-vip-blue/10 border border-vip-blue/30 text-xs text-vip-text-secondary flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-vip-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-0.5">
                    {getPaymentMethodLabel(order.paymentMethod, language)}
                  </p>
                  <p>
                    {language === 'ar'
                      ? 'يرجى التأكد من تحويل المبلغ المطلوب بالكامل والاحتفاظ بصورة من إيصال التحويل، ثم رفعها في الأسفل لمراجعة الطلب وشحن الجواهر فوراً.'
                      : 'Please ensure you transfer the exact amount and save a screenshot or photo of the receipt, then upload it below to verify and complete your order immediately.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Receipt Upload Card */}
            <Card className="p-6 md:p-8 neon-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-vip-cyan/20 flex items-center justify-center text-vip-cyan">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t('uploadReceipt')}</h2>
                  <p className="text-xs text-vip-text-secondary">{t('uploadReceiptDesc')}</p>
                </div>
              </div>

              {receiptUploaded ? (
                <div className="p-6 rounded-2xl bg-vip-success/10 border border-vip-success/40 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-vip-success/20 border border-vip-success/40 flex items-center justify-center text-vip-success mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {order.status === 'UNDER_REVIEW'
                        ? language === 'ar' ? 'طلبك قيد المراجعة!' : 'Your Order is Under Review!'
                        : language === 'ar' ? 'تم استلام الإيصال بنجاح!' : 'Receipt Received!'}
                    </h3>
                    <p className="text-sm text-vip-text-secondary mt-1">
                      {t('receiptUploaded')}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => router.push(`/track?orderNumber=${order.orderNumber}`)}
                      className="px-8 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                    >
                      <ExternalLink className="w-5 h-5 ml-2" />
                      <span>{t('trackOrder')}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <FileUpload
                    onFileSelect={(file) => setReceiptFile(file)}
                    accept="image/*"
                    maxSizeMB={5}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-vip-text-muted">
                      {language === 'ar' ? 'الحد الأقصى لحجم الملف: 5 ميجابايت (PNG, JPG, JPEG)' : 'Max file size: 5MB (PNG, JPG, JPEG)'}
                    </p>

                    <Button
                      size="lg"
                      variant="primary"
                      onClick={handleUploadReceipt}
                      loading={uploadingReceipt}
                      disabled={!receiptFile || uploadingReceipt}
                      className="w-full sm:w-auto px-8 font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                    >
                      <span>{language === 'ar' ? 'تأكيد ورفع الإيصال' : 'Submit Receipt'}</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Direct Link to Track & WhatsApp Support */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => router.push(`/track?orderNumber=${order.orderNumber}`)}
                className="text-vip-text-secondary hover:text-white"
              >
                <ExternalLink className="w-4 h-4 ml-1.5" />
                <span>{language === 'ar' ? 'الانتقال إلى صفحة تتبع الطلب' : 'Track Order Status'}</span>
              </Button>

              <a
                href="https://wa.me//+201069954152"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'مساعدة عبر واتساب' : 'WhatsApp Support'}</span>
              </a>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-vip-bg flex items-center justify-center">
          <LoadingSpinner size="lg" text="جاري التحميل..." />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
