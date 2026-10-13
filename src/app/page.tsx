'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import PackagesPreview from '@/components/home/PackagesPreview';
import PaymentDiscountsSection from '@/components/home/PaymentDiscountsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ParticleBackground from '@/components/home/ParticleBackground';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-vip-bg text-vip-text-primary relative flex flex-col justify-between overflow-x-hidden">
      <Navbar />
      <ParticleBackground />
      <main className="relative z-10 flex-grow">
        <HeroSection />
        <PackagesPreview />
        <PaymentDiscountsSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
