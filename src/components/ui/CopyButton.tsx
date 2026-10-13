'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageContext } from '@/contexts/LanguageContext';

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  className,
  iconOnly = false,
}) => {
  const { t } = useLanguageContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers or restricted environments
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const displayText = copied ? t('copied') : label || t('copyNumber');

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none border',
        copied
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          : 'bg-vip-card/80 border-vip-border text-vip-text-primary hover:border-vip-purple/50 hover:bg-vip-purple/10 active:scale-95',
        className
      )}
      title={displayText}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400 transition-transform scale-110" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-vip-purple-light transition-transform" />
      )}
      {!iconOnly && <span>{displayText}</span>}
    </button>
  );
};

export default CopyButton;
