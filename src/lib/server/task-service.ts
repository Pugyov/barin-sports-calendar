import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cleanNullableString, normalizeStatus, splitTypes } from "@/lib/task-normalization";
import { toDateOnlyIso } from "@/lib/excel";
import { taskFilterSchema, taskMutationSchema, type TaskFilterInput, type TaskMutationInput } from "@/lib/validation/task";
import type { TaskListItem } from "@/types/task";

function parseDateInput(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildDateRangeFilter(from?: string, to?: string): Prisma.TaskWhereInput | undefined {
  const fromDate = from ? parseDateInput(from) : null;
  const toDate = to ? parseDateInput(to) : null;

  if (!fromDate && !toDate) return undefined;

  const range: Prisma.DateTimeNullableFilter = {};
  if (fromDate) range.gte = fromDate;
  if (toDate) range.lte = toDate;

  return {
    OR: [{ startDate: range }, { dueDate: range }, { publishDate: range }]
  };
}

function mapTask(task: Prisma.TaskGetPayload<{ include: { taskTypes: { include: { typeTag: true } } } }>): TaskListItem {
  return {
    id: task.id,
    taskCode: task.taskCode,
    topic: task.topic,
    phaseRule: task.phaseRule,
    owner: task.owner,
    workLink: task.workLink,
    status: task.status,
    statusNormalized: task.statusNormalized,
    notes: task.notes,
    startDate: toDateOnlyIso(task.startDate),
    dueDate: toDateOnlyIso(task.dueDate),
    publishDate: toDateOnlyIso(task.publishDate),
    types: task.taskTypes.map((item) => item.typeTag.name)
  };
}

export function getNextTaskCodeFromValues(taskCodes: string[]): string {
  const matchingCodes = taskCodes
    .map((taskCode) => {
      const match = /^BS-(\d+)$/i.exec(taskCode.trim());
      if (!match) return null;

      return {
        number: Number(match[1]),
        width: match[1].length
      };
    })
    .filter((value): value is { number: number; width: number } => value !== null);

  if (matchingCodes.length === 0) {
    return "BS-001";
  }

  const maxNumber = Math.max(...matchingCodes.map((item) => item.number));
  const width = Math.max(3, ...matchingCodes.map((item) => item.width));

  return `BS-${String(maxNumber + 1).padStart(width, "0")}`;
}

async function ensureTypeTagIds(names: string[]): Promise<number[]> {
  const uniqueNames = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
  const ids: number[] = [];

  for (const name of uniqueNames) {
    const tag = await prisma.typeTag.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true }
    });
    ids.push(tag.id);
  }

  return ids;
}

async function syncTaskTypes(taskId: string, typeTagIds: number[]) {
  await prisma.taskType.deleteMany({ where: { taskId } });
  if (!typeTagIds.length) return;

  await prisma.taskType.createMany({
    data: typeTagIds.map((typeTagId) => ({ taskId, typeTagId })),
    skipDuplicates: true
  });
}

function toMutationData(input: TaskMutationInput): Prisma.TaskUncheckedCreateInput {
  return {
    taskCode: input.taskCode,
    topic: input.topic,
    phaseRule: cleanNullableString(input.phaseRule),
    owner: cleanNullableString(input.owner),
    workLink: cleanNullableString(input.workLink),
    status: cleanNullableString(input.status),
    statusNormalized: normalizeStatus(input.status),
    notes: cleanNullableString(input.notes),
    startDate: parseDateInput(input.startDate),
    dueDate: parseDateInput(input.dueDate),
    publishDate: parseDateInput(input.publishDate),
    rawTypeText: cleanNullableString(input.rawTypeText)
  };
}

async function loadTask(taskId: string): Promise<TaskListItem> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { taskTypes: { include: { typeTag: true } } }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return mapTask(task);
}

export async function listTasks(rawFilters: TaskFilterInput = {}): Promise<TaskListItem[]> {
  const filters = taskFilterSchema.parse(rawFilters);
  const dateFilter = buildDateRangeFilter(filters.from, filters.to);

  const where: Prisma.TaskWhereInput = {
    AND: [
      filters.q
        ? {
            OR: [
              { topic: { contains: filters.q } },
              { taskCode: { contains: filters.q } },
              { notes: { contains: filters.q } }
            ]
          }
        : {},
      filters.owner ? { owner: { contains: filters.owner } } : {},
      filters.phaseRule ? { phaseRule: filters.phaseRule } : {},
      filters.status ? { statusNormalized: normalizeStatus(filters.status) } : {},
      filters.type
        ? {
            taskTypes: {
              some: {
                typeTag: {
                  name: filters.type
                }
              }
            }
          }
        : {},
      dateFilter ?? {}
    ]
  };

  const rows = await prisma.task.findMany({
    where,
    include: {
      taskTypes: {
        include: {
          typeTag: true
        }
      }
    },
    orderBy: [{ publishDate: "asc" }, { dueDate: "asc" }, { startDate: "asc" }, { taskCode: "asc" }]
  });

  return rows.map(mapTask);
}

export async function listTypeTags(): Promise<string[]> {
  const tags = await prisma.typeTag.findMany({ orderBy: { name: "asc" } });
  return tags.map((tag) => tag.name);
}

export async function getNextTaskCode(): Promise<string> {
  const rows = await prisma.task.findMany({
    select: {
      taskCode: true
    }
  });

  return getNextTaskCodeFromValues(rows.map((row) => row.taskCode));
}

export async function createTask(rawInput: unknown): Promise<TaskListItem> {
  const input = taskMutationSchema.parse(rawInput);
  const mutationData = toMutationData(input);
  const typeNames = splitTypes(input.types);

  const created = await prisma.task.create({ data: mutationData });
  const typeIds = await ensureTypeTagIds(typeNames);
  await syncTaskTypes(created.id, typeIds);

  return loadTask(created.id);
}

export async function updateTask(taskId: string, rawInput: unknown): Promise<TaskListItem> {
  const input = taskMutationSchema.parse(rawInput);
  const mutationData = toMutationData(input);
  const typeNames = splitTypes(input.types);

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: mutationData
  });

  const typeIds = await ensureTypeTagIds(typeNames);
  await syncTaskTypes(updated.id, typeIds);

  return loadTask(updated.id);
}

export async function deleteTask(taskId: string): Promise<void> {
  await prisma.task.delete({ where: { id: taskId } });
}

export async function upsertTaskByCode(rawInput: unknown): Promise<{ action: "created" | "updated"; task: TaskListItem }> {
  const input = taskMutationSchema.parse(rawInput);
  const existing = await prisma.task.findUnique({
    where: { taskCode: input.taskCode }
  });

  if (existing) {
    const task = await updateTask(existing.id, input);
    return { action: "updated", task };
  }

  const task = await createTask(input);
  return { action: "created", task };
}
