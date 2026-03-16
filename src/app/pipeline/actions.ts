"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { canWrite } from "@/lib/roles";
import { getAuthSession } from "@/lib/auth";
import { createTask, deleteTask, getNextTaskCode, updateTask } from "@/lib/server/task-service";
import type { TaskFormState } from "@/types/task-form";

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

async function toErrorState(error: unknown): Promise<TaskFormState> {
  const suggestedTaskCode = await getNextTaskCode();

  if (error instanceof ZodError) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: error.flatten().fieldErrors,
      suggestedTaskCode
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return {
      status: "error",
      message: "Task code already exists. Use a different code or edit the existing task.",
      fieldErrors: {
        taskCode: ["Task code already exists."]
      },
      suggestedTaskCode
    };
  }

  if (error instanceof Error && error.message === "Unauthorized") {
    return {
      status: "error",
      message: "You do not have permission to change tasks.",
      fieldErrors: {},
      suggestedTaskCode
    };
  }

  return {
    status: "error",
    message: error instanceof Error ? error.message : "Task could not be saved.",
    fieldErrors: {},
    suggestedTaskCode
  };
}

export async function createTaskFormAction(_: TaskFormState, formData: FormData): Promise<TaskFormState> {
  try {
    await assertWriteAccess();
    await createTask(formToInput(formData));
    const suggestedTaskCode = await getNextTaskCode();

    revalidatePath("/pipeline");
    revalidatePath("/calendar");
    revalidatePath("/");

    return {
      status: "success",
      message: "Task created successfully.",
      fieldErrors: {},
      suggestedTaskCode
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

    return {
      status: "success",
      message: "Task updated successfully.",
      fieldErrors: {},
      suggestedTaskCode: ""
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

    return {
      status: "success",
      message: "Task deleted successfully.",
      fieldErrors: {},
      suggestedTaskCode: ""
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
