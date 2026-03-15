import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { coerceRole } from "@/lib/roles";

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1)
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await compare(parsed.data.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: coerceRole(user.role)
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = coerceRole(String(user.role));
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = coerceRole(typeof token.role === "string" ? token.role : undefined);
      }
      return session;
    }
  },
  pages: {
    signIn: "/signin"
  }
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
