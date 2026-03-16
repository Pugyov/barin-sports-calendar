"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { updateUserAccess } from "@/lib/server/user-service";

async function assertAdminAccess() {
  const session = await getAuthSession();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

export async function updateUserAccessAction(formData: FormData) {
  await assertAdminAccess();

  await updateUserAccess({
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? ""),
    accessState: String(formData.get("accessState") ?? "")
  });

  revalidatePath("/admin/users");
}

export async function approveUserAction(formData: FormData) {
  await assertAdminAccess();

  await updateUserAccess({
    userId: String(formData.get("userId") ?? ""),
    role: "viewer",
    accessState: "active"
  });

  revalidatePath("/admin/users");
}
