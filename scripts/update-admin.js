const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updateAdmin() {
  const hash = await bcrypt.hash('qwert4455', 10);
  
  // Update or recreate admin
  await prisma.admin.deleteMany({});
  
  const created = await prisma.admin.create({
    data: {
      email: 'youssef',
      name: 'Youssef',
      password: hash,
      role: 'admin'
    }
  });

  console.log('Admin successfully updated to:', created.email);
}

updateAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
