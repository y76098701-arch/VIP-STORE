'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Tag, Headphones } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/Card';

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguageContext();

  const features = [
    {
      icon: ShieldCheck,
      title: t('securePayment'),
      description: t('securePaymentDesc'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      glow: 'none' as const,
    },
    {
      icon: Zap,
      title: t('fastDelivery'),
      description: t('fastDeliveryDesc'),
      color: 'text-vip-purple-light',
      bg: 'bg-vip-purple/10 border-vip-purple/20',
      glow: 'purple' as const,
    },
    {
      icon: Tag,
      title: t('bestPrices'),
      description: t('bestPricesDesc'),
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      glow: 'gold' as const,
    },
    {
      icon: Headphones,
      title: t('support'),
      description: t('supportDesc'),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      glow: 'blue' as const,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-vip-text-primary tracking-tight">
          {t('features')}
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-vip-purple to-vip-blue mx-auto mt-4 rounded-full" />
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card
                glow={feat.glow}
                hover={true}
                className="h-full flex flex-col items-center text-center p-6 border-vip-border transition-all duration-300"
              >
                {/* Icon in colored circle */}
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${feat.bg} shadow-md`}
                >
                  <Icon className={`w-7 h-7 ${feat.color}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-vip-text-primary mb-2">
                  {feat.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-vip-text-secondary leading-relaxed">
                  {feat.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default FeaturesSection;
