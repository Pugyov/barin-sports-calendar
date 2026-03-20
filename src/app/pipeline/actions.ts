"use server";

import { revalidatePath } from "next/cache";
import { canWrite } from "@/lib/roles";
import { getAuthSession } from "@/lib/auth";
import { normalizeTaskMutationError } from "@/lib/server/task-errors";
import { createTask, deleteTask, updateTask } from "@/lib/server/task-service";
import type { TaskFormState } from "@/types/task-form";

function formToInput(formData: FormData) {
  return {
    topic: String(formData.get("topic") ?? ""),
    taskTypeId: String(formData.get("taskTypeId") ?? ""),
    ownerUserId: String(formData.get("ownerUserId") ?? ""),
    workLink: String(formData.get("workLink") ?? ""),
    status: String(formData.get("status") ?? "PLANNED"),
    notes: String(formData.get("notes") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
    publishDate: String(formData.get("publishDate") ?? "")
  };
}

async function assertWriteAccess() {
  const session = await getAuthSession();
  if (!session?.user || !canWrite(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

async function toErrorState(error: unknown): Promise<TaskFormState> {
  if (error instanceof Error && error.message === "Unauthorized") {
    return {
      status: "error",
      message: "You do not have permission to change tasks.",
      fieldErrors: {}
    };
  }

  const failure = normalizeTaskMutationError(error);

  return {
    status: "error",
    message: failure.message,
    fieldErrors: failure.fieldErrors
  };
}

export async function createTaskFormAction(_: TaskFormState, formData: FormData): Promise<TaskFormState> {
  try {
    await assertWriteAccess();
    await createTask(formToInput(formData));

    revalidatePath("/pipeline");
    revalidatePath("/calendar");
    revalidatePath("/");
    revalidatePath("/admin/task-types");

    return {
      status: "success",
      message: "Task created successfully.",
      fieldErrors: {}
    };
  } catch (error) {
    return toErrorState(error);
  }
}

export async function updateTaskFormAction(_: TaskFormState, formData: FormData): Promise<TaskFormState> {
  try {
    await assertWriteAccess();
    const taskId = String(formData.get("taskId") ?? "");
    await updateTask(taskId, formToInput(formData));

    revalidatePath("/pipeline");
    revalidatePath("/calendar");
    revalidatePath("/");
    revalidatePath("/admin/task-types");

    return {
      status: "success",
      message: "Task updated successfully.",
      fieldErrors: {}
    };
  } catch (error) {
    return toErrorState(error);
  }
}

export async function deleteTaskFormAction(_: TaskFormState, formData: FormData): Promise<TaskFormState> {
  try {
    await assertWriteAccess();
    const taskId = String(formData.get("taskId") ?? "");
    await deleteTask(taskId);

    revalidatePath("/pipeline");
    revalidatePath("/calendar");
    revalidatePath("/");
    revalidatePath("/admin/task-types");

    return {
      status: "success",
      message: "Task deleted successfully.",
      fieldErrors: {}
    };
  } catch (error) {
    return toErrorState(error);
  }
}

export async function createTaskAction(formData: FormData) {
  await assertWriteAccess();
  await createTask(formToInput(formData));

  revalidatePath("/pipeline");
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function updateTaskAction(formData: FormData) {
  await assertWriteAccess();
  const taskId = String(formData.get("taskId") ?? "");
  await updateTask(taskId, formToInput(formData));

  revalidatePath("/pipeline");
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function deleteTaskAction(formData: FormData) {
  await assertWriteAccess();
  const taskId = String(formData.get("taskId") ?? "");
  await deleteTask(taskId);

  revalidatePath("/pipeline");
  revalidatePath("/calendar");
  revalidatePath("/");
}
