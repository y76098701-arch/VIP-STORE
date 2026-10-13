'use client';

import React, { useState, useEffect } from 'react';
import type { DiamondPackage } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Gem, DollarSign, ArrowUpDown, CheckSquare, Square } from 'lucide-react';

export interface PackageFormData {
  diamonds: number;
  price: number;
  sortOrder: number;
  isActive: boolean;
  currency?: string;
}

export interface PackageFormProps {
  package?: DiamondPackage | null;
  initialData?: DiamondPackage | null;
  onSubmit: (data: PackageFormData) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const PackageForm: React.FC<PackageFormProps> = ({
  package: pkgProp,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const currentPkg = pkgProp || initialData;
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';

  const [diamonds, setDiamonds] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('0');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentPkg) {
      setDiamonds(String(currentPkg.diamonds));
      setPrice(String(currentPkg.price));
      setSortOrder(String(currentPkg.sortOrder ?? 0));
      setIsActive(currentPkg.isActive ?? true);
    } else {
      setDiamonds('');
      setPrice('');
      setSortOrder('0');
      setIsActive(true);
    }
    setErrors({});
  }, [currentPkg]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numDiamonds = parseInt(diamonds, 10);
    if (!diamonds || isNaN(numDiamonds) || numDiamonds <= 0) {
      newErrors.diamonds = isArabic
        ? 'يرجى إدخال عدد جواهر صحيح أكبر من صفر'
        : 'Please enter a valid diamond count greater than 0';
    }

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = isArabic
        ? 'يرجى إدخال سعر صحيح أكبر من صفر'
        : 'Please enter a valid price greater than 0';
    }

    const numSortOrder = parseInt(sortOrder, 10);
    if (isNaN(numSortOrder)) {
      newErrors.sortOrder = isArabic
        ? 'يرجى إدخال ترتيب صحيح'
        : 'Please enter a valid sort order number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      diamonds: parseInt(diamonds, 10),
      price: parseFloat(price),
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
      currency: currentPkg?.currency || 'EGP',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Diamonds */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-vip-text-secondary mb-1.5 select-none">
          <span className="flex items-center gap-1.5">
            <Gem className="w-4 h-4 text-cyan-400" />
            {isArabic ? 'عدد الجواهر' : 'Diamonds Count'}
          </span>
        </label>
        <Input
          type="number"
          min="1"
          step="1"
          value={diamonds}
          onChange={(e) => setDiamonds(e.target.value)}
          placeholder={isArabic ? 'مثال: 520' : 'e.g. 520'}
          error={errors.diamonds}
          disabled={loading}
          required
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-vip-text-secondary mb-1.5 select-none">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-400" />
            {isArabic ? 'السعر (ج.م)' : 'Price (EGP)'}
          </span>
        </label>
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={isArabic ? 'مثال: 125' : 'e.g. 125'}
          error={errors.price}
          disabled={loading}
          required
        />
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-vip-text-secondary mb-1.5 select-none">
          <span className="flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-vip-purple-light" />
            {isArabic ? 'ترتيب الظهور' : 'Sort Order'}
          </span>
        </label>
        <Input
          type="number"
          step="1"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder={isArabic ? '0, 1, 2...' : '0, 1, 2...'}
          error={errors.sortOrder}
          disabled={loading}
        />
        <p className="text-[11px] text-vip-text-muted mt-1">
          {isArabic
            ? 'الأرقام الأصغر تظهر أولاً في قائمة الباقات'
            : 'Lower numbers appear first in the packages list'}
        </p>
      </div>

      {/* Is Active Toggle */}
      <div className="pt-2">
        <label
          onClick={() => !loading && setIsActive(!isActive)}
          className="flex items-center gap-3 p-3 rounded-xl border border-vip-border bg-vip-card/50 hover:bg-vip-card cursor-pointer select-none transition-colors"
        >
          {isActive ? (
            <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-vip-text-muted shrink-0" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-vip-text-primary">
              {isArabic ? 'تفعيل الباقة' : 'Active Package'}
            </span>
            <span className="text-[11px] text-vip-text-muted">
              {isArabic
                ? 'عند التفعيل تظهر الباقة للعملاء في صفحة الشحن'
                : 'When active, this package is available for customers to purchase'}
            </span>
          </div>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-vip-border/60">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {currentPkg
            ? isArabic
              ? 'تحديث الباقة'
              : 'Update Package'
            : isArabic
            ? 'إضافة الباقة'
            : 'Add Package'}
        </Button>
      </div>
    </form>
  );
};

export default PackageForm;
