import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const taskTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required")
});

export type TaskTypeListItem = {
  id: number;
  name: string;
  usageCount: number;
};

export async function listTaskTypesWithUsage(): Promise<TaskTypeListItem[]> {
  const taskTypes = await prisma.taskType.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          tasks: true
        }
      }
    }
  });

  return taskTypes.map((taskType) => ({
    id: taskType.id,
    name: taskType.name,
    usageCount: taskType._count.tasks
  }));
}

export async function createTaskType(rawInput: unknown) {
  const input = taskTypeSchema.parse(rawInput);

  try {
    return await prisma.taskType.create({
      data: {
        name: input.name
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Task type already exists.");
    }

    throw error;
  }
}

export async function deleteTaskType(taskTypeId: number) {
  const taskType = await prisma.taskType.findUnique({
    where: { id: taskTypeId },
    include: {
      _count: {
        select: {
          tasks: true
        }
      }
    }
  });

  if (!taskType) {
    throw new Error("Task type not found.");
  }

  if (taskType._count.tasks > 0) {
    throw new Error("Task type is still assigned to tasks.");
  }

  await prisma.taskType.delete({
    where: { id: taskTypeId }
  });
}
