'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingCart,
  X,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { ORDER_STATUSES, getStatusLabel } from '@/lib/utils';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { language, dir } = useLanguageContext();
  const isArabic = language === 'ar';
  const { toasts, addToast, removeToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters & Pagination State
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchOrders = useCallback(
    async (pageToLoad = currentPage, isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', String(pageToLoad));
        queryParams.set('limit', '15');

        if (selectedStatus && selectedStatus !== 'ALL') {
          queryParams.set('status', selectedStatus);
        }

        if (debouncedSearch.trim()) {
          queryParams.set('search', debouncedSearch.trim());
        }

        const res = await fetch(`/api/admin/orders?${queryParams.toString()}`, {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to fetch orders');

        const data = await res.json();
        setOrders(data.orders || []);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);

        if (isManual) {
          addToast(
            isArabic ? 'تم تحديث قائمة الطلبات' : 'Orders list updated',
            'success'
          );
        }
      } catch (err: any) {
        console.error('Error fetching admin orders:', err);
        addToast(
          isArabic
            ? 'تعذر جلب الطلبات، يرجى إعادة المحاولة'
            : 'Failed to fetch orders. Please retry.',
          'error'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, selectedStatus, debouncedSearch, addToast, isArabic]
  );

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setDebouncedSearch(searchQuery);
  };

  const handleClearFilters = () => {
    setSelectedStatus('ALL');
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const statusOptions = [
    { value: 'ALL', label: isArabic ? 'جميع الحالات' : 'All Statuses' },
    ...Object.keys(ORDER_STATUSES).map((statusKey) => ({
      value: statusKey,
      label: getStatusLabel(statusKey, language),
    })),
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-vip-text-primary flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-vip-purple-light" />
            <span>{isArabic ? 'إدارة الطلبات' : 'Orders Management'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-vip-text-secondary mt-1">
            {isArabic
              ? `إجمالي الطلبات المسجلة: ${totalCount} طلب`
              : `Total recorded orders: ${totalCount}`}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchOrders(currentPage, true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
          />
          <span>{isArabic ? 'تحديث البيانات' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-vip-card border border-vip-border shadow-md space-y-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
        >
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Input
              type="text"
              placeholder={
                isArabic
                  ? 'بحث برقم الطلب (VIP-XXXX) أو معرف اللاعب (UID)...'
                  : 'Search by Order # or Player UID...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pe-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearch('');
                  setCurrentPage(1);
                }}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-vip-text-muted hover:text-vip-text-primary p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-4">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-vip-bg border border-vip-border text-vip-text-primary text-sm hover:border-vip-border-light focus:border-vip-purple focus:ring-1 focus:ring-vip-purple/30 outline-none transition-all cursor-pointer appearance-none"
              >
                {statusOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-[#0e0e15] text-vip-text-primary py-1"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-vip-text-muted">
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2 flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-xs font-semibold"
            >
              <Search className="w-3.5 h-3.5 me-1" />
              <span>{isArabic ? 'بحث' : 'Search'}</span>
            </Button>

            {(selectedStatus !== 'ALL' || debouncedSearch) && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleClearFilters}
                className="px-2 text-vip-text-muted hover:text-red-400"
                title={isArabic ? 'إعادة تعيين الفلاتر' : 'Reset filters'}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Orders Table Container */}
      {loading ? (
        <div className="p-16 flex justify-center bg-vip-card/40 rounded-2xl border border-vip-border">
          <LoadingSpinner
            size="lg"
            text={isArabic ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
          />
        </div>
      ) : (
        <OrdersTable orders={orders} onViewOrder={handleViewOrder} />
      )}

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 bg-vip-card/60 rounded-xl border border-vip-border">
          <div className="text-xs text-vip-text-muted">
            {isArabic ? (
              <span>
                الصفحة <strong className="text-vip-text-primary">{currentPage}</strong> من{' '}
                <strong className="text-vip-text-primary">{totalPages}</strong> (
                {totalCount} طلب إجمالاً)
              </span>
            ) : (
              <span>
                Page <strong className="text-vip-text-primary">{currentPage}</strong> of{' '}
                <strong className="text-vip-text-primary">{totalPages}</strong> (
                {totalCount} total orders)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || loading}
              className="text-xs"
            >
              {dir === 'rtl' ? (
                <ChevronRight className="w-4 h-4 me-1" />
              ) : (
                <ChevronLeft className="w-4 h-4 me-1" />
              )}
              <span>{isArabic ? 'السابق' : 'Previous'}</span>
            </Button>

            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-vip-purple/20 text-vip-purple-light border border-vip-purple/30">
              {currentPage}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages || loading}
              className="text-xs"
            >
              <span>{isArabic ? 'التالي' : 'Next'}</span>
              {dir === 'rtl' ? (
                <ChevronLeft className="w-4 h-4 ms-1" />
              ) : (
                <ChevronRight className="w-4 h-4 ms-1" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
