'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  ArrowRight,
  RefreshCw,
  Clock,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';
import type { AdminStats, Order } from '@/types';
import { StatsCards } from '@/components/admin/StatsCards';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useLanguageContext } from '@/contexts/LanguageContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';
  const { toasts, addToast, removeToast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (!statsRes.ok) throw new Error('Failed to fetch statistics');
      const statsData = await statsRes.json();
      setStats(statsData.stats || statsData);

      // 2. Fetch Recent Orders (limit 10)
      const ordersRes = await fetch('/api/admin/orders?limit=10', {
        cache: 'no-store',
      });
      if (!ordersRes.ok) throw new Error('Failed to fetch recent orders');
      const ordersData = await ordersRes.json();
      setRecentOrders(ordersData.orders || []);

      if (isManualRefresh) {
        addToast(
          isArabic ? 'تم تحديث البيانات بنجاح' : 'Dashboard data refreshed',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      addToast(
        isArabic
          ? 'تعذر تحميل بيانات لوحة التحكم، يرجى المحاولة مرة أخرى'
          : 'Failed to load dashboard data. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast, isArabic]);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh stats every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Top Header / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-vip-text-primary">
            {isArabic ? 'لوحة المراقبة العامة' : 'Dashboard Overview'}
          </h1>
          <p className="text-xs sm:text-sm text-vip-text-secondary mt-1">
            {isArabic
              ? 'متابعة لحظية للطلبات، المبيعات وحالة الشحن المالي والجواهر'
              : 'Real-time overview of orders, revenue, and Free Fire top-ups'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
            />
            <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
          </Button>

          <Link href="/admin/orders">
            <Button variant="primary" size="sm" className="text-xs">
              <ShoppingCart className="w-3.5 h-3.5 me-1.5" />
              <span>{isArabic ? 'كل الطلبات' : 'All Orders'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Section */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <LoadingSpinner
            size="lg"
            text={isArabic ? 'جاري تحميل الإحصائيات...' : 'Loading statistics...'}
          />
        </div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-vip-text-muted uppercase">
              {isArabic ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Metrics'}
            </h2>
          </div>
          <StatsCards stats={stats} />
        </div>
      ) : null}

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-vip-purple-light" />
            <h2 className="text-lg font-bold text-vip-text-primary">
              {isArabic ? 'أحدث الطلبات (آخر 10)' : 'Recent Orders (Last 10)'}
            </h2>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-vip-purple-light hover:text-vip-blue-light transition-colors group"
          >
            <span>{isArabic ? 'عرض كافة الطلبات' : 'View All Orders'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center bg-vip-card/40 rounded-2xl border border-vip-border">
            <LoadingSpinner
              size="md"
              text={isArabic ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
            />
          </div>
        ) : (
          <OrdersTable orders={recentOrders} onViewOrder={handleViewOrder} />
        )}
      </div>
    </div>
  );
}
