import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toDateOnlyIso } from "@/lib/excel";
import { cleanNullableString } from "@/lib/task-normalization";
import { invalidTaskTypeError, normalizeTaskMutationError, taskNotFoundError } from "@/lib/server/task-errors";
import { getUserDisplayName } from "@/lib/user-display";
import { ensureAssignableUserId } from "@/lib/server/user-service";
import { taskFilterSchema, taskMutationSchema, type TaskFilterInput, type TaskMutationInput } from "@/lib/validation/task";
import type { TaskListItem, TaskTypeOption } from "@/types/task";

function parseDateInput(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseTaskTypeId(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseRequiredTaskTypeId(value: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw invalidTaskTypeError();
  }

  return parsed;
}

function buildDateRangeFilter(from?: string, to?: string, dateField?: "start" | "due" | "publish"): Prisma.TaskWhereInput | undefined {
  const fromDate = from ? parseDateInput(from) : null;
  const toDate = to ? parseDateInput(to) : null;

  if (!fromDate && !toDate) return undefined;

  const range: Prisma.DateTimeNullableFilter = {};
  if (fromDate) range.gte = fromDate;
  if (toDate) range.lte = toDate;

  if (dateField === "start") {
    return { startDate: range };
  }

  if (dateField === "due") {
    return { dueDate: range };
  }

  if (dateField === "publish") {
    return { publishDate: range };
  }

  return {
    OR: [{ startDate: range }, { dueDate: range }, { publishDate: range }]
  };
}

function buildStatusFilter(status?: TaskFilterInput["status"]): Prisma.TaskWhereInput | undefined {
  if (!status) return undefined;

  if (status === "open") {
    return {
      NOT: {
        status: "DONE"
      }
    };
  }

  return {
    status
  };
}

function buildOwnerFilter(ownerUserId?: string, ownerState?: "assigned" | "unassigned"): Prisma.TaskWhereInput | undefined {
  if (ownerState === "unassigned") {
    return {
      ownerUserId: null
    };
  }

  if (ownerState === "assigned") {
    return {
      NOT: { ownerUserId: null }
    };
  }

  if (!ownerUserId) return undefined;

  return {
    ownerUserId
  };
}

type TaskWithType = Prisma.TaskGetPayload<{ include: { taskType: true; ownerUser: true } }>;

function mapTask(task: TaskWithType): TaskListItem {
  return {
    id: task.id,
    topic: task.topic,
    taskTypeId: task.taskTypeId,
    taskTypeName: task.taskType.name,
    phaseRule: task.phaseRule,
    ownerUserId: task.ownerUserId,
    ownerDisplay: task.ownerUser ? getUserDisplayName(task.ownerUser.name, task.ownerUser.email) : null,
    workLink: task.workLink,
    status: task.status,
    notes: task.notes,
    startDate: toDateOnlyIso(task.startDate),
    dueDate: toDateOnlyIso(task.dueDate),
    publishDate: toDateOnlyIso(task.publishDate)
  };
}

async function toMutationData(input: TaskMutationInput): Promise<Prisma.TaskUncheckedCreateInput> {
  return {
    topic: input.topic,
    taskTypeId: parseRequiredTaskTypeId(input.taskTypeId),
    phaseRule: cleanNullableString(input.phaseRule),
    ownerUserId: await ensureAssignableUserId(input.ownerUserId),
    workLink: cleanNullableString(input.workLink),
    status: input.status,
    notes: cleanNullableString(input.notes),
    startDate: parseDateInput(input.startDate),
    dueDate: parseDateInput(input.dueDate),
    publishDate: parseDateInput(input.publishDate)
  };
}

async function loadTask(taskId: string): Promise<TaskListItem> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { taskType: true, ownerUser: true }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return mapTask(task);
}

export async function listTasks(rawFilters: TaskFilterInput = {}): Promise<TaskListItem[]> {
  const filters = taskFilterSchema.parse(rawFilters);
  const dateFilter = buildDateRangeFilter(filters.from, filters.to, filters.dateField);
  const statusFilter = buildStatusFilter(filters.status);
  const ownerFilter = buildOwnerFilter(filters.ownerUserId, filters.ownerState);
  const taskTypeId = parseTaskTypeId(filters.taskTypeId);

  const where: Prisma.TaskWhereInput = {
    AND: [
      filters.taskId ? { id: filters.taskId } : {},
      filters.q
        ? {
            OR: [
              { topic: { contains: filters.q } },
              { notes: { contains: filters.q } },
              { phaseRule: { contains: filters.q } },
              {
                ownerUser: {
                  is: {
                    OR: [{ name: { contains: filters.q } }, { email: { contains: filters.q } }]
                  }
                }
              }
            ]
          }
        : {},
      ownerFilter ?? {},
      filters.phaseRule ? { phaseRule: filters.phaseRule } : {},
      statusFilter ?? {},
      taskTypeId ? { taskTypeId } : {},
      dateFilter ?? {}
    ]
  };

  const rows = await prisma.task.findMany({
    where,
    include: {
      taskType: true,
      ownerUser: true
    },
    orderBy: [{ publishDate: "asc" }, { dueDate: "asc" }, { startDate: "asc" }, { topic: "asc" }]
  });

  return rows.map(mapTask);
}

export async function listTaskTypes(): Promise<TaskTypeOption[]> {
  return prisma.taskType.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true
    }
  });
}

export async function createTask(rawInput: unknown): Promise<TaskListItem> {
  try {
    const input = taskMutationSchema.parse(rawInput);
    const created = await prisma.task.create({ data: await toMutationData(input) });
    return loadTask(created.id);
  } catch (error) {
    throw normalizeTaskMutationError(error);
  }
}

export async function updateTask(taskId: string, rawInput: unknown): Promise<TaskListItem> {
  const trimmedTaskId = taskId.trim();

  if (!trimmedTaskId) {
    throw taskNotFoundError();
  }

  try {
    const input = taskMutationSchema.parse(rawInput);
    const updated = await prisma.task.update({
      where: { id: trimmedTaskId },
      data: await toMutationData(input)
    });

    return loadTask(updated.id);
  } catch (error) {
    throw normalizeTaskMutationError(error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const trimmedTaskId = taskId.trim();

  if (!trimmedTaskId) {
    throw taskNotFoundError();
  }

  try {
    await prisma.task.delete({ where: { id: trimmedTaskId } });
  } catch (error) {
    throw normalizeTaskMutationError(error);
  }
}
