'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  X,
  ExternalLink,
  Shield,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageContext } from '@/contexts/LanguageContext';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  className,
}) => {
  const pathname = usePathname();
  const { language, dir } = useLanguageContext();
  const isArabic = language === 'ar';

  const navItems = [
    {
      href: '/admin',
      label: isArabic ? 'لوحة التحكم' : 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/orders',
      label: isArabic ? 'إدارة الطلبات' : 'Orders',
      icon: ShoppingCart,
      exact: false,
    },
    {
      href: '/admin/ai-auto-charge',
      label: isArabic ? 'ربط الهاتف والشحن بالـ AI' : 'AI Auto-Charge',
      icon: Bot,
      exact: false,
    },
    {
      href: '/admin/packages',
      label: isArabic ? 'باقات الجواهر' : 'Packages',
      icon: Package,
      exact: false,
    },
    {
      href: '/admin/settings',
      label: isArabic ? 'إعدادات المتجر' : 'Settings',
      icon: Settings,
      exact: false,
    },
  ];

  const isActiveLink = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col w-64 bg-[#0d0d14] border-vip-border transition-transform duration-300 ease-in-out',
          dir === 'rtl'
            ? 'right-0 border-l lg:border-l'
            : 'left-0 border-r lg:border-r',
          // Desktop: sticky in layout / visible
          'lg:static lg:translate-x-0 lg:z-30',
          // Mobile open/close transition
          isOpen
            ? 'translate-x-0'
            : dir === 'rtl'
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-vip-border/60">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 group"
            onClick={onClose}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vip-purple to-vip-blue p-0.5 shadow-md shadow-vip-purple/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0d14] rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-vip-purple-light" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider text-gradient-gold">
                VIP STORE
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-vip-text-muted uppercase">
                {isArabic ? 'لوحة الإدارة' : 'Admin Panel'}
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-vip-text-muted hover:text-vip-text-primary hover:bg-white/5 lg:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActiveLink(item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 select-none group',
                  active
                    ? cn(
                        'bg-vip-purple/10 text-vip-purple-light shadow-sm shadow-vip-purple/10',
                        dir === 'rtl'
                          ? 'border-r-4 border-vip-purple pr-3'
                          : 'border-l-4 border-vip-purple pl-3'
                      )
                    : 'text-vip-text-secondary hover:text-vip-text-primary hover:bg-white/5'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0',
                    active
                      ? 'text-vip-purple-light'
                      : 'text-vip-text-muted group-hover:text-vip-text-secondary'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-vip-border/60 space-y-2">
          {/* View storefront link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-vip-text-secondary hover:text-vip-text-primary hover:bg-white/5 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-vip-text-muted group-hover:text-vip-text-primary transition-colors" />
              {isArabic ? 'زيارة المتجر' : 'Visit Storefront'}
            </span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-vip-card border border-vip-border text-vip-text-muted">
              Live
            </span>
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
