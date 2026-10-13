const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Update existing packages to have category DIAMONDS
  const existing = await prisma.diamondPackage.findMany();
  for (const pkg of existing) {
    if (!pkg.category) {
      await prisma.diamondPackage.update({
        where: { id: pkg.id },
        data: {
          category: 'DIAMONDS',
          name: pkg.diamonds + ' جوهرة',
        },
      });
    }
  }

  // 2. Add Weekly Membership (80 EGP)
  let weekly = await prisma.diamondPackage.findFirst({ where: { name: 'عضوية أسبوعية' } });
  if (!weekly) {
    weekly = await prisma.diamondPackage.create({
      data: {
        name: 'عضوية أسبوعية',
        category: 'MEMBERSHIP',
        badge: 'أسبوعية VIP',
        diamonds: 450,
        price: 80,
        currency: 'EGP',
        isActive: true,
        sortOrder: 7,
      },
    });
    console.log('Created Weekly Membership:', weekly.id);
  } else {
    await prisma.diamondPackage.update({
      where: { id: weekly.id },
      data: { price: 80, category: 'MEMBERSHIP', badge: 'أسبوعية VIP', diamonds: 450 },
    });
    console.log('Updated Weekly Membership');
  }

  // 3. Add Monthly Membership (350 EGP)
  let monthly = await prisma.diamondPackage.findFirst({ where: { name: 'عضوية شهرية' } });
  if (!monthly) {
    monthly = await prisma.diamondPackage.create({
      data: {
        name: 'عضوية شهرية',
        category: 'MEMBERSHIP',
        badge: 'شهرية VIP',
        diamonds: 2600,
        price: 350,
        currency: 'EGP',
        isActive: true,
        sortOrder: 8,
      },
    });
    console.log('Created Monthly Membership:', monthly.id);
  } else {
    await prisma.diamondPackage.update({
      where: { id: monthly.id },
      data: { price: 350, category: 'MEMBERSHIP', badge: 'شهرية VIP', diamonds: 2600 },
    });
    console.log('Updated Monthly Membership');
  }

  // 4. Add Airdrop 1 Dollar (50 EGP)
  let airdrop1 = await prisma.diamondPackage.findFirst({ where: { name: 'دروب 1 دولار' } });
  if (!airdrop1) {
    airdrop1 = await prisma.diamondPackage.create({
      data: {
        name: 'دروب 1 دولار',
        category: 'AIRDROP',
        badge: 'دروب 1 USD',
        diamonds: 100,
        price: 50,
        currency: 'EGP',
        isActive: true,
        sortOrder: 9,
      },
    });
    console.log('Created Airdrop 1 USD:', airdrop1.id);
  } else {
    await prisma.diamondPackage.update({
      where: { id: airdrop1.id },
      data: { price: 50, category: 'AIRDROP', badge: 'دروب 1 USD', diamonds: 100 },
    });
    console.log('Updated Airdrop 1 USD');
  }

  // 5. Add Airdrop 2 Dollar (90 EGP)
  let airdrop2 = await prisma.diamondPackage.findFirst({ where: { name: 'دروب 2 دولار' } });
  if (!airdrop2) {
    airdrop2 = await prisma.diamondPackage.create({
      data: {
        name: 'دروب 2 دولار',
        category: 'AIRDROP',
        badge: 'دروب 2 USD',
        diamonds: 300,
        price: 90,
        currency: 'EGP',
        isActive: true,
        sortOrder: 10,
      },
    });
    console.log('Created Airdrop 2 USD:', airdrop2.id);
  } else {
    await prisma.diamondPackage.update({
      where: { id: airdrop2.id },
      data: { price: 90, category: 'AIRDROP', badge: 'دروب 2 USD', diamonds: 300 },
    });
    console.log('Updated Airdrop 2 USD');
  }

  const all = await prisma.diamondPackage.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log('Total packages in DB:', all.length);
  all.forEach((p) => {
    console.log(`- [${p.category || 'DIAMONDS'}] ${p.name || p.diamonds + ' 💎'}: ${p.price} EGP (sortOrder: ${p.sortOrder})`);
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
