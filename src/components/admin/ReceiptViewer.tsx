'use client';

import React from 'react';
import { ExternalLink, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLanguageContext } from '@/contexts/LanguageContext';

export interface ReceiptViewerProps {
  url: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  url,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguageContext();
  const isArabic = language === 'ar';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-vip-purple-light" />
          <span>{isArabic ? 'إيصال التحويل' : 'Transfer Receipt'}</span>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-4">
        {url ? (
          <div className="flex flex-col items-center w-full space-y-4">
            <div className="relative group max-h-[65vh] w-full flex items-center justify-center overflow-hidden rounded-xl border border-vip-border bg-[#0a0a0f] p-2">
              <img
                src={url}
                alt={isArabic ? 'إيصال التحويل' : 'Payment Receipt'}
                className="max-h-[60vh] max-w-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.01]"
              />
            </div>

            <div className="flex items-center justify-between w-full pt-2 border-t border-vip-border/60">
              <span className="text-xs text-vip-text-muted truncate max-w-[200px] sm:max-w-xs font-mono">
                {url.startsWith('data:') ? 'صورة إيصال التحويل (Data URI)' : url}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (url.startsWith('data:')) {
                    const win = window.open();
                    if (win) {
                      win.document.write(`<title>Receipt</title><body style="margin:0;background:#0d0d14;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${url}" style="max-width:95%;max-height:95vh;object-fit:contain;border-radius:8px;" /></body>`);
                    }
                  } else {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-vip-purple/15 text-vip-purple-light border border-vip-purple/30 hover:bg-vip-purple/25 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isArabic ? 'فتح بحجم كامل' : 'Open in New Tab'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-semibold text-vip-text-primary">
              {isArabic ? 'لا يوجد إيصال مرفوع' : 'No Receipt Uploaded'}
            </h4>
            <p className="text-xs text-vip-text-muted max-w-xs">
              {isArabic
                ? 'لم يقم العميل برفع إيصال دفع لهذا الطلب بعد.'
                : 'The customer has not uploaded a payment receipt for this order yet.'}
            </p>
          </div>
        )}

        <div className="w-full flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {isArabic ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptViewer;
