'use client';

import React from 'react';
import Link from 'next/link';
import { Gem, ShieldCheck, Zap, Heart } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguageContext();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#07070b] border-t border-vip-border text-vip-text-secondary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Gem className="w-4 h-4 text-black" />
            </div>
            <span className="text-xl font-black tracking-wider text-gradient-gold">
              VIP STORE
            </span>
          </Link>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="/"
              className="hover:text-vip-text-primary transition-colors hover:underline underline-offset-4"
            >
              {t('home')}
            </Link>
            <Link
              href="/topup"
              className="hover:text-vip-text-primary transition-colors hover:underline underline-offset-4"
            >
              {t('topup')}
            </Link>
            <Link
              href="/track"
              className="hover:text-vip-text-primary transition-colors hover:underline underline-offset-4"
            >
              {t('tracking')}
            </Link>
            <Link
              href="/admin"
              className="text-amber-400/80 hover:text-amber-400 transition-colors hover:underline underline-offset-4 flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>لوحة الإدارة</span>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-vip-text-muted">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-vip-card border border-vip-border">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('securePayment')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-vip-card border border-vip-border">
              <Zap className="w-3.5 h-3.5 text-vip-purple-light" />
              <span>{t('fastDelivery')}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-vip-border my-2" />

          {/* Copyright */}
          <p className="text-xs text-vip-text-muted flex items-center justify-center gap-1">
            <span>© {currentYear} VIP STORE. {t('allRightsReserved').replace('© 2024 VIP STORE. ', '')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
