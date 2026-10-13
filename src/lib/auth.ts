import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const input = credentials.email.trim();
        const admin = await prisma.admin.findFirst({
          where: {
            OR: [
              { email: input },
              { email: input.toLowerCase() },
              { email: `${input.toLowerCase()}@vipstore.com` },
              { name: input },
            ],
          },
        });
        if (!admin) return null;
        const valid = await bcrypt.compare(credentials.password, admin.password);
        if (!valid) return null;
        return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).role = token.role; (session.user as any).id = token.id; }
      return session;
    },
  },
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
