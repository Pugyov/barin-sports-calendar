import type { Role } from "@/types/auth";

export function coerceRole(value: string | null | undefined): Role {
  if (value === "admin" || value === "editor" || value === "viewer") {
    return value;
  }

  return "viewer";
}

export function canWrite(role: Role | undefined): boolean {
  return role === "admin" || role === "editor";
}

export function isAdmin(role: Role | undefined): boolean {
  return role === "admin";
}
