"use server";

import { revalidatePath } from "next/cache";
import { canWrite } from "@/lib/roles";
import { getAuthSession } from "@/lib/auth";
import { createTask, deleteTask, updateTask } from "@/lib/server/task-service";

function parseTypes(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formToInput(formData: FormData) {
  return {
    taskCode: String(formData.get("taskCode") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    types: parseTypes(formData.get("types")),
    phaseRule: String(formData.get("phaseRule") ?? ""),
    owner: String(formData.get("owner") ?? ""),
    workLink: String(formData.get("workLink") ?? ""),
    status: String(formData.get("status") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
    publishDate: String(formData.get("publishDate") ?? ""),
    rawTypeText: String(formData.get("types") ?? "")
  };
}

async function assertWriteAccess() {
  const session = await getAuthSession();
  if (!session?.user || !canWrite(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

export async function createTaskAction(formData: FormData) {
  await assertWriteAccess();
  await createTask(formToInput(formData));

  revalidatePath("/pipeline");
  revalidatePath("/calendar");
}

export async function updateTaskAction(formData: FormData) {
  await assertWriteAccess();
  const taskId = String(formData.get("taskId") ?? "");
  await updateTask(taskId, formToInput(formData));

  revalidatePath("/pipeline");
  revalidatePath("/calendar");
}

export async function deleteTaskAction(formData: FormData) {
  await assertWriteAccess();
  const taskId = String(formData.get("taskId") ?? "");
  await deleteTask(taskId);

  revalidatePath("/pipeline");
  revalidatePath("/calendar");
}
