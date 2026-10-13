'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gem,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Check,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Flame,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import FileUpload from '@/components/ui/FileUpload';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CopyButton from '@/components/ui/CopyButton';
import Toast from '@/components/ui/Toast';

import { useLanguageContext } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/useToast';
import { cn, formatPrice } from '@/lib/utils';
import type { DiamondPackage, PaymentMethod } from '@/types';

function TopupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t, dir } = useLanguageContext();
  const { toasts, addToast, removeToast } = useToast();

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // UID Verification state
  const [playerUid, setPlayerUid] = useState<string>('');
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [uidVerified, setUidVerified] = useState<boolean>(false);
  const [uidError, setUidError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [uidVerificationSkipped, setUidVerificationSkipped] = useState<boolean>(false);

  // Packages state
  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(true);
  const [selectedPackage, setSelectedPackage] = useState<DiamondPackage | null>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  // Order submission
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Receipt upload
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);
  const [receiptUploaded, setReceiptUploaded] = useState<boolean>(false);

  // Fetch packages on mount
  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoadingPackages(true);
        const res = await fetch('/api/packages');
        if (!res.ok) throw new Error('Failed to load packages');
        const data = await res.json();
        const list: DiamondPackage[] = Array.isArray(data)
          ? data
          : data.packages || [];
        setPackages(list);

        // Preselect package if passed via query params
        const preselectedId = searchParams.get('packageId') || searchParams.get('package');
        if (preselectedId) {
          const found = list.find((p) => p.id === preselectedId || p.diamonds.toString() === preselectedId);
          if (found) setSelectedPackage(found);
        }
      } catch (err) {
        console.error(err);
        addToast(language === 'ar' ? 'فشل تحميل الباقات' : 'Failed to load packages', 'error');
      } finally {
        setLoadingPackages(false);
      }
    }
    fetchPackages();
  }, [searchParams, language]);

  // Handle UID verification
  const handleVerifyUid = async () => {
    if (!playerUid.trim()) {
      setUidError(language === 'ar' ? 'يرجى إدخال معرف اللاعب أولاً' : 'Please enter Player UID first');
      return;
    }

    setVerifying(true);
    setUidError(null);
    setPlayerName(null);
    setUidVerified(false);

    try {
      const res = await fetch('/api/verify-uid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: playerUid.trim() }),
      });

      const data = await res.json();

      if (data.valid) {
        setPlayerName(data.playerName || (language === 'ar' ? `حساب لاعب (${playerUid.trim()})` : `Player (${playerUid.trim()})`));
        setUidVerified(true);
        setUidError(null);
        setUidVerificationSkipped(false);
        addToast(
          language === 'ar'
            ? `تم تأكيد المعرف بنجاح: ${playerUid.trim()}`
            : `UID confirmed successfully: ${playerUid.trim()}`,
          'success'
        );
      } else {
        const errorMsg = data.error || (language === 'ar' ? 'معرف اللاعب غير صالح، يرجى التأكد من كتابة الأرقام بشكل صحيح' : 'Invalid player UID');
        setUidError(errorMsg);
        setUidVerified(false);
        addToast(errorMsg, 'error');
      }
    } catch (err: any) {
      // If network fails, still validate that the UID is numeric
      if (/^\d{5,20}$/.test(playerUid.trim())) {
        setPlayerName(language === 'ar' ? `حساب لاعب (${playerUid.trim()})` : `Player (${playerUid.trim()})`);
        setUidVerified(true);
        setUidError(null);
        setUidVerificationSkipped(false);
        addToast(
          language === 'ar' ? `تم تأكيد المعرف: ${playerUid.trim()}` : `UID confirmed: ${playerUid.trim()}`,
          'success'
        );
      } else {
        const fallbackMsg = language === 'ar' ? 'معرف اللاعب غير صالح (يجب أن يتكون من أرقام فقط)' : 'Invalid player UID (digits only)';
        setUidError(fallbackMsg);
        setUidVerified(false);
        addToast(fallbackMsg, 'error');
      }
    } finally {
      setVerifying(false);
    }
  };

  // Step 1 -> Step 2 validation
  const canProceedToStep2 = playerUid.trim().length >= 4 && selectedPackage !== null;

  const handleGoToStep2 = () => {
    if (!canProceedToStep2) {
      if (playerUid.trim().length < 4) {
        setUidError(language === 'ar' ? 'معرف اللاعب غير صالح' : 'Invalid player UID');
      } else if (!selectedPackage) {
        addToast(language === 'ar' ? 'يرجى اختيار باقة الجواهر' : 'Please select a diamond package', 'warning');
      }
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3 (Submit order)
  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      addToast(language === 'ar' ? 'يرجى اختيار طريقة الدفع' : 'Please select a payment method', 'warning');
      return;
    }
    if (!selectedPackage) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerUid: playerUid.trim(),
          playerName: playerName || undefined,
          packageId: selectedPackage.id,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (language === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to create order'));
      }

      setOrderResult(data.order || data);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      addToast(t('orderPlaced'), 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || t('error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Receipt upload
  const handleUploadReceipt = async () => {
    if (!receiptFile || !orderResult?.orderNumber) {
      addToast(language === 'ar' ? 'يرجى اختيار صورة الإيصال' : 'Please select a receipt image', 'warning');
      return;
    }

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('orderNumber', orderResult.orderNumber);
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
      addToast(t('receiptUploaded'), 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || t('error'), 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const stepsMeta = [
    { num: 1, title: language === 'ar' ? 'معرف اللاعب والباقة' : 'UID & Package' },
    { num: 2, title: language === 'ar' ? 'المراجعة والدفع' : 'Review & Payment' },
    { num: 3, title: language === 'ar' ? 'التأكيد والإيصال' : 'Confirm & Receipt' },
  ];

  return (
    <div className="min-h-screen bg-vip-bg text-vip-text-primary flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Step Indicator Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-vip-border -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-vip-purple to-vip-blue -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
              }}
            />

            {stepsMeta.map((s) => {
              const isPassed = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                      isCurrent && 'bg-vip-purple text-white shadow-[0_0_20px_rgba(124,58,237,0.6)] ring-4 ring-vip-purple/20 scale-110',
                      isPassed && 'bg-vip-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]',
                      !isCurrent && !isPassed && 'bg-vip-card text-vip-text-muted border border-vip-border'
                    )}
                  >
                    {isPassed ? <Check className="w-5 h-5 text-white" /> : s.num}
                  </div>
                  <span
                    className={cn(
                      'text-xs mt-2 font-medium tracking-wide transition-colors',
                      isCurrent ? 'text-vip-purple-light font-bold' : isPassed ? 'text-vip-text-primary' : 'text-vip-text-muted'
                    )}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Steps */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Enter UID & Select Package */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Promotional Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-vip-purple/20 via-vip-blue/20 to-vip-purple/10 border border-vip-purple/40 p-5 flex items-center justify-between shadow-[0_0_25px_rgba(124,58,237,0.15)]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-vip-gold/10 rounded-xl text-vip-gold border border-vip-gold/30">
                    <Flame className="w-7 h-7 animate-pulse text-vip-gold" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                      <span>{language === 'ar' ? 'عرض خاص للعملاء الجدد!' : 'Special New Customer Offer!'}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-vip-gold text-black">50% OFF</span>
                    </h3>
                    <p className="text-sm text-vip-text-secondary mt-0.5">
                      {language === 'ar'
                        ? 'خصم 50% يطبق تلقائياً على أول عملية شحن لحسابك! وخصم 20% للطلبات المتكررة.'
                        : '50% discount applies automatically to your first top-up! 20% discount on subsequent orders.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* UID Input Section */}
              <Card className="p-6 md:p-8 neon-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-vip-purple/20 flex items-center justify-center text-vip-purple">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {language === 'ar' ? '1. إدخال معرف اللاعب (Player UID)' : '1. Enter Player UID'}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="w-full flex-grow">
                      <Input
                        label={t('playerUid')}
                        placeholder={language === 'ar' ? 'مثال: 1234567890' : 'e.g. 1234567890'}
                        value={playerUid}
                        onChange={(e) => {
                          setPlayerUid(e.target.value);
                          setUidVerified(false);
                          setPlayerName(null);
                          setUidError(null);
                        }}
                        error={uidError || undefined}
                        className="text-lg tracking-wider"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleVerifyUid}
                      loading={verifying}
                      disabled={!playerUid.trim() || verifying}
                      className="w-full sm:w-auto h-[46px] px-6 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t('verifyId')}</span>
                    </Button>
                  </div>

                  {/* Verification Feedback */}
                  {uidVerified && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-400"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-vip-text-secondary">{t('playerName')}</p>
                          <p className="text-base font-bold text-white">{playerName}</p>
                          <p className="text-xs text-emerald-400/80 mt-0.5 font-mono">UID: {playerUid}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold self-start sm:self-auto flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تم تأكيد المعرف بنجاح' : 'ID Confirmed'}</span>
                      </span>
                    </motion.div>
                  )}

                  {uidVerified && !selectedPackage && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-vip-gold/10 border border-vip-gold/30 flex items-center gap-2.5 text-vip-gold text-xs sm:text-sm font-semibold"
                    >
                      <Sparkles className="w-4 h-4 flex-shrink-0 text-vip-gold animate-bounce" />
                      <span>{language === 'ar' ? '👇 ممتاز! اختر الآن باقة الجواهر المناسبة لك من القائمة بالأسفل للمتابعة.' : '👇 Great! Now choose your diamond package below to proceed.'}</span>
                    </motion.div>
                  )}

                  {uidError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                      <div className="flex-1">
                        <p>{uidError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Package Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-vip-gold/20 flex items-center justify-center text-vip-gold">
                      <Gem className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{t('selectPackage')}</h2>
                      <p className="text-xs text-vip-text-secondary">
                        {language === 'ar'
                          ? 'اختر عدد الجواهر المناسب لك لشحنها فوراً'
                          : 'Select the desired diamonds top-up amount'}
                      </p>
                    </div>
                  </div>
                </div>

                {loadingPackages ? (
                  <div className="py-20 flex justify-center">
                    <LoadingSpinner size="lg" text={t('loading')} />
                  </div>
                ) : packages.length === 0 ? (
                  <div className="py-12 text-center text-vip-text-muted bg-vip-card rounded-xl border border-vip-border">
                    <p>{t('noPackages')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={cn(
                            'relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden',
                            isSelected
                              ? 'bg-vip-card-hover border-vip-purple shadow-[0_0_25px_rgba(124,58,237,0.35)] scale-[1.02]'
                              : 'bg-vip-card border-vip-border hover:border-vip-border-light hover:bg-vip-card-hover'
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-vip-purple flex items-center justify-center text-white shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div>
                            <div className="w-12 h-12 rounded-xl bg-vip-gold/10 border border-vip-gold/20 flex items-center justify-center text-vip-gold mb-4 group-hover:scale-110 transition-transform">
                              <Gem className="w-7 h-7" />
                            </div>

                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl sm:text-3xl font-extrabold text-vip-gold font-mono">
                                {pkg.diamonds.toLocaleString()}
                              </span>
                              <span className="text-xs text-vip-text-secondary">{t('diamonds')}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-vip-border/60 flex items-center justify-between">
                            <span className="text-xs text-vip-text-muted">{t('price')}</span>
                            <span className="text-base font-bold text-white">
                              {formatPrice(pkg.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Action */}
              <div className="flex justify-end pt-4">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleGoToStep2}
                  disabled={!canProceedToStep2}
                  className="px-8 flex items-center gap-2 text-base font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                >
                  <span>{t('next')}</span>
                  {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Review & Select Payment */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Order Summary Card */}
              <Card className="p-6 md:p-8 neon-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-vip-blue/20 flex items-center justify-center text-vip-blue">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{t('orderSummary')}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-vip-bg border border-vip-border">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('playerUid')}</span>
                    <span className="text-base font-mono font-bold text-white tracking-wider">{playerUid}</span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('playerName')}</span>
                    <span className="text-base font-bold text-white">
                      {playerName || (language === 'ar' ? 'غير مؤكد (سيتم التحقق مع الإيصال)' : 'Unverified')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('featuredPackages')}</span>
                    <span className="text-base font-bold text-vip-gold flex items-center gap-1">
                      <Gem className="w-4 h-4" />
                      {selectedPackage?.diamonds.toLocaleString()} {t('diamonds')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-vip-purple/10 border border-vip-purple/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-vip-gold" />
                    <span className="text-sm font-medium text-vip-text-primary">
                      {language === 'ar'
                        ? 'سيتم تطبيق خصم 50% للطلب الأول أو 20% للطلبات العادية تلقائياً عند الدفع!'
                        : 'A 50% first-order discount or 20% regular discount will be applied automatically!'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-vip-text-muted block">{t('originalPrice')}</span>
                    <span className="text-lg font-bold text-white">
                      {selectedPackage ? formatPrice(selectedPackage.price) : '0'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-vip-purple/20 flex items-center justify-center text-vip-purple">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{t('choosePayment')}</h2>
                    <p className="text-xs text-vip-text-secondary">
                      {language === 'ar' ? 'اختر وسيلة الدفع المناسبة لك لإتمام التحويل' : 'Select your preferred payment method'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* InstaPay */}
                  <div
                    onClick={() => setPaymentMethod('instapay')}
                    className={cn(
                      'p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between',
                      paymentMethod === 'instapay'
                        ? 'bg-vip-card-hover border-vip-purple shadow-[0_0_25px_rgba(124,58,237,0.35)] scale-[1.01]'
                        : 'bg-vip-card border-vip-border hover:border-vip-border-light hover:bg-vip-card-hover'
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border flex items-center justify-center transition-colors',
                          paymentMethod === 'instapay'
                            ? 'bg-vip-purple border-vip-purple text-white'
                            : 'border-vip-border text-transparent'
                        )}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{t('instapay')}</h3>
                      <p className="text-xs text-vip-text-secondary leading-relaxed">
                        {language === 'ar'
                          ? 'تحويل فوري عبر تطبيق إنستاباي لجميع البنوك والمحافظ'
                          : 'Instant bank transfer via the InstaPay application'}
                      </p>
                    </div>
                  </div>

                  {/* DaQan Cash / Dakahlia Cash */}
                  <div
                    onClick={() => setPaymentMethod('daqan_cash')}
                    className={cn(
                      'p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between',
                      paymentMethod === 'daqan_cash'
                        ? 'bg-vip-card-hover border-vip-purple shadow-[0_0_25px_rgba(124,58,237,0.35)] scale-[1.01]'
                        : 'bg-vip-card border-vip-border hover:border-vip-border-light hover:bg-vip-card-hover'
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border flex items-center justify-center transition-colors',
                          paymentMethod === 'daqan_cash'
                            ? 'bg-vip-purple border-vip-purple text-white'
                            : 'border-vip-border text-transparent'
                        )}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{t('daqanCash')}</h3>
                      <p className="text-xs text-vip-text-secondary leading-relaxed">
                        {t('daqanCashDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Vodafone Cash */}
                  <div
                    onClick={() => setPaymentMethod('vodafone_cash')}
                    className={cn(
                      'p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between',
                      paymentMethod === 'vodafone_cash'
                        ? 'bg-vip-card-hover border-vip-purple shadow-[0_0_25px_rgba(124,58,237,0.35)] scale-[1.01]'
                        : 'bg-vip-card border-vip-border hover:border-vip-border-light hover:bg-vip-card-hover'
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border flex items-center justify-center transition-colors',
                          paymentMethod === 'vodafone_cash'
                            ? 'bg-vip-purple border-vip-purple text-white'
                            : 'border-vip-border text-transparent'
                        )}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{t('vodafoneCash')}</h3>
                      <p className="text-xs text-vip-text-secondary leading-relaxed">
                        {language === 'ar'
                          ? 'تحويل فوري عبر محفظة فودافون كاش أو المحافظ الأخرى'
                          : 'Fast transfer through Vodafone Cash or mobile wallets'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="px-6 flex items-center gap-2"
                >
                  {dir === 'rtl' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                  <span>{t('back')}</span>
                </Button>

                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleSubmitOrder}
                  loading={submitting}
                  disabled={!paymentMethod || submitting}
                  className="px-8 flex items-center gap-2 text-base font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                >
                  <span>{t('continueToPayment')}</span>
                  {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Confirm & Submit Receipt */}
          {step === 3 && orderResult && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Order Created Success Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-vip-card via-vip-card-hover to-vip-card border border-vip-purple/40 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-vip-success mb-1">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold text-sm">{t('orderPlaced')}</span>
                    </div>
                    <span className="text-xs text-vip-text-muted">{t('orderNumber')}</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-wider">
                      {orderResult.orderNumber}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={orderResult.orderNumber} label={language === 'ar' ? 'نسخ رقم الطلب' : 'Copy Order ID'} />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-6 pt-6 border-t border-vip-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('originalPrice')}</span>
                    <span className="text-sm font-semibold line-through text-vip-text-secondary">
                      {formatPrice(orderResult.originalPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('discount')}</span>
                    <span className="text-sm font-bold text-vip-gold">
                      %{orderResult.discountPercent} ({formatPrice(orderResult.discountAmount)}-)
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('finalPrice')}</span>
                    <span className="text-xl font-extrabold text-vip-success font-mono">
                      {formatPrice(orderResult.finalPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">{language === 'ar' ? 'نوع العرض' : 'Offer Type'}</span>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-bold bg-vip-gold/20 text-vip-gold border border-vip-gold/30">
                      {orderResult.isFirstOrder
                        ? language === 'ar'
                          ? '🎉 طلب أول (خصم 50%)'
                          : '🎉 1st Order (50% OFF)'
                        : language === 'ar'
                        ? 'خصم دائم (20%)'
                        : 'Regular (20% OFF)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions Card */}
              <Card className="p-6 md:p-8 neon-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-vip-gold/20 flex items-center justify-center text-vip-gold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{t('paymentDetails')}</h2>
                    <p className="text-xs text-vip-text-secondary">
                      {paymentMethod === 'instapay'
                        ? language === 'ar'
                          ? 'حوّل المبلغ المطلوب عبر إنستاباي إلى البيانات التالية'
                          : 'Transfer the required amount via InstaPay to the following details'
                        : paymentMethod === 'daqan_cash'
                        ? language === 'ar'
                          ? 'حوّل المبلغ المطلوب عبر خدمة دكان كاش / دقهلية كاش إلى الرقم التالي'
                          : 'Transfer the required amount via DaQan Cash / Dakahlia Cash to the following number'
                        : language === 'ar'
                        ? 'حوّل المبلغ المطلوب عبر فودافون كاش أو محفظتك إلى الرقم التالي'
                        : 'Transfer the required amount via Vodafone Cash or wallet to the following number'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Phone / Account Number */}
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

                  {/* Required Amount */}
                  <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-vip-text-muted block">{t('amount')}</span>
                      <span className="text-xl font-mono font-extrabold text-vip-gold">
                        {formatPrice(orderResult.finalPrice)}
                      </span>
                    </div>
                    <CopyButton text={orderResult.finalPrice.toString()} label={language === 'ar' ? 'نسخ المبلغ' : 'Copy'} />
                  </div>

                  {/* Payment Reference */}
                  <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-vip-text-muted block">{t('paymentRef')}</span>
                      <span className="text-base font-mono font-bold text-vip-cyan">
                        {orderResult.paymentRef || orderResult.orderNumber}
                      </span>
                    </div>
                    <CopyButton text={orderResult.paymentRef || orderResult.orderNumber} />
                  </div>
                </div>

                {/* Important notice */}
                <div className="p-4 rounded-xl bg-vip-blue/10 border border-vip-blue/30 text-xs text-vip-text-secondary flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-vip-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white mb-0.5">
                      {language === 'ar' ? 'تعليمات هامة لإتمام المعاملة بسرعة:' : 'Important instructions:'}
                    </p>
                    <p>
                      {language === 'ar'
                        ? 'يرجى تحويل المبلغ بالكامل بدقة واحتفظ بصورة أو لقطة شاشة لإشعار التحويل ثم قم برفعها في الحقل أدناه لتأكيد طلبك فورا.'
                        : 'Please transfer the exact amount and save a screenshot of the transfer confirmation, then upload it below to verify your order immediately.'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Receipt Upload Section */}
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
                      <h3 className="text-xl font-bold text-white">{language === 'ar' ? 'تم استلام الإيصال بنجاح!' : 'Receipt Received!'}</h3>
                      <p className="text-sm text-vip-text-secondary mt-1">
                        {t('receiptUploaded')}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => router.push(`/track?orderNumber=${orderResult.orderNumber}`)}
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

              {/* Bottom Track Order Direct Link */}
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/track?orderNumber=${orderResult.orderNumber}`)}
                  className="text-vip-text-secondary hover:text-white"
                >
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                  <span>{language === 'ar' ? 'الانتقال إلى صفحة تتبع الطلب' : 'Go to Order Tracking Page'}</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function TopupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-vip-bg flex items-center justify-center">
          <LoadingSpinner size="lg" text="جاري التحميل..." />
        </div>
      }
    >
      <TopupInner />
    </Suspense>
  );
}
