import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findFirst } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findFirst: vi.fn()
}));

vi.mock("next-auth", () => ({
  getServerSession
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config) => config)
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst,
      findUnique: vi.fn()
    }
  }
}));

import { getAuthSession } from "@/lib/auth";

describe("getAuthSession", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    findFirst.mockReset();
  });

  it("returns null when the database user is inactive", async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "alex@barinsports.com",
        role: "admin"
      }
    });
    findFirst.mockResolvedValue({
      id: "user-1",
      name: "Alex",
      email: "alex@barinsports.com",
      role: "admin",
      isActive: false
    });

    await expect(getAuthSession()).resolves.toBeNull();
  });

  it("refreshes the session role from the database", async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@barinsports.com",
        role: "admin"
      }
    });
    findFirst.mockResolvedValue({
      id: "user-1",
      name: "Alex",
      email: "alex@barinsports.com",
      role: "viewer",
      isActive: true
    });

    const session = await getAuthSession();

    expect(session?.user.role).toBe("viewer");
    expect(session?.user.id).toBe("user-1");
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ id: "user-1" }, { email: "alex@barinsports.com" }]
        }
      })
    );
  });
});
