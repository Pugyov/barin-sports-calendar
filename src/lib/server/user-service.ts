import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role, UserAccessState } from "@/types/auth";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z
    .string()
    .trim()
    .email("Valid email is required")
    .transform((value) => value.toLowerCase())
    .refine((value) => value.endsWith("@barinsports.com"), "Use your @barinsports.com email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please repeat your password")
}).superRefine((value, ctx) => {
  if (value.password !== value.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords do not match"
    });
  }
});

const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "editor", "viewer"]),
  accessState: z.enum(["active", "pending"])
});

export type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  accessState: UserAccessState;
  createdAt: Date;
};

function mapRole(role: string): Role {
  if (role === "admin" || role === "editor" || role === "viewer") {
    return role;
  }

  return "viewer";
}

export async function registerPendingUser(rawInput: unknown) {
  const input = registerSchema.parse(rawInput);
  const passwordHash = await hash(input.password, 12);

  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: "viewer",
        isActive: false
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("An account with that email already exists.");
    }

    throw error;
  }
}

export async function listUsers(): Promise<UserListItem[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ isActive: "asc" }, { createdAt: "desc" }]
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapRole(user.role),
    accessState: user.isActive ? "active" : "pending",
    createdAt: user.createdAt
  }));
}

export async function updateUserAccess(rawInput: unknown) {
  const input = updateUserSchema.parse(rawInput);

  return prisma.user.update({
    where: { id: input.userId },
    data: {
      role: input.role,
      isActive: input.accessState === "active"
    }
  });
}
