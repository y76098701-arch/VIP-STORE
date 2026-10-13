'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gem, ArrowRight, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatPriceEn } from '@/lib/utils';
import type { DiamondPackage } from '@/types';

// Default fallback packages to ensure instant aesthetic render even if DB is seeding
const FALLBACK_PACKAGES: DiamondPackage[] = [
  { id: 'pkg-1', diamonds: 100, price: 25, currency: 'EGP', isActive: true, sortOrder: 1 },
  { id: 'pkg-2', diamonds: 310, price: 75, currency: 'EGP', isActive: true, sortOrder: 2 },
  { id: 'pkg-3', diamonds: 520, price: 125, currency: 'EGP', isActive: true, sortOrder: 3 },
  { id: 'pkg-4', diamonds: 1060, price: 250, currency: 'EGP', isActive: true, sortOrder: 4 },
  { id: 'pkg-5', diamonds: 2180, price: 500, currency: 'EGP', isActive: true, sortOrder: 5 },
  { id: 'pkg-6', diamonds: 5600, price: 1250, currency: 'EGP', isActive: true, sortOrder: 6 },
];

export const PackagesPreview: React.FC = () => {
  const { t, language, dir } = useLanguageContext();
  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    let isMounted = true;
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/packages');
        if (res.ok) {
          const data = await res.json();
          if (data.packages && data.packages.length > 0) {
            if (isMounted) setPackages(data.packages);
            return;
          }
        }
        // Fallback if empty response
        if (isMounted) setPackages(FALLBACK_PACKAGES);
      } catch {
        // Fallback on network/fetch error
        if (isMounted) setPackages(FALLBACK_PACKAGES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPackages();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDisplayPrice = (price: number) => {
    return language === 'ar' ? formatPrice(price) : formatPriceEn(price);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Free Fire Direct Top-Up</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-vip-text-primary tracking-tight">
          {t('featuredPackages')}
        </h2>
        <p className="mt-3 text-vip-text-secondary text-base sm:text-lg">
          {language === 'ar'
            ? 'خصم 20% دائم مدى الحياة على كل الباقات + خصم 50% متاح لأول طلب!'
            : '20% lifetime discount on all packages + 50% off on your first order!'}
        </p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner size="lg" text={t('loading')} />
        </div>
      ) : (
        /* Package Cards Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {packages.map((pkg) => {
            const discountedPrice20 = pkg.price * 0.8;
            return (
              <Link
                key={pkg.id}
                href={`/topup?package=${pkg.id}`}
                className="group block focus:outline-none"
              >
                <Card
                  glow="purple"
                  hover={true}
                  className="relative overflow-hidden flex flex-col justify-between h-full p-5 sm:p-6 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-vip-purple/20 border-vip-border/80 hover:border-vip-purple/60"
                >
                  {/* Discount Badge on top */}
                  <div className="absolute top-3 end-3 z-10">
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full bg-gradient-to-r from-vip-purple to-vip-blue text-white shadow-md border border-vip-purple/30">
                      🔥 {language === 'ar' ? 'خصم 20%' : '20% OFF'}
                    </span>
                  </div>

                  <div>
                    {/* Diamonds Icon & Count */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Gem className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      </div>
                      <div>
                        <span className="block text-2xl sm:text-3xl font-black text-gradient-gold">
                          {pkg.diamonds.toLocaleString()}
                        </span>
                        <span className="text-xs text-vip-text-muted font-medium">
                          {t('diamonds')}
                        </span>
                      </div>
                    </div>

                    {/* Price Section: Strikethrough Real Price & Discounted Price Underneath */}
                    <div className="mt-4 pt-3 border-t border-vip-border/70 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] text-vip-text-muted">
                            {language === 'ar' ? 'السعر الحقيقي:' : 'Original:'}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold line-through text-vip-text-muted/80 font-mono">
                            {formatDisplayPrice(pkg.price)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl sm:text-2xl font-black text-vip-gold font-mono tracking-tight">
                            {formatDisplayPrice(discountedPrice20)}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400">
                            {language === 'ar' ? 'بعد الخصم' : 'Final'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded self-start sm:self-auto">
                        {language === 'ar' ? 'تسليم فوري' : 'Instant'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom CTA Button inside Card */}
                  <div className="mt-5">
                    <div className="w-full py-2.5 px-4 rounded-lg bg-vip-card-hover border border-vip-border group-hover:border-vip-purple group-hover:bg-gradient-to-r group-hover:from-vip-purple group-hover:to-vip-blue text-vip-text-primary group-hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-200">
                      <Zap className="w-4 h-4 text-vip-purple-light group-hover:text-white" />
                      <span>{t('topupNow')}</span>
                      <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PackagesPreview;
