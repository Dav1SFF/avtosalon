import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const { handlers: { GET, POST }, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        switchToken: { label: "Switch Token", type: "text" }
      },
      async authorize(credentials) {
        if (credentials?.switchToken) {
          try {
            const [userId, originalAdminId, expiresStr, hmac] = (credentials.switchToken as string).split(':');
            if (Date.now() > parseInt(expiresStr)) return null;
            
            const expectedHmac = crypto.createHmac('sha256', process.env.NEXTAUTH_SECRET || "default_secret")
              .update(`${userId}:${originalAdminId}:${expiresStr}`)
              .digest('hex');
              
            if (hmac !== expectedHmac) return null;
            
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return null;
            
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              originalAdminId: originalAdminId !== 'null' ? originalAdminId : undefined,
            };
          } catch(e) {
            return null;
          }
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = bcrypt.compareSync(credentials.password as string, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.originalAdminId = (user as any).originalAdminId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).originalAdminId = token.originalAdminId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

