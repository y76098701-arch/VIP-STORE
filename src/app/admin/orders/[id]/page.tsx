'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Zap,
  Image as ImageIcon,
  Save,
  Clock,
  User,
  Gem,
  CreditCard,
  Hash,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
  ExternalLink,
  Crown,
  Flame,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { ReceiptViewer } from '@/components/admin/ReceiptViewer';
import { useToast } from '@/hooks/useToast';
import { useLanguageContext } from '@/contexts/LanguageContext';
import {
  formatPrice,
  formatPriceEn,
  formatDate,
  getStatusLabel,
} from '@/lib/utils';

export default function OrderDetailPage({
  params: routeParams,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const nextParams = useParams();
  const orderId = (nextParams?.id as string) || routeParams?.id;

  const { language, dir } = useLanguageContext();
  const isArabic = language === 'ar';
  const { toasts, addToast, removeToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState<boolean>(false);

  // Modals state
  const [receiptOpen, setReceiptOpen] = useState<boolean>(false);
  const [actionModal, setActionModal] = useState<
    'approve' | 'reject' | 'deliver' | null
  >(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch Order
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order');
      }

      const data = await res.json();
      setOrder(data.order);
      setAdminNotes(data.order.adminNotes || '');
    } catch (err: any) {
      console.error('Error fetching order detail:', err);
      addToast(
        isArabic
          ? 'تعذر تحميل بيانات الطلب المحدد'
          : 'Failed to load order details.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, addToast, isArabic]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!orderId) return;
    try {
      setSavingNotes(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      if (!res.ok) throw new Error('Failed to update notes');
      const data = await res.json();
      setOrder(data.order);

      addToast(
        isArabic ? 'تم حفظ ملاحظات المشرف بنجاح' : 'Admin notes saved successfully',
        'success'
      );
    } catch (err: any) {
      console.error('Error saving notes:', err);
      addToast(
        isArabic ? 'حدث خطأ أثناء حفظ الملاحظات' : 'Error saving notes',
        'error'
      );
    } finally {
      setSavingNotes(false);
    }
  };

  // Verify Action (Approve / Reject)
  const handleVerify = async (action: 'approve' | 'reject') => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: actionNotes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to verify payment');
      }

      const data = await res.json();
      setOrder(data.order);
      setActionModal(null);
      setActionNotes('');

      addToast(
        action === 'approve'
          ? isArabic
            ? 'تم اعتماد الدفع وتأكيد الطلب بنجاح'
            : 'Payment approved successfully'
          : isArabic
          ? 'تم رفض إيصال الدفع وتحديث حالة الطلب'
          : 'Payment rejected successfully',
        'success'
      );
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      addToast(
        err.message ||
          (isArabic
            ? 'حدث خطأ أثناء مراجعة الطلب'
            : 'Error while verifying order payment'),
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Deliver Diamonds Action
  const handleDeliver = async () => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to deliver diamonds');
      }

      setOrder(data.order);
      setActionModal(null);

      if (data.success) {
        addToast(
          isArabic
            ? 'تم شحن الجواهر للاعب بنجاح عبر المزود'
            : 'Diamonds delivered successfully via provider',
          'success'
        );
      } else {
        addToast(
          data.error ||
            (isArabic
              ? 'فشل مزود الشحن في إتمام العملية'
              : 'Provider failed to deliver diamonds'),
          'error'
        );
      }
    } catch (err: any) {
      console.error('Error delivering diamonds:', err);
      addToast(
        err.message ||
          (isArabic ? 'فشلت عملية تسليم الجواهر' : 'Delivery operation failed'),
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Direct status update handler (for manual completion, refunds, etc.)
  const handleDirectStatusChange = async (newStatus: OrderStatus, noteText?: string) => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: noteText ? `${adminNotes ? adminNotes + ' | ' : ''}${noteText}` : undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();
      setOrder(data.order);
      addToast(
        isArabic ? `تم تحديث حالة الطلب إلى ${newStatus}` : `Status updated to ${newStatus}`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Error updating status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex justify-center items-center">
        <LoadingSpinner
          size="lg"
          text={isArabic ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center bg-vip-card rounded-2xl border border-vip-border max-w-lg mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-vip-text-primary">
          {isArabic ? 'لم يتم العثور على الطلب' : 'Order Not Found'}
        </h2>
        <p className="text-sm text-vip-text-muted">
          {isArabic
            ? 'الطلب المطلوب غير موجود أو تم حذفه من قاعدة البيانات.'
            : 'The requested order does not exist or has been removed.'}
        </p>
        <Link href="/admin/orders">
          <Button variant="secondary" size="md">
            {isArabic ? 'العودة لقائمة الطلبات' : 'Back to Orders'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-vip-card border border-vip-border hover:bg-white/5 text-vip-text-muted hover:text-vip-text-primary transition-colors"
          >
            {dir === 'rtl' ? (
              <ArrowRight className="w-5 h-5" />
            ) : (
              <ArrowLeft className="w-5 h-5" />
            )}
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-mono font-black text-vip-purple-light">
                {order.orderNumber}
              </h1>
              <Badge status={order.status} lang={language} size="md" />
            </div>
            <p className="text-xs text-vip-text-muted mt-1">
              {formatDate(order.createdAt, language)}
            </p>
          </div>
        </div>

        {/* Action Buttons depending on status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {order.status === 'UNDER_REVIEW' && (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setActionNotes('');
                  setActionModal('approve');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
              >
                <CheckCircle className="w-4 h-4 me-1.5" />
                <span>{isArabic ? 'اعتماد الدفع' : 'Approve Payment'}</span>
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setActionNotes('');
                  setActionModal('reject');
                }}
              >
                <XCircle className="w-4 h-4 me-1.5" />
                <span>{isArabic ? 'رفض الدفع' : 'Reject Payment'}</span>
              </Button>
            </>
          )}

          {(order.status === 'PAID' || order.status === 'PROCESSING') && (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={() => setActionModal('deliver')}
                className="bg-gradient-to-r from-vip-purple to-vip-blue hover:neon-glow"
              >
                <Zap className="w-4 h-4 me-1.5" />
                <span>
                  {order.status === 'PROCESSING'
                    ? isArabic
                      ? 'إعادة محاولة الشحن'
                      : 'Retry Delivery'
                    : isArabic
                    ? 'شحن الجواهر الآن (API)'
                    : 'Deliver Diamonds'}
                </span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() =>
                  handleDirectStatusChange(
                    'COMPLETED',
                    isArabic ? 'تم إتمام الشحن يدوياً من المشرف' : 'Manually completed by admin'
                  )
                }
                className="text-xs"
              >
                <CheckCircle className="w-4 h-4 me-1 text-emerald-400" />
                <span>{isArabic ? 'إتمام يدوي' : 'Manual Complete'}</span>
              </Button>

              <Button
                variant="danger"
                size="md"
                onClick={() =>
                  handleDirectStatusChange(
                    'REFUNDED',
                    isArabic ? 'تم إلغاء الطلب واسترداد المبلغ' : 'Refunded by admin'
                  )
                }
                className="text-xs"
              >
                <span>{isArabic ? 'استرداد / إلغاء' : 'Refund Order'}</span>
              </Button>
            </>
          )}

          {order.status === 'PENDING_PAYMENT' && (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setActionNotes('');
                  setActionModal('approve');
                }}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                <CheckCircle className="w-4 h-4 me-1.5" />
                <span>{isArabic ? 'تأكيد الدفع يدوياً' : 'Confirm Payment'}</span>
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setActionNotes('');
                  setActionModal('reject');
                }}
              >
                <XCircle className="w-4 h-4 me-1.5" />
                <span>{isArabic ? 'إلغاء الطلب' : 'Cancel Order'}</span>
              </Button>
            </>
          )}

          {order.status === 'COMPLETED' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleDirectStatusChange(
                  'REFUNDED',
                  isArabic ? 'طلب استرداد بعد الشحن' : 'Refunded after completion'
                )
              }
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              <span>{isArabic ? 'تحويل إلى مسترد (Refund)' : 'Mark Refunded'}</span>
            </Button>
          )}

          {order.status === 'REJECTED' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleDirectStatusChange(
                  'UNDER_REVIEW',
                  isArabic ? 'إعادة الفتح للمراجعة' : 'Reopened for review'
                )
              }
              className="text-xs text-vip-purple-light"
            >
              <span>{isArabic ? 'إعادة فتح للمراجعة' : 'Reopen for Review'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Details & Side info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Data & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details Card */}
          <Card hover={false} glow="none" className="p-6 bg-vip-card/90">
            <h3 className="text-base font-bold text-vip-text-primary mb-5 flex items-center gap-2 border-b border-vip-border/60 pb-3">
              <FileText className="w-5 h-5 text-vip-purple-light" />
              <span>{isArabic ? 'تفاصيل الطلب واللاعب' : 'Order & Player Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-vip-bg border border-vip-border space-y-1">
                <span className="text-xs text-vip-text-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  {isArabic ? 'معرف اللاعب (UID)' : 'Player UID'}
                </span>
                <p className="font-mono font-bold text-base text-vip-text-primary">
                  {order.playerUid}
                </p>
                {order.playerName && (
                  <p className="text-xs text-cyan-400 font-medium">
                    {order.playerName}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-vip-bg border border-vip-border space-y-1">
                {(() => {
                  const pkgDiamonds = order.package?.diamonds;
                  let pkgName = order.package?.name;
                  let pkgCategory = order.package?.category;
                  let pkgBadge = order.package?.badge;

                  if (!pkgName) {
                    if (pkgDiamonds === 300) {
                      pkgName = 'دروب 2 دولار';
                      pkgCategory = 'AIRDROP';
                      pkgBadge = 'دروب 2 USD';
                    } else if (pkgDiamonds === 450) {
                      pkgName = 'عضوية أسبوعية';
                      pkgCategory = 'MEMBERSHIP';
                      pkgBadge = 'أسبوعية VIP';
                    } else if (pkgDiamonds === 2600) {
                      pkgName = 'عضوية شهرية';
                      pkgCategory = 'MEMBERSHIP';
                      pkgBadge = 'شهرية VIP';
                    }
                  }

                  return (
                    <>
                      <span className="text-xs text-vip-text-muted flex items-center gap-1.5">
                        {pkgCategory === 'MEMBERSHIP' ? (
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        ) : pkgCategory === 'AIRDROP' ? (
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Gem className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        {isArabic ? 'الباقة / العرض' : 'Package / Offering'}
                      </span>
                      <div>
                        {pkgName && (
                          <p className="font-black text-lg text-white leading-tight flex items-center gap-2">
                            <span>{pkgName}</span>
                            {pkgBadge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-vip-purple/20 text-vip-purple-light border border-vip-purple/40 font-bold">
                                {pkgBadge}
                              </span>
                            )}
                          </p>
                        )}
                        <p className="font-bold text-sm text-cyan-400 mt-0.5">
                          {pkgDiamonds ? pkgDiamonds.toLocaleString() : '-'} {isArabic ? 'جوهرة' : 'Diamonds'}
                        </p>
                      </div>
                    </>
                  );
                })()}
                <p className="text-xs text-vip-text-muted pt-1">
                  {isArabic ? 'السعر الأصلي: ' : 'Original: '}
                  {isArabic
                    ? formatPrice(order.originalPrice)
                    : formatPriceEn(order.originalPrice)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-vip-bg border border-vip-border space-y-1">
                <span className="text-xs text-vip-text-muted flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  {isArabic ? 'المبلغ النهائي المدفوع' : 'Final Amount'}
                </span>
                <p className="font-bold text-lg text-gradient-gold">
                  {isArabic
                    ? formatPrice(order.finalPrice)
                    : formatPriceEn(order.finalPrice)}
                </p>
                {order.discountAmount > 0 && (
                  <p className="text-xs text-emerald-400">
                    {isArabic
                      ? `خصم ${order.discountPercent}% (${formatPrice(order.discountAmount)})`
                      : `Discount ${order.discountPercent}% (${formatPriceEn(order.discountAmount)})`}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-vip-bg border border-vip-border space-y-1">
                <span className="text-xs text-vip-text-muted flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-vip-purple-light" />
                  {isArabic ? 'طريقة ومرجع الدفع' : 'Payment Method & Ref'}
                </span>
                <p className="font-semibold text-sm text-vip-text-primary capitalize">
                  {order.paymentMethod || (isArabic ? 'غير محدد' : 'Not set')}
                </p>
                {order.paymentRef && (
                  <p className="text-xs font-mono text-vip-text-muted">
                    {isArabic ? 'المرجع: ' : 'Ref: '}
                    {order.paymentRef}
                  </p>
                )}
              </div>
            </div>

            {/* Provider Tx ID if present */}
            {order.providerTxId && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 block">
                    {isArabic ? 'معرف معاملة مزود الشحن (Provider TxID)' : 'Provider Transaction ID'}
                  </span>
                  <span className="font-mono text-xs text-emerald-200">
                    {order.providerTxId}
                  </span>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            )}
          </Card>

          {/* Status Timeline */}
          <Card hover={false} glow="none" className="p-6 bg-vip-card/90">
            <h3 className="text-base font-bold text-vip-text-primary mb-5 flex items-center gap-2 border-b border-vip-border/60 pb-3">
              <Clock className="w-5 h-5 text-vip-purple-light" />
              <span>{isArabic ? 'سجل تتبع الحالات (Timeline)' : 'Status Timeline'}</span>
            </h3>

            {order.statusHistory && order.statusHistory.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:start-2.5 before:w-0.5 before:bg-vip-border">
                {order.statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative flex items-start gap-4 ps-7">
                    <span className="absolute start-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-vip-purple ring-4 ring-[#13131a]" />
                    <div className="flex-1 p-3 rounded-xl bg-vip-bg border border-vip-border/80">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                        <Badge status={item.status} lang={language} size="sm" />
                        <span className="text-[11px] text-vip-text-muted">
                          {formatDate(item.createdAt, language)}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-vip-text-secondary mt-1">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-vip-text-muted">
                {isArabic ? 'لا يوجد سجل حالات إضافي' : 'No status history available'}
              </p>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Receipt & Admin Notes */}
        <div className="space-y-6">
          {/* Receipt Card */}
          <Card hover={false} glow="none" className="p-6 bg-vip-card/90">
            <h3 className="text-base font-bold text-vip-text-primary mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-vip-purple-light" />
              <span>{isArabic ? 'إيصال التحويل البنكي' : 'Transfer Receipt'}</span>
            </h3>

            {order.receiptUrl ? (
              <div className="space-y-3">
                <div
                  onClick={() => setReceiptOpen(true)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-vip-border bg-black aspect-video flex items-center justify-center hover:border-vip-purple transition-all"
                >
                  <img
                    src={order.receiptUrl}
                    alt="Receipt Thumbnail"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-3 py-1.5 rounded-lg bg-vip-purple text-white text-xs font-semibold shadow-lg">
                      {isArabic ? 'عرض الإيصال' : 'View Full Receipt'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setReceiptOpen(true)}
                  className="w-full flex items-center justify-center gap-2 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'معاينة الإيصال' : 'Inspect Receipt'}</span>
                </Button>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-vip-bg border border-vip-border text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-vip-text-muted mx-auto opacity-50" />
                <p className="text-xs text-vip-text-muted">
                  {isArabic ? 'لم يتم رفع إيصال دفع' : 'No receipt uploaded'}
                </p>
              </div>
            )}
          </Card>

          {/* Admin Notes Card */}
          <Card hover={false} glow="none" className="p-6 bg-vip-card/90">
            <h3 className="text-base font-bold text-vip-text-primary mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-vip-purple-light" />
              <span>{isArabic ? 'ملاحظات الإدارة' : 'Admin Notes'}</span>
            </h3>

            <p className="text-xs text-vip-text-muted mb-3">
              {isArabic
                ? 'ملاحظات سرية خاصة بالإدارة لا تظهر للعميل'
                : 'Internal administrative notes, not shown to customers'}
            </p>

            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={
                isArabic
                  ? 'اكتب أي ملاحظات حول هذا الطلب هنا...'
                  : 'Write any notes about this order here...'
              }
              className="w-full p-3 text-xs md:text-sm rounded-xl bg-vip-bg border border-vip-border text-vip-text-primary focus:border-vip-purple focus:ring-1 focus:ring-vip-purple/30 outline-none resize-none transition-all placeholder:text-vip-text-muted"
            />

            <div className="mt-3 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveNotes}
                loading={savingNotes}
                className="text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isArabic ? 'حفظ الملاحظات' : 'Save Notes'}</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Receipt Viewer Modal */}
      <ReceiptViewer
        url={order.receiptUrl}
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />

      {/* Approve Modal */}
      <Modal
        isOpen={actionModal === 'approve'}
        onClose={() => setActionModal(null)}
        title={isArabic ? 'تأكيد اعتماد الدفع' : 'Confirm Payment Approval'}
      >
        <div className="space-y-4 p-2">
          <p className="text-sm text-vip-text-secondary">
            {isArabic
              ? `هل أنت متأكد من صحة إيصال الدفع للطلب رقم ${order.orderNumber}؟ ستتحول حالة الطلب إلى (تم الدفع).`
              : `Are you sure you want to approve the payment for order ${order.orderNumber}? Status will become PAID.`}
          </p>

          <div>
            <label className="block text-xs font-medium text-vip-text-secondary mb-1">
              {isArabic ? 'ملاحظة (اختياري)' : 'Note (Optional)'}
            </label>
            <input
              type="text"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={isArabic ? 'مثال: تم التأكد من وصول الحوالة' : 'e.g. Transfer verified'}
              className="w-full px-3 py-2 rounded-lg bg-vip-bg border border-vip-border text-xs text-vip-text-primary focus:border-vip-purple outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-vip-border/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActionModal(null)}
              disabled={actionLoading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={actionLoading}
              onClick={() => handleVerify('approve')}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {isArabic ? 'تأكيد الاعتماد' : 'Confirm Approval'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={actionModal === 'reject'}
        onClose={() => setActionModal(null)}
        title={isArabic ? 'رفض إيصال الدفع' : 'Reject Payment Receipt'}
      >
        <div className="space-y-4 p-2">
          <p className="text-sm text-vip-text-secondary">
            {isArabic
              ? `سيتم رفض الطلب رقم ${order.orderNumber}. يرجى توضيح سبب الرفض لتسجيله في السجل.`
              : `Order ${order.orderNumber} will be rejected. Please specify the reason for internal records.`}
          </p>

          <div>
            <label className="block text-xs font-medium text-vip-text-secondary mb-1">
              {isArabic ? 'سبب الرفض' : 'Rejection Reason'}
            </label>
            <input
              type="text"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={
                isArabic
                  ? 'مثال: المبلغ غير مطابق / الإيصال غير واضح'
                  : 'e.g. Invalid amount / Illegible receipt'
              }
              className="w-full px-3 py-2 rounded-lg bg-vip-bg border border-vip-border text-xs text-vip-text-primary focus:border-vip-purple outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-vip-border/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActionModal(null)}
              disabled={actionLoading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading}
              onClick={() => handleVerify('reject')}
            >
              {isArabic ? 'تأكيد الرفض' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deliver Modal */}
      <Modal
        isOpen={actionModal === 'deliver'}
        onClose={() => setActionModal(null)}
        title={isArabic ? 'تأكيد شحن الجواهر' : 'Confirm Diamond Delivery'}
      >
        <div className="space-y-4 p-2">
          <div className="p-3.5 rounded-xl bg-vip-purple/15 border border-vip-purple/30 text-xs text-vip-text-primary space-y-1">
            <p>
              <strong>{isArabic ? 'اللاعب: ' : 'Player UID: '}</strong>
              <span className="font-mono text-cyan-400">{order.playerUid}</span>
            </p>
            <p>
              <strong>{isArabic ? 'الباقة / العرض: ' : 'Package / Offering: '}</strong>
              <span className="text-amber-300 font-bold">
                {order.package?.name
                  ? `${order.package.name} (${order.package.diamonds.toLocaleString()} 💎)`
                  : `${order.package?.diamonds.toLocaleString()} ${isArabic ? 'جوهرة' : 'Diamonds'}`}
              </span>
            </p>
          </div>

          <p className="text-xs text-vip-text-secondary">
            {isArabic
              ? 'سيتم إرسال طلب الشحن الفوري إلى مزود الخدمة المعتمد. هل ترغب في المتابعة؟'
              : 'The instant top-up request will be submitted to the configured provider API. Do you wish to continue?'}
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-vip-border/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActionModal(null)}
              disabled={actionLoading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={actionLoading}
              onClick={handleDeliver}
            >
              <Zap className="w-3.5 h-3.5 me-1" />
              <span>{isArabic ? 'شحن الآن' : 'Deliver Now'}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
