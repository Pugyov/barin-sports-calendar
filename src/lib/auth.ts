import { compare } from "bcryptjs";
import type { Session } from "next-auth";
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

async function loadCurrentSessionUser(session: Session) {
  const sessionUserId = typeof session.user?.id === "string" ? session.user.id : null;
  const sessionEmail = typeof session.user?.email === "string" ? session.user.email : null;

  if (!sessionUserId && !sessionEmail) {
    return null;
  }

  const clauses: Array<{ id: string } | { email: string }> = [];

  if (sessionUserId) {
    clauses.push({ id: sessionUserId });
  }

  if (sessionEmail) {
    clauses.push({ email: sessionEmail });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: clauses
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: coerceRole(user.role)
  };
}

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

        if (!user) {
          return null;
        }

        if (!user.isActive) {
          throw new Error("ACCOUNT_PENDING_APPROVAL");
        }

        const isValid = await compare(parsed.data.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: coerceRole(user.role)
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (typeof user?.id === "string") {
        token.sub = user.id;
      }

      if (typeof user?.name === "string") {
        token.name = user.name;
      }

      if (typeof user?.email === "string") {
        token.email = user.email;
      }

      if (user?.role) {
        token.role = coerceRole(String(user.role));
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.sub === "string") {
          session.user.id = token.sub;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
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
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const currentUser = await loadCurrentSessionUser(session);

  if (!currentUser) {
    return null;
  }

  return {
    ...session,
    user: {
      ...session.user,
      ...currentUser
    }
  };
}
