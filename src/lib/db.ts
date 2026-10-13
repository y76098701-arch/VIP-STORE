import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getPrismaClient(): PrismaClient {
  let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    const possibleSrcPaths = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
    ];

    if (!fs.existsSync(tmpDbPath)) {
      for (const srcPath of possibleSrcPaths) {
        if (fs.existsSync(srcPath)) {
          try {
            fs.copyFileSync(srcPath, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed copying db to /tmp:', e);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      dbUrl = 'file:/tmp/dev.db';
    }
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? getPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
