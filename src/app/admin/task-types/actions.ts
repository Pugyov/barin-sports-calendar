"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { createTaskType, deleteTaskType } from "@/lib/server/task-type-service";

async function assertAdminAccess() {
  const session = await getAuthSession();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

function buildRedirect(pathname: string, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export async function createTaskTypeAction(formData: FormData) {
  let destination = buildRedirect("/admin/task-types", { success: "created" });

  try {
    await assertAdminAccess();
    await createTaskType({
      name: String(formData.get("name") ?? "")
    });

    revalidatePath("/pipeline");
    revalidatePath("/calendar");
    revalidatePath("/");
    revalidatePath("/admin/task-types");
  } catch (error) {
    destination = buildRedirect("/admin/task-types", {
      error: error instanceof Error ? error.message : "Task type could not be created."
    });
  }

  redirect(destination);
}

export async function deleteTaskTypeAction(formData: FormData) {
  let destination = buildRedirect("/admin/task-types", { success: "deleted" });

  try {
    await assertAdminAccess();
    await deleteTaskType(Number(formData.get("taskTypeId") ?? 0));

    revalidatePath("/pipeline");
    revalidatePath("/calendar");
    revalidatePath("/");
    revalidatePath("/admin/task-types");
  } catch (error) {
    destination = buildRedirect("/admin/task-types", {
      error: error instanceof Error ? error.message : "Task type could not be deleted."
    });
  }

  redirect(destination);
}
