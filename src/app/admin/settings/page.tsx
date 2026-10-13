'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  CreditCard,
  Percent,
  Cpu,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Phone,
  UserCheck,
  Lock,
  KeyRound,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useLanguageContext } from '@/contexts/LanguageContext';

export default function AdminSettingsPage() {
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';
  const { toasts, addToast, removeToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Payment Form Fields
  const [instapayName, setInstapayName] = useState<string>('VIP STORE');
  const [instapayNumber, setInstapayNumber] = useState<string>('01069954152');
  const [daqanCashName, setDaqanCashName] = useState<string>('VIP STORE - دكان كاش');
  const [daqanCashNumber, setDaqanCashNumber] = useState<string>('01069954152');
  const [transferPhone, setTransferPhone] = useState<string>('01069954152');
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState<string>('01069954152');

  // Discount Settings
  const [firstOrderDiscount, setFirstOrderDiscount] = useState<string>('50');
  const [regularDiscount, setRegularDiscount] = useState<string>('20');

  // Top-Up Provider Settings
  const [providerMode, setProviderMode] = useState<'live' | 'sandbox'>('sandbox');
  const [providerName, setProviderName] = useState<string>('Garena / Smile.One API');
  const [providerUrl, setProviderUrl] = useState<string>('');
  const [providerApiKey, setProviderApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [providerOpen, setProviderOpen] = useState<boolean>(true);

  // UID Verification Settings
  const [uidEnabled, setUidEnabled] = useState<boolean>(false);
  const [uidUrl, setUidUrl] = useState<string>('');
  const [uidApiKey, setUidApiKey] = useState<string>('');
  const [showUidKey, setShowUidKey] = useState<boolean>(false);

  // Admin Credentials State
  const [adminEmail, setAdminEmail] = useState<string>('admin@vipstore.com');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [updatingProfile, setUpdatingProfile] = useState<boolean>(false);

  // Fetch Current Settings
  const fetchSettings = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);

    try {
      // 1. Fetch Store Settings
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch settings');

      // 2. Fetch Admin Profile
      try {
        const profRes = await fetch('/api/admin/profile', { cache: 'no-store' });
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData.admin?.email) setAdminEmail(profData.admin.email);
        }
      } catch (e) {
        // Ignore if profile route not ready
      }

      const data: Record<string, string> = await res.json();

      if (data.instapay_name !== undefined) setInstapayName(data.instapay_name);
      if (data.instapay_number !== undefined) setInstapayNumber(data.instapay_number);
      if (data.daqan_cash_name !== undefined) setDaqanCashName(data.daqan_cash_name);
      if (data.daqan_cash_number !== undefined) setDaqanCashNumber(data.daqan_cash_number);
      if (data.transfer_phone !== undefined) setTransferPhone(data.transfer_phone);
      if (data.vodafone_cash_number !== undefined) setVodafoneCashNumber(data.vodafone_cash_number);

      if (data.first_order_discount !== undefined) setFirstOrderDiscount(data.first_order_discount);
      if (data.regular_discount !== undefined) setRegularDiscount(data.regular_discount);

      if (data.topup_provider_mode !== undefined) setProviderMode(data.topup_provider_mode as 'live' | 'sandbox');
      if (data.topup_provider_name !== undefined) setProviderName(data.topup_provider_name);
      if (data.topup_provider_url !== undefined) setProviderUrl(data.topup_provider_url);
      if (data.topup_provider_api_key !== undefined) setProviderApiKey(data.topup_provider_api_key);

      if (data.uid_verification_enabled !== undefined) setUidEnabled(data.uid_verification_enabled === 'true');
      if (data.uid_verification_api_url !== undefined) setUidUrl(data.uid_verification_api_url);
      if (data.uid_verification_api_key !== undefined) setUidApiKey(data.uid_verification_api_key);

      if (isManual) {
        addToast(
          isArabic ? 'تم تحديث الإعدادات من الخادم' : 'Settings reloaded from server',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Error fetching admin settings:', err);
      addToast(
        isArabic ? 'تعذر تحميل الإعدادات من قاعدة البيانات' : 'Failed to load settings from server.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [addToast, isArabic]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save Settings
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        settings: [
          { key: 'instapay_name', value: instapayName.trim() },
          { key: 'instapay_number', value: instapayNumber.trim() },
          { key: 'daqan_cash_name', value: daqanCashName.trim() },
          { key: 'daqan_cash_number', value: daqanCashNumber.trim() },
          { key: 'transfer_phone', value: transferPhone.trim() },
          { key: 'vodafone_cash_number', value: vodafoneCashNumber.trim() },
          { key: 'first_order_discount', value: String(firstOrderDiscount).trim() },
          { key: 'regular_discount', value: String(regularDiscount).trim() },
          { key: 'topup_provider_mode', value: providerMode },
          { key: 'topup_provider_name', value: providerName.trim() },
          { key: 'topup_provider_url', value: providerUrl.trim() },
          { key: 'topup_provider_api_key', value: providerApiKey.trim() },
          { key: 'uid_verification_enabled', value: String(uidEnabled) },
          { key: 'uid_verification_api_url', value: uidUrl.trim() },
          { key: 'uid_verification_api_key', value: uidApiKey.trim() },
        ],
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update settings');
      }

      addToast(
        isArabic ? 'تم حفظ وتطبيق كافة الإعدادات بنجاح' : 'All settings saved successfully',
        'success'
      );
    } catch (err: any) {
      console.error('Error updating settings:', err);
      addToast(
        err.message || (isArabic ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error occurred while saving settings'),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast(
        isArabic ? 'يرجى كتابة كلمة المرور الحالية لتأكيد التغيير' : 'Please enter your current password',
        'error'
      );
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      addToast(
        isArabic ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match',
        'error'
      );
      return;
    }
    if (newPassword && newPassword.length < 6) {
      addToast(
        isArabic ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Password must be at least 6 characters',
        'error'
      );
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update credentials');

      addToast(
        isArabic ? 'تم تحديث بيانات حساب الإدارة بنجاح!' : 'Admin credentials updated successfully!',
        'success'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(
        err.message || (isArabic ? 'فشل التحديث' : 'Update failed'),
        'error'
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  const isLiveConfigured = Boolean(providerUrl.trim()) && Boolean(providerApiKey.trim());

  if (loading) {
    return (
      <div className="p-20 flex justify-center items-center">
        <LoadingSpinner
          size="lg"
          text={isArabic ? 'جاري تحميل إعدادات المتجر...' : 'Loading store settings...'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-vip-text-primary flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-vip-purple-light" />
            <span>{isArabic ? 'إعدادات المتجر العامة' : 'Store Settings'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-vip-text-secondary mt-1">
            {isArabic
              ? 'تخصيص أرقام التحويل، دكان كاش، إنستاباي، نسب الخصومات ومزود الشحن التلقائي'
              : 'Configure payment accounts, DaQan cash, discount rates, and top-up provider API'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchSettings(true)}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إعادة تحميل' : 'Reload'}</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveAll}
            loading={saving}
            className="flex items-center gap-1.5 text-xs shadow-lg shadow-vip-purple/20"
          >
            <Save className="w-4 h-4" />
            <span>{isArabic ? 'حفظ كافة التغييرات' : 'Save All Settings'}</span>
          </Button>
        </div>
      </div>

      {/* Admin Account & Security Card */}
      <Card hover={false} glow="none" className="p-6 bg-vip-card/90 border border-vip-purple/30 shadow-xl">
        <div className="flex items-center gap-3 mb-5 border-b border-vip-border/60 pb-3">
          <div className="w-9 h-9 rounded-xl bg-vip-purple/15 border border-vip-purple/30 flex items-center justify-center text-vip-purple-light">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-vip-text-primary">
              {isArabic ? 'بيانات دخول وأمان الأدمن (البريد وكلمة المرور)' : 'Admin Login Credentials & Security'}
            </h2>
            <p className="text-xs text-vip-text-muted">
              {isArabic
                ? 'تغيير البريد الإلكتروني وكلمة المرور الخاصة بلوحة تحكم المتجر'
                : 'Change your admin email and password'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
              {isArabic ? 'البريد الإلكتروني للوحة التحكم' : 'Admin Email'}
            </label>
            <div className="relative">
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@vipstore.com"
                disabled={updatingProfile}
                className="ps-9"
              />
              <Mail className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-vip-text-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
              {isArabic ? 'كلمة المرور الحالية (مطلوبة للتأكيد)' : 'Current Password (Required)'}
            </label>
            <div className="relative">
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={updatingProfile}
                className="ps-9"
              />
              <Lock className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-vip-text-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
              {isArabic ? 'كلمة المرور الجديدة (اختياري)' : 'New Password (Optional)'}
            </label>
            <div className="relative">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={updatingProfile}
                className="ps-9"
              />
              <KeyRound className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-vip-text-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
              {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
            </label>
            <div className="relative">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={updatingProfile}
                className="ps-9"
              />
              <KeyRound className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-vip-text-muted" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            onClick={handleUpdateProfile}
            variant="secondary"
            loading={updatingProfile}
            className="px-6 border border-vip-purple/40 text-vip-purple-light hover:bg-vip-purple/20 font-bold"
          >
            <Save className="w-4 h-4 me-1.5" />
            <span>{isArabic ? 'تحديث وتغيير بيانات الدخول' : 'Update Credentials'}</span>
          </Button>
        </div>
      </Card>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: Payment Settings */}
        <Card hover={false} glow="none" className="p-6 bg-vip-card/90">
          <div className="flex items-center gap-3 mb-5 border-b border-vip-border/60 pb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-vip-text-primary">
                {isArabic ? 'بيانات وحسابات الدفع (إنستاباي، دكان كاش، المحافظ)' : 'Payment Accounts & Gateways'}
              </h2>
              <p className="text-xs text-vip-text-muted">
                {isArabic
                  ? 'الأرقام والحسابات المعروضة للعملاء لتحويل المبالغ بدقة'
                  : 'Account details shown to customers during checkout'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Transfer Phone */}
            <div className="md:col-span-2 p-3.5 rounded-xl bg-vip-purple/10 border border-vip-purple/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-vip-purple-light" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isArabic ? 'رقم التحويل الأساسي المعلن للعملاء' : 'Official Customer Transfer Number'}
                  </span>
                  <span className="text-xs text-vip-text-muted">
                    {isArabic ? 'يظهر في صفحة الدفع والشحن مع زر النسخ السريع' : 'Shown in topup & checkout with quick copy'}
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  value={transferPhone}
                  onChange={(e) => {
                    setTransferPhone(e.target.value);
                    setInstapayNumber(e.target.value);
                    setDaqanCashNumber(e.target.value);
                    setVodafoneCashNumber(e.target.value);
                  }}
                  placeholder="01069954152"
                  disabled={saving}
                  className="font-mono text-center font-bold tracking-wider"
                  required
                />
              </div>
            </div>

            {/* InstaPay Name & Number */}
            <div>
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                {isArabic ? 'اسم حساب إنستاباي (InstaPay Name)' : 'InstaPay Account Name'}
              </label>
              <Input
                type="text"
                value={instapayName}
                onChange={(e) => setInstapayName(e.target.value)}
                placeholder="VIP STORE"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                {isArabic ? 'رقم / عنوان إنستاباي (InstaPay IPA / Number)' : 'InstaPay Number / IPA'}
              </label>
              <Input
                type="text"
                value={instapayNumber}
                onChange={(e) => setInstapayNumber(e.target.value)}
                placeholder="01069954152"
                disabled={saving}
                required
              />
            </div>

            {/* DaQan Cash Name & Number */}
            <div>
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                {isArabic ? 'اسم خدمة دكان كاش / دقهلية كاش' : 'DaQan Cash / Dakahlia Cash Name'}
              </label>
              <Input
                type="text"
                value={daqanCashName}
                onChange={(e) => setDaqanCashName(e.target.value)}
                placeholder="VIP STORE - دكان كاش"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                {isArabic ? 'رقم محفظة دكان كاش / دقهلية كاش' : 'DaQan Cash Number'}
              </label>
              <Input
                type="text"
                value={daqanCashNumber}
                onChange={(e) => setDaqanCashNumber(e.target.value)}
                placeholder="01069954152"
                disabled={saving}
                required
              />
            </div>

            {/* Vodafone Cash */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                {isArabic ? 'رقم محفظة فودافون كاش / المحافظ الإلكترونية' : 'Vodafone Cash / Mobile Wallet Number'}
              </label>
              <Input
                type="text"
                value={vodafoneCashNumber}
                onChange={(e) => setVodafoneCashNumber(e.target.value)}
                placeholder="01069954152"
                disabled={saving}
                required
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Discount Settings */}
        <Card hover={false} glow="none" className="p-6 bg-vip-card/90">
          <div className="flex items-center gap-3 mb-5 border-b border-vip-border/60 pb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-vip-text-primary">
                {isArabic ? 'نظام الخصومات والعروض (Discounts System)' : 'Discount Rules & Rates'}
              </h2>
              <p className="text-xs text-vip-text-muted">
                {isArabic
                  ? 'يتم التحقق من الأهلية واحتساب الخصومات على الخادم لمنع التلاعب'
                  : 'Eligibility validated and prices calculated server-side'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                {isArabic ? 'نسبة خصم الطلب الأول للعملاء الجدد (%)' : 'First Order Discount (%)'}
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={firstOrderDiscount}
                onChange={(e) => setFirstOrderDiscount(e.target.value)}
                placeholder="50"
                disabled={saving}
                required
              />
              <p className="text-[11px] text-vip-text-muted mt-1">
                {isArabic
                  ? 'يطبق لمرة واحدة فقط لكل معرف لاعب (Free Fire UID)، ومحمي في قاعدة البيانات'
                  : 'Applies only once per Player UID, enforced on backend'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                {isArabic ? 'نسبة الخصم الدائم / العادي (%)' : 'Regular Discount (%)'}
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={regularDiscount}
                onChange={(e) => setRegularDiscount(e.target.value)}
                placeholder="20"
                disabled={saving}
                required
              />
              <p className="text-[11px] text-vip-text-muted mt-1">
                {isArabic
                  ? 'يطبق على كافة الطلبات اللاحقة للعملاء المنتظمين'
                  : 'Applies automatically to all subsequent orders'}
              </p>
            </div>
          </div>
        </Card>

        {/* Section 3: Top-up Provider Settings */}
        <Card hover={false} glow="none" className="p-6 bg-vip-card/90">
          <div
            onClick={() => setProviderOpen(!providerOpen)}
            className="flex items-center justify-between cursor-pointer select-none pb-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-vip-purple/10 border border-vip-purple/30 flex items-center justify-center text-vip-purple-light">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-vip-text-primary">
                    {isArabic ? 'مزود الشحن التلقائي (Top-up Provider Integration)' : 'Automated Top-up Provider'}
                  </h2>
                  {providerMode === 'sandbox' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      <Zap className="w-3 h-3 text-blue-400" />
                      <span>{isArabic ? 'وضع الاختبار التجريبي (Sandbox)' : 'Sandbox Mode'}</span>
                    </span>
                  ) : isLiveConfigured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{isArabic ? 'الوضع المباشر متصل (Live Mode)' : 'Live Connected'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <XCircle className="w-3 h-3 text-amber-400" />
                      <span>{isArabic ? 'بانتظار مفاتيح Live' : 'Awaiting Live Keys'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-vip-text-muted mt-0.5">
                  {isArabic
                    ? 'إرسال طلبات شحن الجواهر إلى المزود المعتمد فور تأكيد الإيصال والمطابقة'
                    : 'Dispatch top-up requests upon verified payment confirmation'}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-lg text-vip-text-muted hover:text-vip-text-primary transition-colors"
              aria-label="Toggle provider section"
            >
              {providerOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {providerOpen && (
            <div className="pt-5 mt-4 border-t border-vip-border/60 space-y-4 animate-fade-in">
              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                  {isArabic ? 'وضع التشغيل (Operation Mode)' : 'Operation Mode'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setProviderMode('sandbox')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      providerMode === 'sandbox'
                        ? 'bg-blue-500/15 border-blue-500 text-white shadow-md'
                        : 'bg-vip-bg border-vip-border text-vip-text-muted hover:border-vip-border-light'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">
                        {isArabic ? '🧪 وضع الاختبار (Sandbox)' : '🧪 Sandbox Mode'}
                      </span>
                      {providerMode === 'sandbox' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />}
                    </div>
                    <p className="text-[11px] text-vip-text-secondary">
                      {isArabic
                        ? 'يتيح اختبار دورة الدفع واعتماد الشحن وتتبع الأرقام بأمان دون خصم رصيد حقيقي.'
                        : 'Allows testing payment verification and dispatch without deducting real balance.'}
                    </p>
                  </div>

                  <div
                    onClick={() => setProviderMode('live')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      providerMode === 'live'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                        : 'bg-vip-bg border-vip-border text-vip-text-muted hover:border-vip-border-light'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">
                        {isArabic ? '⚡ الوضع الحقيقي (Live Mode)' : '⚡ Live Mode'}
                      </span>
                      {providerMode === 'live' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-vip-text-secondary">
                      {isArabic
                        ? 'يرسل الطلبات فعلياً لمزود فري فاير (Smile.One / UniPin / Garena) لشحن الجواهر الحقيقية.'
                        : 'Sends genuine top-up orders to authorized Free Fire top-up partner.'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                  {isArabic ? 'اسم المزود (Provider Name)' : 'Provider Name / Protocol'}
                </label>
                <Input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Garena / Smile.One API"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                  {isArabic ? 'رابط واجهة المزود (Top-up Provider Endpoint URL)' : 'Provider Endpoint URL'}
                </label>
                <Input
                  type="url"
                  value={providerUrl}
                  onChange={(e) => setProviderUrl(e.target.value)}
                  placeholder="https://api.provider.com/v1/topup"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                  {isArabic ? 'مفتاح الـ API السري (Provider API Key / Secret)' : 'Provider API Key / Secret'}
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={providerApiKey}
                    onChange={(e) => setProviderApiKey(e.target.value)}
                    placeholder="sk_live_••••••••••••••••"
                    disabled={saving}
                    className="pe-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-vip-text-muted hover:text-vip-text-primary p-1 transition-colors"
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Section 4: Player UID Verification */}
        <Card hover={false} glow="none" className="p-6 bg-vip-card/90">
          <div className="flex items-center gap-3 mb-5 border-b border-vip-border/60 pb-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-vip-text-primary">
                {isArabic ? 'خدمة التحقق من اسم اللاعب (Player UID Lookup API)' : 'Player UID Lookup API'}
              </h2>
              <p className="text-xs text-vip-text-muted">
                {isArabic
                  ? 'جلب اسم اللاعب الحقيقي من سيرفرات اللعبة. إذا لم تكن مهيأة، تظهر رسالة واضحة للمستخدم.'
                  : 'Fetches real in-game player name. If unconfigured, clearly communicates status without fake names.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-vip-bg border border-vip-border">
              <div>
                <span className="text-sm font-bold text-white block">
                  {isArabic ? 'تفعيل خدمة التحقق التلقائي من الـ UID' : 'Enable Automatic UID Lookup'}
                </span>
                <span className="text-xs text-vip-text-muted">
                  {isArabic ? 'يتطلب تفعيلها وجود رابط API صالح لمزود الخدمة' : 'Requires configured lookup endpoint'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={uidEnabled}
                onChange={(e) => setUidEnabled(e.target.checked)}
                className="w-5 h-5 accent-vip-purple rounded cursor-pointer"
              />
            </div>

            {uidEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                    {isArabic ? 'رابط API التحقق من الـ UID' : 'UID Lookup Endpoint URL'}
                  </label>
                  <Input
                    type="url"
                    value={uidUrl}
                    onChange={(e) => setUidUrl(e.target.value)}
                    placeholder="https://api.provider.com/v1/player-lookup"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5">
                    {isArabic ? 'مفتاح الـ API (اختياري)' : 'Lookup API Key (Optional)'}
                  </label>
                  <div className="relative">
                    <Input
                      type={showUidKey ? 'text' : 'password'}
                      value={uidApiKey}
                      onChange={(e) => setUidApiKey(e.target.value)}
                      placeholder="••••••••••••••••"
                      disabled={saving}
                      className="pe-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUidKey(!showUidKey)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-vip-text-muted hover:text-vip-text-primary p-1"
                    >
                      {showUidKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            className="px-8 shadow-xl shadow-vip-purple/20 font-bold"
          >
            <Save className="w-4 h-4 me-1.5" />
            <span>{isArabic ? 'حفظ كافة الإعدادات' : 'Save All Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
