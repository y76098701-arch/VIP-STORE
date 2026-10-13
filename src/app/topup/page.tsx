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
  Lock,
  Percent,
  Crown,
  Gift,
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
import { soundFx } from '@/lib/sound';
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

  // Discount Selection: customer chooses 50% or 20%
  const [selectedDiscount, setSelectedDiscount] = useState<50 | 20>(50);
  const [hasUsed50Discount, setHasUsed50Discount] = useState<boolean>(false);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'DIAMONDS' | 'MEMBERSHIP' | 'AIRDROP'>('ALL');

  // Packages state
  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(true);
  const [selectedPackage, setSelectedPackage] = useState<DiamondPackage | null>(null);

  // Payment method: only instapay or vodafone_cash
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

  // Handle UID verification and check if 50% was already used
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

        // Check if 50% discount was already used
        if (data.hasUsed50Discount) {
          setHasUsed50Discount(true);
          setSelectedDiscount(20);
          addToast(
            language === 'ar'
              ? 'تم التحقق من الحساب: تم استخدام خصم 50% مسبقاً، تم تفعيل خصم 20% الدائم مدى الحياة!'
              : 'UID confirmed: 50% discount already used, 20% permanent discount applied!',
            'info'
          );
        } else {
          setHasUsed50Discount(false);
          setSelectedDiscount(50);
          addToast(
            language === 'ar'
              ? `تم تأكيد المعرف بنجاح (${playerUid.trim()}) - مؤهل لخصم 50% الترحيبي!`
              : `UID confirmed (${playerUid.trim()}) - Eligible for 50% discount!`,
            'success'
          );
        }
      } else {
        const errorMsg = data.error || (language === 'ar' ? 'معرف اللاعب غير صالح، يرجى التأكد من كتابة الأرقام بشكل صحيح' : 'Invalid player UID');
        setUidError(errorMsg);
        setUidVerified(false);
        addToast(errorMsg, 'error');
      }
    } catch (err: any) {
      if (/^\d{5,20}$/.test(playerUid.trim())) {
        setPlayerName(language === 'ar' ? `حساب لاعب (${playerUid.trim()})` : `Player (${playerUid.trim()})`);
        setUidVerified(true);
        setUidError(null);
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
          selectedDiscount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (language === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to create order'));
      }

      const createdOrder = data.order || data;
      setOrderResult(createdOrder);

      // Play subtle triumphant VIP chime
      soundFx.playOrderPlaced();

      // Save order in localStorage so it can never be lost on tracking search
      try {
        const existing = JSON.parse(localStorage.getItem('vip_orders') || '[]');
        const updated = [createdOrder, ...existing.filter((o: any) => o.orderNumber !== createdOrder.orderNumber)].slice(0, 20);
        localStorage.setItem('vip_orders', JSON.stringify(updated));
        localStorage.setItem('vip_latest_order', JSON.stringify(createdOrder));
      } catch (e) {
        console.warn('Failed to store order in localStorage:', e);
      }

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
      // Play crystal level-up completion sound
      soundFx.playReceiptUploaded();
      addToast(t('receiptUploaded'), 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || t('error'), 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Helper calculation for package prices given selectedDiscount
  const calcDiscountedPrice = (origPrice: number) => {
    const rate = selectedDiscount / 100;
    const discount = Math.round(origPrice * rate * 100) / 100;
    return Math.max(0, Math.round((origPrice - discount) * 100) / 100);
  };

  const stepsMeta = [
    { num: 1, title: language === 'ar' ? 'المعرف والباقة والخصم' : 'UID, Package & Discount' },
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
          {/* STEP 1: Enter UID, Choose Discount, Select Package */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* UID Input Section */}
              <Card className="p-6 md:p-8 neon-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-vip-purple/20 flex items-center justify-center text-vip-purple">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {language === 'ar' ? '1. إدخال معرف اللاعب (Free Fire UID)' : '1. Enter Player UID'}
                    </h2>
                    <p className="text-xs text-vip-text-secondary mt-0.5">
                      {language === 'ar' ? 'أدخل الـ ID الخاص بك للتحقق من الحساب وأهلية العرض الترحيبي' : 'Enter your UID to check account and discount eligibility'}
                    </p>
                  </div>
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

              {/* Customer Discount Selector Section */}
              <Card className="p-6 md:p-8 neon-border bg-gradient-to-br from-vip-card via-[#151228] to-vip-card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-vip-gold/20 flex items-center justify-center text-vip-gold">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {language === 'ar' ? '2. اختر الخصم الذي تريده' : '2. Choose Your Discount'}
                    </h2>
                    <p className="text-xs text-vip-text-secondary">
                      {language === 'ar'
                        ? 'اختر العرض المناسب لك: خصم 50% لمرة واحدة لأول طلب، أو خصم 20% دائم مدى الحياة'
                        : 'Select your offer: 50% one-time welcome discount or 20% permanent lifetime discount'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: 50% Discount (One-time use) */}
                  <div
                    onClick={() => {
                      if (!hasUsed50Discount) {
                        setSelectedDiscount(50);
                      } else {
                        addToast(
                          language === 'ar'
                            ? 'تم استخدام خصم 50% مسبقاً لهذا الحساب، يمكنك الاستفادة من خصم 20% الدائم مدى الحياة!'
                            : '50% discount has already been used for this UID. Use 20% permanent discount!',
                          'warning'
                        );
                      }
                    }}
                    className={cn(
                      'relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden',
                      hasUsed50Discount
                        ? 'opacity-60 bg-vip-bg/50 border-vip-border cursor-not-allowed'
                        : selectedDiscount === 50
                        ? 'bg-vip-card-hover border-vip-gold shadow-[0_0_25px_rgba(234,179,8,0.3)] ring-2 ring-vip-gold/40 cursor-pointer scale-[1.01]'
                        : 'bg-vip-card border-vip-border hover:border-vip-border-light cursor-pointer hover:bg-vip-card-hover'
                    )}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={cn(
                          'text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1',
                          hasUsed50Discount
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-vip-gold text-black'
                        )}
                      >
                        {hasUsed50Discount ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>{language === 'ar' ? 'مستخدم مسبقاً' : 'Already Used'}</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-3 h-3" />
                            <span>{language === 'ar' ? 'الأوفر (مرة واحدة)' : 'Best Value (1x)'}</span>
                          </>
                        )}
                      </span>

                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border flex items-center justify-center transition-colors',
                          selectedDiscount === 50 && !hasUsed50Discount
                            ? 'bg-vip-gold border-vip-gold text-black'
                            : 'border-vip-border text-transparent'
                        )}
                      >
                        <Check className="w-3.5 h-3.5 font-bold" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-black text-white">50%</span>
                        <span className="text-base font-bold text-vip-gold">
                          {language === 'ar' ? 'خصم الطلب الأول' : 'First Order Discount'}
                        </span>
                      </div>
                      <p className="text-xs text-vip-text-secondary leading-relaxed">
                        {hasUsed50Discount
                          ? language === 'ar'
                            ? 'لقد تم استهلاك هذا العرض مسبقاً لهذا الـ UID. متاح لمرة واحدة فقط لكل لاعب.'
                            : 'This offer was already redeemed for this UID. Valid only once per player.'
                          : language === 'ar'
                          ? 'خصم 50% يطبق لمرة واحدة فقط على هذا المعرف. فرصة لشحن ضعف الجواهر بنصف السعر!'
                          : '50% off valid once per UID. Double diamonds for half price!'}
                      </p>
                    </div>
                  </div>

                  {/* Option 2: 20% Permanent Discount */}
                  <div
                    onClick={() => setSelectedDiscount(20)}
                    className={cn(
                      'relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer',
                      selectedDiscount === 20
                        ? 'bg-vip-card-hover border-vip-purple shadow-[0_0_25px_rgba(124,58,237,0.3)] ring-2 ring-vip-purple/40 scale-[1.01]'
                        : 'bg-vip-card border-vip-border hover:border-vip-border-light hover:bg-vip-card-hover'
                    )}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-vip-purple/20 text-vip-purple-light border border-vip-purple/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{language === 'ar' ? 'دائم مدى الحياة' : 'Lifetime'}</span>
                      </span>

                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border flex items-center justify-center transition-colors',
                          selectedDiscount === 20
                            ? 'bg-vip-purple border-vip-purple text-white'
                            : 'border-vip-border text-transparent'
                        )}
                      >
                        <Check className="w-3.5 h-3.5 font-bold" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-black text-white">20%</span>
                        <span className="text-base font-bold text-vip-purple-light">
                          {language === 'ar' ? 'خصم دائم مدى الحياة' : 'Lifetime 20% Discount'}
                        </span>
                      </div>
                      <p className="text-xs text-vip-text-secondary leading-relaxed">
                        {language === 'ar'
                          ? 'خصم 20% دائم ومستمر لجميع طلباتك المستقبلية على كافة الباقات بدون أي شروط.'
                          : '20% discount on all your orders forever without limits.'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Package Selection Section with Strikethrough Real Price & Discount Price */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-vip-gold/20 flex items-center justify-center text-vip-gold">
                      <Gem className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {language === 'ar' ? '3. اختر باقة الجواهر' : '3. Select Diamond Package'}
                      </h2>
                      <p className="text-xs text-vip-text-secondary">
                        {language === 'ar'
                          ? `الأسعار معروضة بعد تطبيق خصم ${selectedDiscount}% الذي اخترته`
                          : `Prices calculated with your selected ${selectedDiscount}% discount`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all select-none',
                      selectedCategory === 'ALL'
                        ? 'bg-vip-purple text-white shadow-md shadow-vip-purple/30'
                        : 'bg-vip-card text-vip-text-secondary hover:text-white hover:bg-vip-card-hover border border-vip-border'
                    )}
                  >
                    {language === 'ar' ? 'الكل' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('DIAMONDS')}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all select-none',
                      selectedCategory === 'DIAMONDS'
                        ? 'bg-vip-gold text-black shadow-md shadow-vip-gold/30 font-extrabold'
                        : 'bg-vip-card text-vip-text-secondary hover:text-white hover:bg-vip-card-hover border border-vip-border'
                    )}
                  >
                    <Gem className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'جواهر فري فاير' : 'Diamonds'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('MEMBERSHIP')}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all select-none',
                      selectedCategory === 'MEMBERSHIP'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/30 font-extrabold'
                        : 'bg-vip-card text-vip-text-secondary hover:text-white hover:bg-vip-card-hover border border-vip-border'
                    )}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'عضويات VIP' : 'Memberships'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('AIRDROP')}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all select-none',
                      selectedCategory === 'AIRDROP'
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/30 font-extrabold'
                        : 'bg-vip-card text-vip-text-secondary hover:text-white hover:bg-vip-card-hover border border-vip-border'
                    )}
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{language === 'ar' ? 'دروبات خاصة' : 'Airdrops'}</span>
                  </button>
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
                    {packages
                      .filter((p) => selectedCategory === 'ALL' || (p.category || 'DIAMONDS') === selectedCategory)
                      .map((pkg) => {
                        const isSelected = selectedPackage?.id === pkg.id;
                        const discountedPrice = calcDiscountedPrice(pkg.price);
                        const isMembership = pkg.category === 'MEMBERSHIP';
                        const isAirdrop = pkg.category === 'AIRDROP';

                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg)}
                            className={cn(
                              'relative cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden',
                              isSelected
                                ? 'bg-vip-card-hover border-vip-purple shadow-[0_0_25px_rgba(124,58,237,0.35)] scale-[1.02]'
                                : isMembership
                                ? 'bg-vip-card border-amber-500/30 hover:border-amber-400/60 hover:bg-vip-card-hover'
                                : isAirdrop
                                ? 'bg-vip-card border-rose-500/30 hover:border-rose-400/60 hover:bg-vip-card-hover'
                                : 'bg-vip-card border-vip-border hover:border-vip-border-light hover:bg-vip-card-hover'
                            )}
                          >
                            {/* Top Badges: Custom Type Badge & Discount Badge */}
                            <div className="absolute top-2.5 end-2.5 z-10 flex flex-col items-end gap-1">
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-vip-purple to-vip-blue text-white shadow-md border border-vip-purple/30">
                                🔥 {language === 'ar' ? `خصم ${selectedDiscount}%` : `${selectedDiscount}% OFF`}
                              </span>
                              {pkg.badge && (
                                <span className={cn(
                                  'text-[9px] font-bold px-1.5 py-0.2 rounded-full border',
                                  isMembership
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                                    : isAirdrop
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                                    : 'bg-vip-purple/20 text-vip-purple-light border-vip-purple/40'
                                )}>
                                  {pkg.badge}
                                </span>
                              )}
                            </div>

                            {/* Selected Check Icon */}
                            {isSelected && (
                              <div className="absolute top-2.5 start-2.5 w-6 h-6 rounded-full bg-vip-purple flex items-center justify-center text-white shadow-md z-10">
                                <Check className="w-3.5 h-3.5 font-bold" />
                              </div>
                            )}

                            <div className="pt-6">
                              {/* Icon Box */}
                              <div
                                className={cn(
                                  'w-11 h-11 rounded-xl flex items-center justify-center mb-3',
                                  isMembership
                                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : isAirdrop
                                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                                    : 'bg-vip-gold/10 border border-vip-gold/20 text-vip-gold shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                                )}
                              >
                                {isMembership ? (
                                  <Crown className="w-6 h-6" />
                                ) : isAirdrop ? (
                                  <Flame className="w-6 h-6" />
                                ) : (
                                  <Gem className="w-6 h-6" />
                                )}
                              </div>

                              {/* Title & Description */}
                              {pkg.name ? (
                                <div>
                                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                                    {pkg.name}
                                  </h3>
                                  <span className="text-[11px] text-vip-text-secondary block mt-0.5">
                                    {isMembership
                                      ? `${pkg.diamonds} جوهرة + هدايا يومية`
                                      : isAirdrop
                                      ? `${pkg.diamonds} جوهرة + سكنات`
                                      : `${pkg.diamonds} ${t('diamonds')}`}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl sm:text-3xl font-extrabold text-vip-gold font-mono">
                                    {pkg.diamonds.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-vip-text-secondary">{t('diamonds')}</span>
                                </div>
                              )}
                            </div>

                            {/* Pricing Display: Strikethrough real price & bold discount price */}
                            <div className="mt-4 pt-3 border-t border-vip-border/60">
                              <div className="flex items-center justify-between text-xs text-vip-text-muted mb-1">
                                <span className="text-[11px]">{language === 'ar' ? 'السعر الحقيقي:' : 'Original:'}</span>
                                <span className="line-through text-vip-text-muted/80 font-mono text-xs sm:text-sm">
                                  {formatPrice(pkg.price)}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400">
                                  {language === 'ar' ? 'بعد الخصم:' : 'Discounted:'}
                                </span>
                                <span className="text-xl sm:text-2xl font-black text-vip-gold font-mono">
                                  {formatPrice(discountedPrice)}
                                </span>
                              </div>
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
          {step === 2 && selectedPackage && (
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-vip-bg border border-vip-border mb-4">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('playerUid')}</span>
                    <span className="text-base font-mono font-bold text-white tracking-wider">{playerUid}</span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">{t('playerName')}</span>
                    <span className="text-base font-bold text-white">
                      {playerName || (language === 'ar' ? 'حساب مؤكد' : 'Verified')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">
                      {selectedPackage.name ? (language === 'ar' ? 'الباقة / العرض' : 'Package / Offering') : t('featuredPackages')}
                    </span>
                    <span className="text-base font-bold text-vip-gold flex items-center gap-1.5">
                      {selectedPackage.category === 'MEMBERSHIP' ? (
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : selectedPackage.category === 'AIRDROP' ? (
                        <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Gem className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <span>
                        {selectedPackage.name
                          ? `${selectedPackage.name} (${selectedPackage.diamonds.toLocaleString()} 💎)`
                          : `${selectedPackage.diamonds.toLocaleString()} ${t('diamonds')}`}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-xl bg-vip-purple/10 border border-vip-purple/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{language === 'ar' ? 'السعر الحقيقي' : 'Original Price'}</span>
                    <span className="text-base font-semibold line-through text-vip-text-muted font-mono">
                      {formatPrice(selectedPackage.price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">{language === 'ar' ? 'الخصم المطبق' : 'Applied Discount'}</span>
                    <span className="text-base font-bold text-emerald-400">
                      %{selectedDiscount} ({formatPrice(selectedPackage.price * (selectedDiscount / 100))}-)
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-vip-text-muted block">{language === 'ar' ? 'المبلغ النهائي للدفع' : 'Final Amount'}</span>
                    <span className="text-2xl font-black text-vip-gold font-mono">
                      {formatPrice(calcDiscountedPrice(selectedPackage.price))}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Payment Method Selection: ONLY InstaPay and Vodafone Cash */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          ? 'تحويل فوري عبر محفظة فودافون كاش أو أي محفظة إلكترونية أخرى'
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

                {/* Selected Package Banner */}
                {selectedPackage && (
                  <div className="mt-4 pt-4 border-t border-vip-border/40 flex flex-wrap items-center justify-between gap-3 bg-vip-purple/10 p-3 rounded-xl">
                    <span className="text-xs text-vip-text-muted flex items-center gap-1.5">
                      {selectedPackage.category === 'MEMBERSHIP' ? (
                        <Crown className="w-4 h-4 text-amber-400" />
                      ) : selectedPackage.category === 'AIRDROP' ? (
                        <Flame className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Gem className="w-4 h-4 text-cyan-400" />
                      )}
                      <span>{language === 'ar' ? 'الباقة / العرض:' : 'Package / Offering:'}</span>
                    </span>
                    <span className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>{selectedPackage.name ? `${selectedPackage.name} (${selectedPackage.diamonds.toLocaleString()} 💎)` : `${selectedPackage.diamonds.toLocaleString()} ${t('diamonds')}`}</span>
                      {selectedPackage.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-vip-purple/20 text-vip-purple-light border border-vip-purple/40 font-bold">
                          {selectedPackage.badge}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="mt-6 pt-6 border-t border-vip-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-vip-text-muted block">{language === 'ar' ? 'السعر الحقيقي' : 'Original Price'}</span>
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
                      {orderResult.discountPercent >= 50
                        ? language === 'ar'
                          ? '🎉 طلب أول (خصم 50%)'
                          : '🎉 1st Order (50% OFF)'
                        : language === 'ar'
                        ? 'خصم دائم مدى الحياة (20%)'
                        : 'Lifetime (20% OFF)'}
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
                        : language === 'ar'
                        ? 'حوّل المبلغ المطلوب عبر محفظة فودافون كاش أو أي محفظة ذكية إلى الرقم التالي'
                        : 'Transfer the required amount via Vodafone Cash or mobile wallet to the following number'}
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
                        ? 'بعد إتمام التحويل، يرجى التقاط لقطة شاشة للإيصال ورفعها بالأسفل للتحقق الفوري وشحن الجواهر إلى حسابك.'
                        : 'After transfer, take a screenshot of your receipt and upload it below for immediate verification.'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Receipt Upload Card */}
              <Card className="p-6 md:p-8 neon-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{t('uploadReceipt')}</h2>
                    <p className="text-xs text-vip-text-secondary">{t('uploadReceiptDesc')}</p>
                  </div>
                </div>

                {receiptUploaded ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{t('receiptUploaded')}</h3>
                      <p className="text-sm text-vip-text-secondary mt-1">
                        {language === 'ar'
                          ? 'طلبك الآن قيد المراجعة لدى فريق VIP STORE. سيتم إرسال الجواهر خلال دقائق معدودة!'
                          : 'Your order is now under review. Diamonds will be sent in a few minutes!'}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-center">
                      <Button
                        variant="primary"
                        onClick={() => router.push(`/track?orderNumber=${encodeURIComponent(orderResult.orderNumber)}`)}
                        className="flex items-center gap-2"
                      >
                        <span>{t('trackOrder')}</span>
                        {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <FileUpload
                      onFileSelect={(file) => setReceiptFile(file)}
                      accept="image/*"
                      maxSizeMB={5}
                    />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => router.push(`/track?orderNumber=${encodeURIComponent(orderResult.orderNumber)}`)}
                        className="w-full sm:w-auto"
                      >
                        <span>{language === 'ar' ? 'متابعة الطلب لاحقاً' : 'Track Order Later'}</span>
                      </Button>

                      <Button
                        variant="primary"
                        onClick={handleUploadReceipt}
                        loading={uploadingReceipt}
                        disabled={!receiptFile || uploadingReceipt}
                        className="w-full sm:w-auto px-8 flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('proceedToUpload')}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function TopupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-vip-bg flex items-center justify-center">
          <LoadingSpinner size="lg" text="تحميل المتجر..." />
        </div>
      }
    >
      <TopupInner />
    </Suspense>
  );
}
