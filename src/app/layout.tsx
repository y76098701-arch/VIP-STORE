import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'VIP STORE | شحن جواهر فري فاير',
  description: 'اشحن جواهر فري فاير بأفضل الأسعار! خصومات مميزة، دفع آمن، ومتابعة لطلبك خطوة بخطوة.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-vip-bg text-vip-text-primary font-arabic antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
