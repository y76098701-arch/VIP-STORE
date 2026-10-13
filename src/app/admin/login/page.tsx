'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguageContext } from '@/contexts/LanguageContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(
        isArabic
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
          : 'Please enter both email and password'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(
          isArabic
            ? 'بيانات الاعتماد غير صحيحة، يرجى التحقق من البريد وكلمة المرور'
            : 'Invalid credentials. Please verify your email and password.'
        );
      } else if (res?.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(
        isArabic
          ? 'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى'
          : 'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-[#07070c] overflow-hidden select-none">
      {/* Background Glow Spheres */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-vip-purple/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-vip-blue/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        <Card
          hover={false}
          glow="purple"
          className="p-6 sm:p-8 bg-[#111118]/90 backdrop-blur-xl border border-vip-border shadow-2xl rounded-2xl"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-vip-purple to-vip-blue p-0.5 shadow-lg shadow-vip-purple/30 mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0d14] rounded-[14px] flex items-center justify-center">
                <Shield className="w-7 h-7 text-vip-purple-light" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-gradient-gold">
              VIP STORE
            </h1>
            <p className="text-xs sm:text-sm text-vip-text-secondary mt-1 font-medium">
              {isArabic ? 'تسجيل دخول لوحة الإدارة' : 'Admin Dashboard Login'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5 select-none">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-vip-purple-light" />
                  {isArabic ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or Email'}
                </span>
              </label>
              <Input
                type="text"
                autoComplete="username"
                placeholder={isArabic ? 'youssef' : 'youssef'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-vip-text-secondary mb-1.5 select-none">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-vip-blue-light" />
                  {isArabic ? 'كلمة المرور' : 'Password'}
                </span>
              </label>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full font-bold shadow-lg shadow-vip-purple/30 group"
              >
                <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 ms-2 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Button>
            </div>
          </form>

          {/* Subtle footer */}
          <div className="mt-8 pt-4 border-t border-vip-border/60 text-center">
            <p className="text-[11px] text-vip-text-muted">
              {isArabic
                ? 'لوحة إدارة محمية بنظام تشفير ومصادقة مشدد'
                : 'Secured admin portal protected by encrypted credentials'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
