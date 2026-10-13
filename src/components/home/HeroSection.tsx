'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gem, ArrowRight, ArrowLeft, Search, Sparkles } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';

export const HeroSection: React.FC = () => {
  const { t, dir } = useLanguageContext();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)',
      }}
    >
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-vip-purple/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-vip-blue/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Animated Diamond Icon Banner */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="relative inline-flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-vip-purple to-vip-blue opacity-50 blur-xl animate-pulse" />

              {/* Float container */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-vip-card/80 border border-vip-purple/40 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-vip-purple/30 animate-float">
                <Gem className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-vip-purple-light animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-vip-card/90 border border-vip-purple/30 text-vip-purple-light shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Free Fire Diamonds Instant Delivery
            </span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-vip-text-primary tracking-tight leading-tight max-w-4xl text-balance mb-6"
          >
            <span className="text-gradient">
              {t('heroTitle')}
            </span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-vip-text-secondary max-w-2xl font-normal leading-relaxed mb-10 text-balance"
          >
            {t('heroSubtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link href="/topup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto min-w-[200px] text-base group"
              >
                <span>{t('topupNow')}</span>
                <ArrowIcon className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Button>
            </Link>

            <Link href="/track" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto min-w-[180px] text-base group"
              >
                <Search className="w-5 h-5 text-vip-purple-light group-hover:scale-110 transition-transform" />
                <span>{t('trackOrder')}</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
