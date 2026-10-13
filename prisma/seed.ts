import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'qwert4455', 12);
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'youssef' },
    update: { password: hashedPassword },
    create: { email: process.env.ADMIN_EMAIL || 'youssef', password: hashedPassword, name: 'Youssef', role: 'admin' },
  });

  const packages = [
    { diamonds: 100, price: 50, sortOrder: 1 },
    { diamonds: 310, price: 150, sortOrder: 2 },
    { diamonds: 520, price: 250, sortOrder: 3 },
    { diamonds: 1060, price: 500, sortOrder: 4 },
    { diamonds: 2180, price: 1000, sortOrder: 5 },
    { diamonds: 5600, price: 2500, sortOrder: 6 },
  ];
  for (const pkg of packages) {
    const existing = await prisma.diamondPackage.findFirst({ where: { diamonds: pkg.diamonds } });
    if (existing) {
      await prisma.diamondPackage.update({ where: { id: existing.id }, data: { price: pkg.price } });
    } else {
      await prisma.diamondPackage.create({ data: pkg });
    }
  }

  const defaults: Record<string, string> = {
    instapay_name: 'VIP STORE',
    instapay_number: '01069954152',
    vodafone_cash_number: '01069954152',
    first_order_discount: '50',
    regular_discount: '20',
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log('Database seeded with real Free Fire diamond prices successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
