'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, User, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/admin/Sidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { language, dir } = useLanguageContext();
  const isArabic = language === 'ar';

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, isLoginPage, router]);

  // If on login page, just render children without sidebar or protection check
  if (isLoginPage) {
    return <div className="min-h-screen bg-vip-bg text-vip-text-primary">{children}</div>;
  }

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vip-bg">
        <LoadingSpinner
          size="lg"
          text={isArabic ? 'جاري التحقق من صلاحيات الدخول...' : 'Verifying admin permissions...'}
        />
      </div>
    );
  }

  // If unauthenticated, return null while router redirects
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-[#0a0a0f] text-vip-text-primary flex flex-col lg:flex-row antialiased',
        dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Admin Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 sm:h-20 bg-[#0d0d14]/90 backdrop-blur-md border-b border-vip-border flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Hamburger menu button for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-vip-text-muted hover:text-vip-text-primary hover:bg-white/5 lg:hidden border border-vip-border/60"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-vip-purple/15 text-vip-purple-light border border-vip-purple/30">
                <Shield className="w-3.5 h-3.5" />
                <span>{isArabic ? 'لوحة تحكم المشرف' : 'Administrator'}</span>
              </span>
            </div>
          </div>

          {/* User profile info & Live Store shortcut */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-vip-text-secondary hover:text-vip-text-primary bg-vip-card/80 border border-vip-border px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isArabic ? 'زيارة المتجر' : 'Storefront'}</span>
            </Link>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-vip-card border border-vip-border">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-vip-purple to-vip-blue flex items-center justify-center text-white text-xs font-bold shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-start">
                <span className="text-xs font-bold text-vip-text-primary leading-tight">
                  {session?.user?.name || (isArabic ? 'المشرف' : 'Admin')}
                </span>
                <span className="text-[10px] text-vip-text-muted leading-tight truncate max-w-[120px]">
                  {session?.user?.email || 'admin@vipstore.com'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
