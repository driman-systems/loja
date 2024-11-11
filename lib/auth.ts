import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

declare module "next-auth" {
    interface User {
      role?: string;
    }
  
    interface Session {
      user: {
        role?: string;
      } & DefaultSession["user"];
    }
  
    interface JWT {
      role?: string;
    }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string | undefined;
      session.user.image = token.image as string | null | undefined; 
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
