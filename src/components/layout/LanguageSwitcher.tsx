'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { language, setLanguage } = useLanguageContext();

  const toggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold select-none',
        'border border-vip-border bg-vip-card/80 text-vip-text-primary hover:border-vip-purple/50 hover:bg-vip-purple/10 active:scale-95',
        'transition-all duration-200 shadow-sm',
        className
      )}
      title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
      aria-label="Switch Language"
    >
      <Globe className="w-3.5 h-3.5 text-vip-purple-light" />
      <span>{language === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
};

export default LanguageSwitcher;
