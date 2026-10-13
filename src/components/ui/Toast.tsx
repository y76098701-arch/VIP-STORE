'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Toast as ToastItem } from '@/hooks/useToast';

export interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const styleMap = {
    success: 'bg-[#0f1f17]/90 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10',
    error: 'bg-[#220e10]/90 border-red-500/40 text-red-100 shadow-red-500/10',
    warning: 'bg-[#241a0d]/90 border-amber-500/40 text-amber-100 shadow-amber-500/10',
    info: 'bg-[#0e1628]/90 border-blue-500/40 text-blue-100 shadow-blue-500/10',
  };

  return (
    <div
      className="fixed bottom-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 ltr:left-0 rtl:right-0"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className={cn(
              'pointer-events-auto flex items-center justify-between p-4 rounded-xl border backdrop-blur-md shadow-xl text-sm transition-all',
              styleMap[toast.type] || styleMap.info
            )}
          >
            <div className="flex items-center gap-3 pr-2 rtl:pr-0 rtl:pl-2">
              {iconMap[toast.type] || iconMap.info}
              <p className="font-medium leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-1 rounded-lg text-vip-text-muted hover:text-vip-text-primary hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
