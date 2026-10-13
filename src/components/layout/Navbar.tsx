'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Gem, Home, Zap, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { WhatsAppIcon } from '@/components/ui/WhatsAppHelpButton';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const { t } = useLanguageContext();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/topup', label: t('topup'), icon: Zap },
    { href: '/track', label: t('tracking'), icon: Search },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-vip-border shadow-lg shadow-black/40 py-3'
          : 'bg-vip-bg/60 backdrop-blur-md border-b border-vip-border/40 py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Gem className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-wider text-gradient-gold">
              VIP STORE
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-vip-card/60 p-1.5 rounded-full border border-vip-border/60 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 select-none',
                    isActive
                      ? 'text-white'
                      : 'text-vip-text-secondary hover:text-vip-text-primary hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-gradient-to-r from-vip-purple to-vip-blue rounded-full shadow-md shadow-vip-purple/30 -z-10"
                      transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Language Switcher & WhatsApp Help & Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Quick Help Button */}
            <a
              href="https://wa.me//+201069954152"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.25)] select-none"
              title="تواصل معنا عبر واتساب للمساعدة"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">المساعدة</span>
            </a>

            <LanguageSwitcher />

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-vip-card border border-vip-border text-vip-text-secondary hover:text-vip-text-primary hover:border-vip-purple/50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sliding Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-b border-vip-border bg-vip-card/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-5 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-vip-purple to-vip-blue text-white shadow-lg shadow-vip-purple/20'
                        : 'text-vip-text-secondary hover:text-vip-text-primary hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* WhatsApp Help in Mobile Drawer */}
              <a
                href="https://wa.me//+201069954152"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all mt-2"
              >
                <WhatsAppIcon className="w-5 h-5 text-emerald-400" />
                <span>المساعدة والدعم (واتساب)</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
