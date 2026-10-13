'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  DollarSign,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import type { AdminStats } from '@/types';
import { Card } from '@/components/ui/Card';
import { formatPrice, formatPriceEn } from '@/lib/utils';
import { useLanguageContext } from '@/contexts/LanguageContext';

export interface StatsCardsProps {
  stats: AdminStats;
  className?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, className }) => {
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';

  const cardItems = [
    {
      id: 'totalOrders',
      label: isArabic ? 'إجمالي الطلبات' : 'Total Orders',
      value: (stats.totalOrders ?? 0).toLocaleString(),
      icon: ShoppingBag,
      color: 'blue',
      glow: 'neon-border-blue',
      iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      valueColor: 'text-blue-400',
    },
    {
      id: 'pendingOrders',
      label: isArabic ? 'طلبات معلقة' : 'Pending Orders',
      value: (stats.pendingOrders ?? 0).toLocaleString(),
      icon: Clock,
      color: 'yellow',
      glow: 'border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      valueColor: 'text-amber-400',
    },
    {
      id: 'completedOrders',
      label: isArabic ? 'طلبات مكتملة' : 'Completed Orders',
      value: (stats.completedOrders ?? 0).toLocaleString(),
      icon: CheckCircle,
      color: 'green',
      glow: 'border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      valueColor: 'text-emerald-400',
    },
    {
      id: 'totalRevenue',
      label: isArabic ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: isArabic
        ? formatPrice(stats.totalRevenue ?? 0)
        : formatPriceEn(stats.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'gold',
      glow: 'neon-border-gold',
      iconBg: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      valueColor: 'text-gradient-gold',
    },
    {
      id: 'todayOrders',
      label: isArabic ? 'طلبات اليوم' : "Today's Orders",
      value: (stats.todayOrders ?? 0).toLocaleString(),
      icon: Calendar,
      color: 'purple',
      glow: 'neon-border',
      iconBg: 'bg-vip-purple/15 text-vip-purple-light border-vip-purple/30',
      valueColor: 'text-vip-purple-light',
    },
    {
      id: 'todayRevenue',
      label: isArabic ? 'إيرادات اليوم' : "Today's Revenue",
      value: isArabic
        ? formatPrice(stats.todayRevenue ?? 0)
        : formatPriceEn(stats.todayRevenue ?? 0),
      icon: TrendingUp,
      color: 'cyan',
      glow: 'border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      valueColor: 'text-cyan-400',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 ${
        className || ''
      }`}
    >
      {cardItems.map((item) => {
        const Icon = item.icon;

        return (
          <motion.div key={item.id} variants={itemVariants}>
            <Card
              hover
              glow="none"
              className={`p-4 sm:p-5 flex flex-col justify-between h-full bg-[#13131a] relative overflow-hidden transition-all duration-300 ${item.glow}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-vip-text-muted truncate">
                  {item.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${item.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-1">
                <span
                  className={`text-xl sm:text-2xl font-bold tracking-tight block ${item.valueColor}`}
                >
                  {item.value}
                </span>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatsCards;
