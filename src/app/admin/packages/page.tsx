'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Gem,
  DollarSign,
  ArrowUpDown,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from 'lucide-react';
import type { DiamondPackage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { PackageForm, PackageFormData } from '@/components/admin/PackageForm';
import { useToast } from '@/hooks/useToast';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { formatPrice, formatPriceEn } from '@/lib/utils';

export default function AdminPackagesPage() {
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';
  const { toasts, addToast, removeToast } = useToast();

  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<DiamondPackage | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Delete modal state
  const [deletingPackage, setDeletingPackage] = useState<DiamondPackage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Fetch Packages
  const fetchPackages = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/admin/packages', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch packages');
      const data = await res.json();
      setPackages(data.packages || []);

      if (isManual) {
        addToast(
          isArabic ? 'تم تحديث قائمة الباقات' : 'Packages list refreshed',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Error fetching admin packages:', err);
      addToast(
        isArabic
          ? 'تعذر تحميل باقات الجواهر، يرجى المحاولة مرة أخرى'
          : 'Failed to load packages. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast, isArabic]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Handle Create or Update
  const handleFormSubmit = async (formData: PackageFormData) => {
    setFormSubmitting(true);
    try {
      if (editingPackage) {
        // Update existing package
        const res = await fetch(`/api/admin/packages/${editingPackage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update package');
        }

        addToast(
          isArabic ? 'تم تعديل الباقة بنجاح' : 'Package updated successfully',
          'success'
        );
      } else {
        // Create new package
        const res = await fetch('/api/admin/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to create package');
        }

        addToast(
          isArabic ? 'تمت إضافة الباقة بنجاح' : 'Package added successfully',
          'success'
        );
      }

      setIsFormOpen(false);
      setEditingPackage(null);
      await fetchPackages(false);
    } catch (err: any) {
      console.error('Error saving package:', err);
      addToast(
        err.message ||
          (isArabic ? 'حدث خطأ أثناء حفظ الباقة' : 'Error saving package'),
        'error'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (pkg: DiamondPackage) => {
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });

      if (!res.ok) throw new Error('Failed to toggle status');

      // Optimistic or refresh
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p))
      );

      addToast(
        !pkg.isActive
          ? isArabic
            ? 'تم تفعيل الباقة'
            : 'Package activated'
          : isArabic
          ? 'تم إلغاء تفعيل الباقة'
          : 'Package deactivated',
        'success'
      );
    } catch (err: any) {
      console.error('Error toggling package active status:', err);
      addToast(
        isArabic ? 'تعذر تغيير حالة تفعيل الباقة' : 'Failed to update active status',
        'error'
      );
    }
  };

  // Handle Delete (soft delete / deactivate)
  const handleDeleteConfirm = async () => {
    if (!deletingPackage) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/packages/${deletingPackage.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to deactivate package');

      addToast(
        isArabic
          ? 'تم تعطيل الباقة بنجاح'
          : 'Package deactivated successfully',
        'success'
      );

      setDeletingPackage(null);
      await fetchPackages(false);
    } catch (err: any) {
      console.error('Error deleting package:', err);
      addToast(
        isArabic ? 'فشل تعطيل الباقة' : 'Failed to deactivate package',
        'error'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-vip-text-primary flex items-center gap-2.5">
            <Package className="w-7 h-7 text-vip-purple-light" />
            <span>{isArabic ? 'إدارة باقات الجواهر' : 'Diamond Packages'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-vip-text-secondary mt-1">
            {isArabic
              ? 'إضافة وتعديل باقات فري فاير وضبط الأسعار وحالة الظهور'
              : 'Add and manage Free Fire packages, pricing, and visibility'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchPackages(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
            />
            <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingPackage(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إضافة باقة جديدة' : 'Add New Package'}</span>
          </Button>
        </div>
      </div>

      {/* Packages Table/Grid */}
      {loading ? (
        <div className="p-16 flex justify-center bg-vip-card/40 rounded-2xl border border-vip-border">
          <LoadingSpinner
            size="lg"
            text={isArabic ? 'جاري تحميل الباقات...' : 'Loading packages...'}
          />
        </div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center bg-vip-card/60 rounded-2xl border border-vip-border">
          <Package className="w-12 h-12 text-vip-text-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-vip-text-primary mb-1">
            {isArabic ? 'لا توجد باقات حالياً' : 'No packages found'}
          </h3>
          <p className="text-xs text-vip-text-muted mb-4">
            {isArabic
              ? 'ابدأ بإضافة باقات الجواهر ليتمكن اللاعبون من الشحن.'
              : 'Start by creating diamond packages for players to buy.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingPackage(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 me-1" />
            <span>{isArabic ? 'إضافة أول باقة' : 'Add First Package'}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const formattedPrice = isArabic
              ? formatPrice(pkg.price)
              : formatPriceEn(pkg.price);

            return (
              <Card
                key={pkg.id}
                hover
                glow={pkg.isActive ? 'purple' : 'none'}
                className={`p-5 bg-vip-card/80 border transition-all duration-200 flex flex-col justify-between ${
                  pkg.isActive
                    ? 'border-vip-border'
                    : 'border-vip-border/50 opacity-60'
                }`}
              >
                <div>
                  {/* Top info: status & sort order */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-1.5 text-xs text-vip-text-muted">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>
                        {isArabic ? 'الترتيب: ' : 'Order: '}
                        <strong>{pkg.sortOrder}</strong>
                      </span>
                    </span>

                    {/* Active toggle button */}
                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        pkg.isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-500/15 text-red-300 border-red-500/30'
                      }`}
                      title={
                        pkg.isActive
                          ? isArabic
                            ? 'انقر للتعطيل'
                            : 'Click to deactivate'
                          : isArabic
                          ? 'انقر للتفعيل'
                          : 'Click to activate'
                      }
                    >
                      {pkg.isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                          <span>{isArabic ? 'مفعلة' : 'Active'}</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-red-400" />
                          <span>{isArabic ? 'معطلة' : 'Inactive'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Diamonds display */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                      <Gem className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-cyan-400 font-mono">
                        {pkg.diamonds.toLocaleString()}
                      </h3>
                      <span className="text-xs text-vip-text-secondary font-medium">
                        {isArabic ? 'جوهرة فري فاير' : 'Free Fire Diamonds'}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="p-3 rounded-xl bg-vip-bg border border-vip-border/80 mb-4 flex items-center justify-between">
                    <span className="text-xs text-vip-text-muted">
                      {isArabic ? 'السعر الرسمي' : 'Regular Price'}
                    </span>
                    <span className="text-base font-bold text-gradient-gold">
                      {formattedPrice}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-vip-border/60">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingPackage(pkg);
                      setIsFormOpen(true);
                    }}
                    className="text-xs flex items-center gap-1 hover:border-vip-purple hover:text-vip-purple-light"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تعديل' : 'Edit'}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingPackage(pkg)}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5"
                    title={isArabic ? 'تعطيل الباقة' : 'Deactivate package'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Package Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          if (!formSubmitting) {
            setIsFormOpen(false);
            setEditingPackage(null);
          }
        }}
        title={
          editingPackage
            ? isArabic
              ? 'تعديل باقة الجواهر'
              : 'Edit Diamond Package'
            : isArabic
            ? 'إضافة باقة جديدة'
            : 'Add New Package'
        }
      >
        <PackageForm
          package={editingPackage}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingPackage(null);
          }}
          loading={formSubmitting}
        />
      </Modal>

      {/* Delete/Deactivate Confirmation Modal */}
      <Modal
        isOpen={!!deletingPackage}
        onClose={() => !deleteLoading && setDeletingPackage(null)}
        title={isArabic ? 'تأكيد تعطيل الباقة' : 'Confirm Package Deactivation'}
      >
        <div className="space-y-4 p-2">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              {isArabic
                ? `هل أنت متأكد من رغبتك في تعطيل باقة (${deletingPackage?.diamonds} جوهرة)؟ لن تظهر للعملاء في صفحة الشحن.`
                : `Are you sure you want to deactivate package (${deletingPackage?.diamonds} diamonds)? It will no longer appear on the top-up page.`}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-vip-border/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeletingPackage(null)}
              disabled={deleteLoading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteLoading}
              onClick={handleDeleteConfirm}
            >
              {isArabic ? 'تعطيل الآن' : 'Deactivate Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
