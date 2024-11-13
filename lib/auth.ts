// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        // Verifica na tabela de administradores
        const adminUser = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        });

        if (adminUser) {
          const isPasswordValid = await bcrypt.compare(credentials.password, adminUser.password);

          if (isPasswordValid) {
            return {
              id: adminUser.id,
              name: adminUser.name,
              email: adminUser.email,
              role: adminUser.role,
              image: adminUser.image, 
            };
          }
        }

        // Verifica na tabela de clientes
        const clientUser = await prisma.clientUser.findUnique({
          where: { email: credentials.email },
        });

        if (clientUser) {
          const isPasswordValid = await bcrypt.compare(credentials.password, clientUser.password);

          if (isPasswordValid) {
            return {
              id: clientUser.id,
              name: clientUser.name,
              email: clientUser.email,
              role: "Client", 
              image: undefined, 
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image; 
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
