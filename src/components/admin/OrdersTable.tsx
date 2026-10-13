'use client';

import React from 'react';
import { Eye, Gem, ShoppingCart } from 'lucide-react';
import type { Order } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatPriceEn, formatDate } from '@/lib/utils';
import { useLanguageContext } from '@/contexts/LanguageContext';

export interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (id: string) => void;
  className?: string;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewOrder,
  className,
}) => {
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';

  if (!orders || orders.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 text-center bg-vip-card/60 rounded-2xl border border-vip-border">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-vip-border flex items-center justify-center text-vip-text-muted mb-4 shadow-inner">
          <ShoppingCart className="w-8 h-8 opacity-60" />
        </div>
        <h4 className="text-base font-semibold text-vip-text-primary mb-1">
          {isArabic ? 'لا توجد طلبات' : 'No orders found'}
        </h4>
        <p className="text-xs text-vip-text-muted max-w-sm">
          {isArabic
            ? 'لم يتم العثور على أية طلبات تطابق معايير البحث الحالية.'
            : 'No orders match the selected filters or search query.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-vip-border bg-vip-card/80 backdrop-blur-sm shadow-xl ${
        className || ''
      }`}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full text-start border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-vip-border bg-[#0e0e15] text-vip-text-muted font-medium select-none text-start">
              <th className="py-3.5 px-4 text-start font-semibold">
                {isArabic ? 'رقم الطلب' : 'Order #'}
              </th>
              <th className="py-3.5 px-4 text-start font-semibold">
                {isArabic ? 'معرف اللاعب (UID)' : 'Player UID'}
              </th>
              <th className="py-3.5 px-4 text-start font-semibold">
                {isArabic ? 'الجواهر' : 'Diamonds'}
              </th>
              <th className="py-3.5 px-4 text-start font-semibold">
                {isArabic ? 'المبلغ' : 'Amount'}
              </th>
              <th className="py-3.5 px-4 text-start font-semibold">
                {isArabic ? 'الحالة' : 'Status'}
              </th>
              <th className="py-3.5 px-4 text-start font-semibold">
                {isArabic ? 'التاريخ' : 'Date'}
              </th>
              <th className="py-3.5 px-4 text-center font-semibold">
                {isArabic ? 'إجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vip-border/50">
            {orders.map((order, index) => {
              const diamondsCount = order.package?.diamonds;
              const formattedPrice = isArabic
                ? formatPrice(order.finalPrice)
                : formatPriceEn(order.finalPrice);

              return (
                <tr
                  key={order.id}
                  className={`transition-colors duration-150 hover:bg-vip-purple/5 group ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-[#0f0f18]/50'
                  }`}
                >
                  {/* Order Number */}
                  <td className="py-3.5 px-4 font-mono font-bold text-vip-text-primary whitespace-nowrap">
                    <span className="text-vip-purple-light group-hover:text-vip-blue-light transition-colors">
                      {order.orderNumber}
                    </span>
                    {order.isFirstOrder && (
                      <span className="ms-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {isArabic ? 'أول طلب' : '1st Order'}
                      </span>
                    )}
                  </td>

                  {/* Player UID & Name */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-mono text-vip-text-primary font-medium">
                        {order.playerUid}
                      </span>
                      {order.playerName && (
                        <span className="text-[11px] text-vip-text-muted">
                          {order.playerName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Diamonds */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 font-bold text-cyan-400">
                      <Gem className="w-3.5 h-3.5 shrink-0" />
                      <span>{diamondsCount ? diamondsCount.toLocaleString() : '-'}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-amber-300">
                    {formattedPrice}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge status={order.status} lang={language} size="sm" />
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-vip-text-muted whitespace-nowrap text-[11px] md:text-xs">
                    {formatDate(order.createdAt, language)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewOrder(order.id)}
                      className="px-2.5 py-1.5 text-xs inline-flex items-center gap-1 hover:border-vip-purple hover:text-vip-purple-light"
                      title={isArabic ? 'عرض التفاصيل' : 'View Details'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {isArabic ? 'عرض' : 'View'}
                      </span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
