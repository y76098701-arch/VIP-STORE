'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Smartphone,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  RefreshCw,
  Play,
  ShieldCheck,
  Send,
  Sliders,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  Info,
  DollarSign,
  Gem,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import { soundFx } from '@/lib/sound';

export default function AiAutoChargePage() {
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState<'simulator' | 'guide' | 'logs' | 'settings'>('simulator');
  const [loading, setLoading] = useState<boolean>(true);

  // Settings State
  const [autoChargeEnabled, setAutoChargeEnabled] = useState<boolean>(true);
  const [webhookSecret, setWebhookSecret] = useState<string>('');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70);
  const [adminPhone, setAdminPhone] = useState<string>('01069954152');
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Simulator State
  const [simMessage, setSimMessage] = useState<string>('');
  const [simSender, setSimSender] = useState<string>('VodafoneCash');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  // Logs & Stats State
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalProcessed: number; autoFulfilled: number; totalAmount: number }>({
    totalProcessed: 0,
    autoFulfilled: 0,
    totalAmount: 0,
  });
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Load Settings and Logs
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch AI Settings
      const resSettings = await fetch('/api/admin/ai/settings');
      if (resSettings.ok) {
        const data = await resSettings.json();
        setAutoChargeEnabled(data.autoChargeEnabled);
        setWebhookSecret(data.webhookSecret || '');
        setConfidenceThreshold(data.confidenceThreshold || 70);
        setAdminPhone(data.adminPhone || '01069954152');
        setAudioAlertEnabled(data.audioAlertEnabled !== false);
      }

      // 2. Fetch AI Logs & Stats
      const resLogs = await fetch('/api/admin/ai/logs?limit=30');
      if (resLogs.ok) {
        const data = await resLogs.json();
        setLogs(data.logs || []);
        setStats(data.stats || { totalProcessed: 0, autoFulfilled: 0, totalAmount: 0 });
      }
    } catch (e: any) {
      addToast(isArabic ? 'خطأ في تحميل بيانات الذكاء الاصطناعي' : 'Failed to load AI data', 'error');
    } finally {
      setLoading(false);
    }
  }, [isArabic, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Save Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoChargeEnabled,
          webhookSecret,
          confidenceThreshold,
          adminPhone,
          audioAlertEnabled,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      addToast(isArabic ? 'تم حفظ إعدادات الذكاء الاصطناعي بنجاح' : 'AI settings saved successfully', 'success');
    } catch (e: any) {
      addToast(isArabic ? 'فشل حفظ الإعدادات' : 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Regenerate Webhook Secret
  const handleRegenerateSecret = async () => {
    if (!confirm(isArabic ? 'هل أنت متأكد من رغبتك في إعادة توليد مفتاح الأمان؟ ستحتاج لتحديثه في تطبيق الهاتف.' : 'Are you sure? You must update the key in your phone app.')) return;
    try {
      const res = await fetch('/api/admin/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerateSecret: true }),
      });
      if (res.ok) {
        await loadData();
        addToast(isArabic ? 'تم توليد مفتاح أمان جديد بنجاح' : 'Secret key regenerated', 'success');
      }
    } catch (e: any) {
      addToast(isArabic ? 'حدث خطأ' : 'Error regenerating key', 'error');
    }
  };

  // Run Simulation
  const handleSimulate = async () => {
    if (!simMessage.trim()) {
      addToast(isArabic ? 'يرجى إدخال نص رسالة التحويل' : 'Please provide SMS message text', 'warning');
      return;
    }

    setSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch('/api/admin/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: simMessage,
          sender: simSender,
        }),
      });

      const data = await res.json();
      setSimResult(data);

      if (data.autoFulfilled) {
        soundFx.playReceiptUploaded();
        addToast(isArabic ? 'تم مطابقة الطلب وشحن الجواهر تلقائياً بنجاح!' : 'Order matched & auto-fulfilled!', 'success');
      } else if (data.matched) {
        soundFx.playReceiptUploaded();
        addToast(isArabic ? 'تم تأكيد الدفع ومطابقة الطلب بنجاح' : 'Payment verified and matched', 'success');
      } else if (data.success) {
        addToast(data.message, 'info');
      } else {
        addToast(data.message || (isArabic ? 'لم يتم مطابقة الطلب' : 'Verification failed'), 'warning');
      }

      // Refresh logs
      const resLogs = await fetch('/api/admin/ai/logs?limit=30');
      if (resLogs.ok) {
        const logData = await resLogs.json();
        setLogs(logData.logs || []);
        setStats(logData.stats || stats);
      }
    } catch (e: any) {
      addToast(isArabic ? 'خطأ أثناء محاكاة الشحن بالذكاء الاصطناعي' : 'Simulation error', 'error');
    } finally {
      setSimulating(false);
    }
  };

  // Sample SMS Presets
  const setPreset = (type: 'vf50' | 'vf150' | 'insta250' | 'fraud') => {
    switch (type) {
      case 'vf50':
        setSimSender('VodafoneCash');
        setSimMessage('تم استلام مبلغ 50.00 ج.م من رقم 01012345678. مصاريف الخدمة 0.00 ج.م. رصيدك الحالي هو 450.00 ج.م. رقم العملية: 849201948.');
        break;
      case 'vf150':
        setSimSender('VodafoneCash');
        setSimMessage('تم استلام مبلغ 150.00 ج.م من رقم 01098765432. مصاريف الخدمة 0.00 ج.م. رصيدك الحالي 600.00 ج.م. رقم العملية: 958201847.');
        break;
      case 'insta250':
        setSimSender('InstaPay');
        setSimMessage('تم تحويل مبلغ 250.00 جم بنجاح لحسابك عبر إنستاباي من ahmed.ipn. مرجع العملية: IPN839201849.');
        break;
      case 'fraud':
        setSimSender('FakeSMS');
        setSimMessage('تم خصم مبلغ 50.00 ج.م من حسابك لعملية شراء عبر الإنترنت. رصيدك غير كافٍ لإتمام العملية.');
        break;
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://vip-store-sju6.vercel.app';
  const webhookUrl = `${currentOrigin}/api/ai/sms-listener`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(isArabic ? `تم نسخ ${label} إلى الحافظة` : `${label} copied to clipboard`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text={isArabic ? 'جاري تحميل نظام الذكاء الاصطناعي...' : 'Loading AI Engine...'} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-vip-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vip-purple to-vip-cyan p-0.5 shadow-lg shadow-vip-purple/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0d14] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-vip-cyan" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <span>{isArabic ? 'ربط الهاتف والشحن التلقائي بالـ AI' : 'AI Auto-Topup & Phone Sync'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-vip-cyan/15 text-vip-cyan border border-vip-cyan/30 font-mono">
                  v2.0 AI Engine
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-vip-text-secondary mt-1">
                {isArabic
                  ? 'التحقق التلقائي من رسائل تحويل فودافون كاش وإنستاباي وشحن جواهر فري فاير فوراً بدون تدخل يدوي'
                  : 'Automated SMS parser & instant Free Fire diamond fulfillment powered by AI'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Auto-Charge Switch */}
        <div className="flex items-center gap-3 bg-vip-card/90 px-4 py-2.5 rounded-2xl border border-vip-border shadow-md">
          <div className="flex flex-col text-end">
            <span className="text-xs font-bold text-white">
              {isArabic ? 'حالة الشحن التلقائي' : 'Auto-Charge Engine'}
            </span>
            <span className={cn('text-[11px] font-semibold flex items-center gap-1 justify-end', autoChargeEnabled ? 'text-emerald-400' : 'text-amber-400')}>
              <span className={cn('w-2 h-2 rounded-full animate-pulse', autoChargeEnabled ? 'bg-emerald-400' : 'bg-amber-400')} />
              {autoChargeEnabled ? (isArabic ? 'نشط ويعمل تلقائياً' : 'Active & Live') : (isArabic ? 'متوقف مؤقتاً' : 'Paused')}
            </span>
          </div>
          <button
            onClick={() => {
              setAutoChargeEnabled(!autoChargeEnabled);
              addToast(
                !autoChargeEnabled
                  ? isArabic ? 'تم تفعيل الشحن التلقائي بالذكاء الاصطناعي ⚡' : 'Auto-charge enabled'
                  : isArabic ? 'تم إيقاف الشحن التلقائي مؤقتاً' : 'Auto-charge paused',
                'info'
              );
            }}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none',
              autoChargeEnabled ? 'bg-emerald-500' : 'bg-vip-border'
            )}
            role="switch"
            aria-checked={autoChargeEnabled}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
                autoChargeEnabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed */}
        <Card className="p-5 neon-border flex items-center justify-between">
          <div>
            <span className="text-xs text-vip-text-muted block">{isArabic ? 'إجمالي الرسائل المحللة' : 'Total Processed SMS'}</span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">{stats.totalProcessed}</span>
            <span className="text-[10px] text-vip-text-secondary mt-0.5 block">{isArabic ? 'عبر الذكاء الاصطناعي' : 'AI Verified'}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-vip-purple/15 border border-vip-purple/30 flex items-center justify-center text-vip-purple-light">
            <Sparkles className="w-6 h-6" />
          </div>
        </Card>

        {/* Auto Fulfilled */}
        <Card className="p-5 neon-border flex items-center justify-between">
          <div>
            <span className="text-xs text-vip-text-muted block">{isArabic ? 'تم شحنها تلقائياً' : 'Auto-Fulfilled Orders'}</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{stats.autoFulfilled}</span>
            <span className="text-[10px] text-emerald-400/80 mt-0.5 block">{isArabic ? 'شحن فوري ناجح' : '100% Instant Delivery'}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
        </Card>

        {/* Total Amount */}
        <Card className="p-5 neon-border flex items-center justify-between">
          <div>
            <span className="text-xs text-vip-text-muted block">{isArabic ? 'الأموال المؤكدة آلياً' : 'Total Revenue Verified'}</span>
            <span className="text-2xl font-black text-vip-gold mt-1 block font-mono">{formatPrice(stats.totalAmount)}</span>
            <span className="text-[10px] text-vip-text-secondary mt-0.5 block">{isArabic ? 'بدون أي أخطاء بشرية' : 'Zero Human Errors'}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-vip-gold">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>

        {/* Registered Store Phone */}
        <Card className="p-5 neon-border flex items-center justify-between">
          <div>
            <span className="text-xs text-vip-text-muted block">{isArabic ? 'رقم الهاتف المعتمد' : 'Connected Phone'}</span>
            <span className="text-xl font-black text-white mt-1 block font-mono tracking-wider">{adminPhone}</span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" />
              {isArabic ? 'فودافون كاش & إنستاباي' : 'Vodafone & InstaPay'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-vip-cyan/15 border border-vip-cyan/30 flex items-center justify-center text-vip-cyan">
            <Smartphone className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-vip-border/60 pb-3">
        <button
          onClick={() => setActiveTab('simulator')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            activeTab === 'simulator'
              ? 'bg-gradient-to-r from-vip-purple to-vip-blue text-white shadow-lg shadow-vip-purple/20'
              : 'text-vip-text-secondary hover:text-white hover:bg-white/5'
          )}
        >
          <Play className="w-4 h-4" />
          <span>{isArabic ? 'محاكي وتجربة الذكاء الاصطناعي' : 'AI Live Simulator'}</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            activeTab === 'guide'
              ? 'bg-gradient-to-r from-vip-purple to-vip-blue text-white shadow-lg shadow-vip-purple/20'
              : 'text-vip-text-secondary hover:text-white hover:bg-white/5'
          )}
        >
          <Smartphone className="w-4 h-4" />
          <span>{isArabic ? 'طريقة ربط هاتفك (SMS Webhook)' : 'Phone Linking Guide'}</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            activeTab === 'logs'
              ? 'bg-gradient-to-r from-vip-purple to-vip-blue text-white shadow-lg shadow-vip-purple/20'
              : 'text-vip-text-secondary hover:text-white hover:bg-white/5'
          )}
        >
          <FileText className="w-4 h-4" />
          <span>{isArabic ? 'سجل العمليات الآلية' : 'AI Audit Logs'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-vip-purple to-vip-blue text-white shadow-lg shadow-vip-purple/20'
              : 'text-vip-text-secondary hover:text-white hover:bg-white/5'
          )}
        >
          <Sliders className="w-4 h-4" />
          <span>{isArabic ? 'إعدادات وقواعد الـ AI' : 'AI Rules & Settings'}</span>
        </button>
      </div>

      {/* TAB 1: AI SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <Card className="p-6 md:p-8 neon-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-vip-gold" />
                  <span>{isArabic ? 'تجربة ومحاكاة الذكاء الاصطناعي المباشرة' : 'Live AI Verification & Auto-Charge'}</span>
                </h2>
                <p className="text-xs text-vip-text-secondary mt-1">
                  {isArabic
                    ? 'يمكنك تجربة إدخال أي رسالة استلام تحويل من هاتفك الآن، وسيقوم الذكاء الاصطناعي باستخراج البيانات، والبحث عن الطلب المعلق، وشحن الجواهر فوراً!'
                    : 'Paste any SMS transfer text below. The AI will extract fields, find the matching order, and trigger instant diamond topup.'}
                </p>
              </div>

              {/* Sample Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-vip-text-muted font-medium">{isArabic ? 'رسائل تجريبية جاهزة:' : 'Sample SMS:'}</span>
                <button
                  type="button"
                  onClick={() => setPreset('vf50')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-all"
                >
                  فودافون كاش 50 ج.م
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('vf150')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-all"
                >
                  فودافون كاش 150 ج.م
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('insta250')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all"
                >
                  إنستاباي 250 ج.م
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('fraud')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all"
                >
                  كشف رسالة احتيال
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-vip-text-secondary mb-1.5">
                  {isArabic ? 'اسم المرسل أو المحفظة (Sender Header)' : 'Sender / Wallet'}
                </label>
                <Input
                  value={simSender}
                  onChange={(e) => setSimSender(e.target.value)}
                  placeholder="VodafoneCash / InstaPay"
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-vip-text-secondary mb-1.5">
                  {isArabic ? 'نص رسالة التحويل (SMS Content)' : 'SMS Message Body'}
                </label>
                <textarea
                  rows={4}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'الصق هنا نص الرسالة التي وصلتك على الهاتف (مثال: تم استلام مبلغ 50.00 ج.م من رقم 010... رقم العملية: 12345678)'
                      : 'Paste the SMS text received on your phone...'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-vip-bg border border-vip-border text-white text-sm focus:outline-none focus:border-vip-purple transition-all resize-y"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleSimulate}
                  loading={simulating}
                  disabled={simulating || !simMessage.trim()}
                  className="px-8 shadow-[0_0_25px_rgba(124,58,237,0.4)] font-bold text-sm"
                >
                  <Bot className="w-5 h-5 ml-2" />
                  <span>{isArabic ? 'تحليل وشحن فوري بالذكاء الاصطناعي 🚀' : 'Run AI Analysis & Auto-Charge'}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Simulation Output Card */}
          <AnimatePresence>
            {simResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
              >
                <Card className="p-6 md:p-8 neon-border border-emerald-500/30">
                  <div className="flex items-center justify-between border-b border-vip-border/60 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          simResult.autoFulfilled
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : simResult.matched
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        )}
                      >
                        {simResult.autoFulfilled ? (
                          <Zap className="w-6 h-6 animate-pulse" />
                        ) : simResult.matched ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <AlertTriangle className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>{simResult.message}</span>
                        </h3>
                        <span className="text-xs text-vip-text-muted">
                          {isArabic ? 'تقرير تحليل الذكاء الاصطناعي وقرار التنفيذ' : 'AI Decision & Verification Report'}
                        </span>
                      </div>
                    </div>

                    <div className="text-end">
                      <span className="text-xs text-vip-text-muted block">{isArabic ? 'درجة دقة الـ AI' : 'Confidence'}</span>
                      <span className="text-lg font-mono font-black text-emerald-400">
                        {simResult.aiAnalysis?.confidenceScore || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Analysis Breakdown Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-vip-bg border border-vip-border">
                      <span className="text-xs text-vip-text-muted block">{isArabic ? 'المحفظة المكتشفة' : 'Detected Wallet'}</span>
                      <span className="text-base font-bold text-white mt-1 block">
                        {simResult.aiAnalysis?.providerNameAr || 'غير معروف'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-vip-bg border border-vip-border">
                      <span className="text-xs text-vip-text-muted block">{isArabic ? 'المبلغ المستخرج' : 'Extracted Amount'}</span>
                      <span className="text-xl font-mono font-extrabold text-vip-gold mt-1 block">
                        {simResult.aiAnalysis?.amount ? formatPrice(simResult.aiAnalysis.amount) : 'غير محدد'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-vip-bg border border-vip-border">
                      <span className="text-xs text-vip-text-muted block">{isArabic ? 'رقم المحول' : 'Sender Phone / Name'}</span>
                      <span className="text-base font-mono font-bold text-white mt-1 block">
                        {simResult.aiAnalysis?.senderPhone || simResult.aiAnalysis?.senderName || 'غير متوفر في الإشعار'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-vip-bg border border-vip-border">
                      <span className="text-xs text-vip-text-muted block">{isArabic ? 'رقم المرجع / العملية' : 'Transaction Ref'}</span>
                      <span className="text-base font-mono font-bold text-vip-cyan mt-1 block truncate">
                        {simResult.aiAnalysis?.transactionRef || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Order & Diamond Fulfillment Details */}
                  {simResult.order ? (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-6 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Gem className="w-5 h-5 text-emerald-400" />
                          <span className="font-bold text-white text-base">
                            {isArabic ? 'الطلب المطابق في النظام:' : 'Matched Order:'}{' '}
                            <span className="font-mono text-vip-cyan">{simResult.order.orderNumber}</span>
                          </span>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                          {simResult.autoFulfilled ? (isArabic ? 'تم الشحن فورياً ⚡' : 'Auto-Fulfilled') : (isArabic ? 'تم تأكيد الدفع' : 'Payment Confirmed')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-vip-text-muted block">{isArabic ? 'معرف اللاعب (Player UID):' : 'Player UID:'}</span>
                          <span className="font-mono font-bold text-white text-sm">{simResult.playerUid || simResult.order.playerUid}</span>
                        </div>
                        <div>
                          <span className="text-vip-text-muted block">{isArabic ? 'الباقة / العرض:' : 'Package:'}</span>
                          <span className="font-mono font-bold text-vip-gold text-sm">
                            {simResult.order?.package?.name || `${simResult.diamondsCharged || simResult.order?.package?.diamonds || 0} 💎`}
                          </span>
                        </div>
                        <div>
                          <span className="text-vip-text-muted block">{isArabic ? 'رقم إيصال التسليم:' : 'Provider Tx ID:'}</span>
                          <span className="font-mono font-bold text-vip-cyan text-xs truncate block">{simResult.providerTxId || 'Simulated Delivery'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-vip-bg border border-vip-border text-center text-xs text-vip-text-secondary mb-6">
                      {isArabic
                        ? 'لم يتم العثور على طلب معلق يطابق هذا المبلغ حالياً. تم حفظ الإشعار في سجل الـ AI.'
                        : 'No pending order matched this amount in database. Logged in audit trail.'}
                    </div>
                  )}

                  {/* AI Reasoning Walkthrough */}
                  <div>
                    <h4 className="text-xs font-bold text-vip-text-muted uppercase tracking-wider mb-2">
                      {isArabic ? 'منطق واستنتاجات الذكاء الاصطناعي (AI Reasoning Trail):' : 'AI Reasoning:'}
                    </h4>
                    <div className="space-y-1.5">
                      {simResult.aiAnalysis?.reasoning?.map((step: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-vip-text-secondary">
                          <span className="w-4 h-4 rounded-full bg-vip-purple/20 text-vip-purple-light flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 2: PHONE LINKING GUIDE */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Webhook Credentials Card */}
          <Card className="p-6 md:p-8 neon-border">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-vip-cyan" />
              <span>{isArabic ? 'بيانات ربط تطبيق الرسائل (Webhook Credentials)' : 'Webhook Connection Details'}</span>
            </h2>
            <p className="text-xs text-vip-text-secondary mb-6">
              {isArabic
                ? 'استخدم هذه البيانات في أي تطبيق تحويل رسائل SMS على هاتفك ليتم إرسال إشعارات التحويل إلى الموقع تلقائياً.'
                : 'Configure these details in your Android SMS forwarding app.'}
            </p>

            <div className="space-y-4">
              {/* Webhook URL */}
              <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-vip-text-muted block mb-1">
                    {isArabic ? 'رابط استقبال الرسائل (Webhook URL):' : 'Webhook URL:'}
                  </span>
                  <span className="text-sm font-mono font-bold text-vip-cyan truncate block">{webhookUrl}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(webhookUrl, isArabic ? 'رابط الـ Webhook' : 'Webhook URL')}
                >
                  <Copy className="w-4 h-4 ml-1.5" />
                  <span>{isArabic ? 'نسخ الرابط' : 'Copy URL'}</span>
                </Button>
              </div>

              {/* Secret Key */}
              <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-vip-text-muted block mb-1">
                    {isArabic ? 'مفتاح الأمان السري (Secret Key / Token):' : 'Secret Key:'}
                  </span>
                  <span className="text-sm font-mono font-bold text-vip-gold truncate block">{webhookSecret}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(webhookSecret, isArabic ? 'مفتاح الأمان' : 'Secret Key')}
                  >
                    <Copy className="w-4 h-4 ml-1.5" />
                    <span>{isArabic ? 'نسخ المفتاح' : 'Copy Key'}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRegenerateSecret}
                    className="text-vip-text-muted hover:text-white"
                    title={isArabic ? 'توليد مفتاح جديد' : 'Regenerate'}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Step-by-Step Android Setup Tutorial */}
          <Card className="p-6 md:p-8 neon-border">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-vip-gold" />
              <span>{isArabic ? 'خطوات ربط هاتف الأندرويد في 3 دقائق:' : 'Setup Instructions (3 Steps):'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-vip-bg border border-vip-border flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-vip-purple/20 text-vip-purple-light flex items-center justify-center font-bold text-sm mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">
                    {isArabic ? 'تحميل تطبيق تحويل الـ SMS' : 'Install SMS Forwarder'}
                  </h4>
                  <p className="text-xs text-vip-text-secondary leading-relaxed">
                    {isArabic
                      ? 'من هاتفك صاحب الرقم 01069954152، قم بتحميل تطبيق مجاني مثل (SMS Forwarder - Auto forward SMS to PC) أو (MacroDroid) من متجر Google Play.'
                      : 'Install a free SMS Forwarder or MacroDroid from Google Play on your Android phone.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-vip-bg border border-vip-border flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-vip-purple/20 text-vip-purple-light flex items-center justify-center font-bold text-sm mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">
                    {isArabic ? 'تحديد رسائل فودافون & إنستاباي' : 'Set Filter Rules'}
                  </h4>
                  <p className="text-xs text-vip-text-secondary leading-relaxed">
                    {isArabic
                      ? 'أضف قاعدة في التطبيق لاستهداف الرسائل القادمة من "VodafoneCash" أو "InstaPay" فقط، لضمان عدم إرسال رسائلك الشخصية.'
                      : 'Set a rule to only forward SMS from sender "VodafoneCash" or "InstaPay".'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-vip-bg border border-vip-border flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">
                    {isArabic ? 'لصق رابط الـ Webhook' : 'Paste Webhook & Enjoy'}
                  </h4>
                  <p className="text-xs text-vip-text-secondary leading-relaxed">
                    {isArabic
                      ? 'اختر نوع الإرسال Webhook POST والصق رابط الموقع ومفتاح الأمان السري. الآن بمجرد وصول أي رسالة تحويل، سيتم شحن الجواهر للعميل فوراً!'
                      : 'Select Webhook POST, paste the Webhook URL and Secret Key. Orders will now fulfill automatically!'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <Card className="p-6 md:p-8 neon-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-vip-cyan" />
                <span>{isArabic ? 'سجل العمليات الآلية بالذكاء الاصطناعي' : 'AI Processing Audit Trail'}</span>
              </h2>
              <p className="text-xs text-vip-text-secondary mt-1">
                {isArabic ? 'سجل مفصل لكل رسالة تحويل تمت معالجتها وتاريخ ومطابقة الجواهر' : 'Complete history of all processed messages and match decisions'}
              </p>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={loadData}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
              <span>{isArabic ? 'تحديث السجل' : 'Refresh'}</span>
            </Button>
          </div>

          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-vip-border text-vip-text-muted">
                    <th className="py-3 px-3 text-start">{isArabic ? 'التاريخ والوقت' : 'Date'}</th>
                    <th className="py-3 px-3 text-start">{isArabic ? 'المزود' : 'Provider'}</th>
                    <th className="py-3 px-3 text-start">{isArabic ? 'المبلغ' : 'Amount'}</th>
                    <th className="py-3 px-3 text-start">{isArabic ? 'رقم الطلب' : 'Order #'}</th>
                    <th className="py-3 px-3 text-start">{isArabic ? 'معرف اللاعب (UID)' : 'Player UID'}</th>
                    <th className="py-3 px-3 text-start">{isArabic ? 'الجواهر' : 'Diamonds'}</th>
                    <th className="py-3 px-3 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vip-border/40">
                  {logs.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-mono text-vip-text-secondary whitespace-nowrap">
                        {formatDate(item.createdAt, language)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        {item.provider}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-vip-gold whitespace-nowrap">
                        {item.amount ? formatPrice(item.amount) : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono text-vip-cyan whitespace-nowrap">
                        {item.orderNumber || '-'}
                      </td>
                      <td className="py-3 px-3 font-mono text-white whitespace-nowrap">
                        {item.playerUid || '-'}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold whitespace-nowrap">
                        {item.diamonds ? `${item.diamonds} 💎` : '-'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.autoFulfilled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {isArabic ? 'شحن تلقائي ⚡' : 'Auto Fulfilled'}
                          </span>
                        ) : item.status === 'NO_MATCH' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {isArabic ? 'بانتظار طلب' : 'No Match'}
                          </span>
                        ) : item.status === 'FRAUD_SUSPECTED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            {isArabic ? 'مرفوض أمنياً' : 'Fraud Block'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            {item.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-vip-text-muted text-xs">
              {isArabic ? 'لا توجد عمليات مسجلة حتى الآن. جرب المحاكي في التبويب الأول!' : 'No logs yet. Try the simulator in Tab 1!'}
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: SETTINGS & RULES */}
      {activeTab === 'settings' && (
        <Card className="p-6 md:p-8 neon-border">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-vip-gold" />
            <span>{isArabic ? 'إعدادات وقواعد الشحن التلقائي بالـ AI' : 'AI Rules & Auto-Fulfillment Settings'}</span>
          </h2>
          <p className="text-xs text-vip-text-secondary mb-6">
            {isArabic ? 'تحكم في معايير قبول التحويلات ونسب الثقة لتسليم الجواهر فورياً' : 'Configure security thresholds and automated delivery rules'}
          </p>

          <div className="space-y-6 max-w-2xl">
            {/* Auto Charge Toggle */}
            <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">
                  {isArabic ? 'تفعيل الشحن الفوري الآلي (Instant Delivery)' : 'Enable Instant Auto-Delivery'}
                </span>
                <span className="text-xs text-vip-text-secondary mt-0.5 block">
                  {isArabic
                    ? 'عند تفعيلها، سيتم شحن الجواهر للعميل فوراً بمجرد تأكد الـ AI من رسالة التحويل.'
                    : 'Automatically sends diamonds immediately upon verified payment.'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoChargeEnabled}
                onChange={(e) => setAutoChargeEnabled(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Confidence Threshold */}
            <div>
              <label className="block text-xs font-bold text-vip-text-secondary mb-1.5">
                {isArabic ? 'الحد الأدنى لنسبة ثقة الذكاء الاصطناعي (Confidence Threshold)' : 'AI Confidence Threshold (%)'}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseInt(e.target.value, 10))}
                  className="flex-1 accent-vip-purple cursor-pointer"
                />
                <span className="w-16 text-center font-mono font-bold text-vip-gold bg-vip-bg px-3 py-1.5 rounded-lg border border-vip-border text-sm">
                  {confidenceThreshold}%
                </span>
              </div>
              <span className="text-[11px] text-vip-text-muted mt-1 block">
                {isArabic
                  ? 'الموصى به: 70% إلى 80% لضمان شحن سلس مع حماية مشددة من الرسائل المزيفة.'
                  : 'Recommended: 70% - 80%'}
              </span>
            </div>

            {/* Store Phone */}
            <div>
              <label className="block text-xs font-bold text-vip-text-secondary mb-1.5">
                {isArabic ? 'رقم هاتف المتجر المسجل' : 'Registered Store Phone'}
              </label>
              <Input
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="01069954152"
                className="font-mono text-sm"
              />
            </div>

            {/* Audio Alerts */}
            <div className="p-4 rounded-xl bg-vip-bg border border-vip-border flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">
                  {isArabic ? 'تنبيه صوتي فور شحن طلب بنجاح' : 'Audio Chime on Successful Charge'}
                </span>
                <span className="text-xs text-vip-text-secondary mt-0.5 block">
                  {isArabic ? 'تشغيل نغمة عند إتمام شحن أي طلب في الخلفية' : 'Play chime when diamonds are delivered'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={audioAlertEnabled}
                onChange={(e) => setAudioAlertEnabled(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={handleSaveSettings}
                loading={savingSettings}
                className="px-8 font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)]"
              >
                <span>{isArabic ? 'حفظ إعدادات الـ AI' : 'Save AI Settings'}</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
