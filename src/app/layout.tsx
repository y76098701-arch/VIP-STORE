import type { Metadata } from 'next';
import { Providers } from './providers';
import { GlobalBackgroundEffects } from '@/components/ui/GlobalBackgroundEffects';
import { ClickSparklesEffect } from '@/components/ui/ClickSparklesEffect';
import { WhatsAppHelpButton } from '@/components/ui/WhatsAppHelpButton';
import './globals.css';

export const metadata: Metadata = {
  title: 'VIP STORE | شحن جواهر فري فاير',
  description: 'اشحن جواهر فري فاير بأفضل الأسعار! خصومات مميزة، دفع آمن، ومتابعة لطلبك خطوة بخطوة.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-vip-bg text-vip-text-primary font-arabic antialiased min-h-screen relative overflow-x-hidden selection:bg-vip-purple/30 selection:text-vip-gold">
        <GlobalBackgroundEffects />
        <ClickSparklesEffect />
        <Providers>
          {children}
          <WhatsAppHelpButton />
        </Providers>
      </body>
    </html>
  );
}
