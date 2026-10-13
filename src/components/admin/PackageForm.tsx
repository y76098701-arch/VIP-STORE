'use client';

import React, { useState, useEffect } from 'react';
import type { DiamondPackage } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Gem, DollarSign, ArrowUpDown, CheckSquare, Square, Tag, Layers } from 'lucide-react';

export interface PackageFormData {
  name?: string;
  category?: string;
  badge?: string;
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

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('DIAMONDS');
  const [badge, setBadge] = useState<string>('');
  const [diamonds, setDiamonds] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('0');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentPkg) {
      setName(currentPkg.name || '');
      setCategory(currentPkg.category || 'DIAMONDS');
      setBadge(currentPkg.badge || '');
      setDiamonds(String(currentPkg.diamonds));
      setPrice(String(currentPkg.price));
      setSortOrder(String(currentPkg.sortOrder ?? 0));
      setIsActive(currentPkg.isActive ?? true);
    } else {
      setName('');
      setCategory('DIAMONDS');
      setBadge('');
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
      name: name.trim() || undefined,
      category: category || 'DIAMONDS',
      badge: badge.trim() || undefined,
      diamonds: parseInt(diamonds, 10),
      price: parseFloat(price),
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
      currency: currentPkg?.currency || 'EGP',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name / Title */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-vip-text-secondary mb-1.5 select-none">
          <span className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-vip-purple-light" />
            {isArabic ? 'اسم الباقة / العرض (اختياري للدروبات والعضويات)' : 'Package Name (e.g. Airdrop $2)'}
          </span>
        </label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isArabic ? 'مثال: دروب 2 دولار أو عضوية أسبوعية' : 'e.g. Airdrop $2 or Weekly Membership'}
          disabled={loading}
        />
        <p className="text-[11px] text-vip-text-muted mt-1">
          {isArabic ? 'اتركه فارغاً إذا كانت باقة جواهر عادية ليظهر عدد الجواهر فقط' : 'Leave empty for regular diamond packs'}
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-vip-text-secondary mb-1.5 select-none">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-vip-cyan" />
            {isArabic ? 'نوع وتصنيف الباقة' : 'Category'}
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setCategory('DIAMONDS')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
              category === 'DIAMONDS'
                ? 'bg-vip-gold/20 text-vip-gold border-vip-gold/40'
                : 'bg-vip-card text-vip-text-secondary border-vip-border'
            }`}
          >
            💎 {isArabic ? 'جواهر' : 'Diamonds'}
          </button>
          <button
            type="button"
            onClick={() => setCategory('MEMBERSHIP')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
              category === 'MEMBERSHIP'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-vip-card text-vip-text-secondary border-vip-border'
            }`}
          >
            👑 {isArabic ? 'عضوية VIP' : 'Membership'}
          </button>
          <button
            type="button"
            onClick={() => setCategory('AIRDROP')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
              category === 'AIRDROP'
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                : 'bg-vip-card text-vip-text-secondary border-vip-border'
            }`}
          >
            🎁 {isArabic ? 'دروب خاص' : 'Airdrop'}
          </button>
        </div>
      </div>

      {/* Badge */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-vip-text-secondary mb-1.5 select-none">
          {isArabic ? 'شارة مميزة (Badge)' : 'Badge Label'}
        </label>
        <Input
          type="text"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder={isArabic ? 'مثال: دروب 2$ أو أسبوعية VIP' : 'e.g. VIP or Airdrop $2'}
          disabled={loading}
        />
      </div>

      {/* Diamonds */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-vip-text-secondary mb-1.5 select-none">
          <span className="flex items-center gap-1.5">
            <Gem className="w-4 h-4 text-cyan-400" />
            {isArabic ? 'عدد الجواهر (أو قيمة الدروب بالجواهر)' : 'Diamonds Count'}
          </span>
        </label>
        <Input
          type="number"
          min="1"
          step="1"
          value={diamonds}
          onChange={(e) => setDiamonds(e.target.value)}
          placeholder={isArabic ? 'مثال: 300' : 'e.g. 300'}
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
            {isArabic ? 'السعر الحقيقي قبل الخصم (ج.م)' : 'Original Price (EGP)'}
          </span>
        </label>
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={isArabic ? 'مثال: 90' : 'e.g. 90'}
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
      </div>

      {/* Is Active Toggle */}
      <div className="pt-1">
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
              {isArabic ? 'تفعيل الباقة / العرض' : 'Active Package'}
            </span>
            <span className="text-xs text-vip-text-muted">
              {isArabic
                ? 'الباقات المفعلة فقط هي التي تظهر للعملاء في صفحة الشحن'
                : 'Only active packages are visible to customers on topup'}
            </span>
          </div>
        </label>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-vip-border/60">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={loading}
        >
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={loading}
        >
          {currentPkg
            ? isArabic
              ? 'حفظ التعديلات'
              : 'Save Changes'
            : isArabic
            ? 'إضافة الباقة'
            : 'Create Package'}
        </Button>
      </div>
    </form>
  );
};
