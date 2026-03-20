import { addDays, format, startOfDay, subDays } from "date-fns";
import { Prisma } from "@prisma/client";
import { toDateOnlyIso } from "@/lib/excel";
import { prisma } from "@/lib/prisma";
import { getUserDisplayName } from "@/lib/user-display";
import type {
  DashboardKpi,
  DashboardMilestoneMatrixRow,
  DashboardOwnerWorkload,
  DashboardSnapshot,
  DashboardTopType,
  DashboardUrgentItem
} from "@/types/dashboard";

type TaskWithType = Prisma.TaskGetPayload<{
  include: { taskType: true; ownerUser: true };
}>;

type MatrixRowKey = "next_3_days" | "on_time" | "overdue";
type MatrixColumnKey = "start" | "due" | "publish";

function toPercent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function buildHref(pathname: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildPipelineHref(params: Record<string, string | undefined>) {
  return buildHref("/pipeline", params);
}

function summarizeAttention(overdueCount: number, dueSoonCount: number, publishingSoonCount: number, unassignedCount: number) {
  const parts: string[] = [];

  if (overdueCount > 0) {
    parts.push(`${overdueCount} overdue`);
  }

  if (dueSoonCount > 0) {
    parts.push(`${dueSoonCount} due this week`);
  }

  if (publishingSoonCount > 0) {
    parts.push(`${publishingSoonCount} publishing soon`);
  }

  if (unassignedCount > 0) {
    parts.push(`${unassignedCount} unassigned`);
  }

  if (parts.length === 0) {
    return "No urgent issues are on the board right now.";
  }

  return `${parts.join(", ")} need attention today.`;
}

function getUrgencyDescriptor(task: Pick<TaskWithType, "dueDate" | "publishDate" | "status">, today: Date, weekAhead: Date) {
  const isDone = task.status === "DONE";

  if (task.dueDate && !isDone && task.dueDate < today) {
    return {
      kind: "overdue" as const,
      label: "Overdue",
      tone: "critical" as const,
      date: task.dueDate,
      rank: 0
    };
  }

  if (task.dueDate && !isDone && task.dueDate >= today && task.dueDate <= weekAhead) {
    return {
      kind: "due_soon" as const,
      label: "Due soon",
      tone: "warning" as const,
      date: task.dueDate,
      rank: 1
    };
  }

  if (task.publishDate && task.publishDate >= today && task.publishDate <= weekAhead) {
    return {
      kind: "publishing_soon" as const,
      label: "Publishing soon",
      tone: "info" as const,
      date: task.publishDate,
      rank: 2
    };
  }

  return null;
}

export function mapUrgentTask(task: TaskWithType, today: Date, weekAhead: Date): (DashboardUrgentItem & { rank: number }) | null {
  const descriptor = getUrgencyDescriptor(task, today, weekAhead);
  if (!descriptor) {
    return null;
  }

  return {
    taskId: task.id,
    topic: task.topic,
    taskTypeName: task.taskType.name,
    ownerDisplay: task.ownerUser ? getUserDisplayName(task.ownerUser.name, task.ownerUser.email) : null,
    status: task.status,
    kind: descriptor.kind,
    label: descriptor.label,
    tone: descriptor.tone,
    date: toDateOnlyIso(descriptor.date) ?? "",
    href: buildPipelineHref({ taskId: task.id }),
    rank: descriptor.rank
  };
}

export function sortUrgentItems(items: Array<DashboardUrgentItem & { rank: number }>) {
  return [...items].sort((left, right) => {
    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }

    if (left.date !== right.date) {
      return left.date.localeCompare(right.date);
    }

    return left.topic.localeCompare(right.topic);
  });
}

function buildKpis(today: Date, weekAhead: Date, snapshot: Pick<DashboardSnapshot, "overdueCount" | "dueSoonCount" | "publishingSoonCount" | "unassignedCount">): DashboardKpi[] {
  return [
    {
      label: "Overdue",
      value: snapshot.overdueCount,
      hint: "Tasks past due",
      href: buildPipelineHref({
        status: "open",
        to: format(subDays(today, 1), "yyyy-MM-dd")
      }),
      tone: "critical"
    },
    {
      label: "Due in 7 days",
      value: snapshot.dueSoonCount,
      hint: `By ${format(weekAhead, "MMM d")}`,
      href: buildPipelineHref({
        status: "open",
        from: format(today, "yyyy-MM-dd"),
        to: format(weekAhead, "yyyy-MM-dd")
      }),
      tone: "warning"
    },
    {
      label: "Publishing in 7 days",
      value: snapshot.publishingSoonCount,
      hint: "Calendar watchlist",
      href: buildHref("/calendar", {
        month: format(today, "yyyy-MM")
      }),
      tone: "info"
    },
    {
      label: "Unassigned",
      value: snapshot.unassignedCount,
      hint: "No owner yet",
      href: buildPipelineHref({
        ownerState: "unassigned"
      }),
      tone: "neutral"
    }
  ];
}

function getMatrixRowDateBounds(rowKey: MatrixRowKey, today: Date) {
  if (rowKey === "next_3_days") {
    return {
      from: format(today, "yyyy-MM-dd"),
      to: format(addDays(today, 2), "yyyy-MM-dd")
    };
  }

  if (rowKey === "on_time") {
    return {
      from: format(today, "yyyy-MM-dd"),
      to: undefined
    };
  }

  return {
    from: undefined,
    to: format(subDays(today, 1), "yyyy-MM-dd")
  };
}

function countMilestonesForRange(
  tasks: Array<{
    startDate: Date | null;
    dueDate: Date | null;
    publishDate: Date | null;
  }>,
  predicate: (date: Date) => boolean
) {
  return tasks.reduce(
    (accumulator, task) => {
      if (task.startDate && predicate(task.startDate)) {
        accumulator.start += 1;
      }

      if (task.dueDate && predicate(task.dueDate)) {
        accumulator.due += 1;
      }

      if (task.publishDate && predicate(task.publishDate)) {
        accumulator.publish += 1;
      }

      return accumulator;
    },
    { start: 0, due: 0, publish: 0 }
  );
}

export function buildMilestoneMatrixRows(counts: Record<MatrixRowKey, Record<MatrixColumnKey, number>>, today: Date): DashboardMilestoneMatrixRow[] {
  const rowLabels: Record<MatrixRowKey, string> = {
    next_3_days: "Next 3 days",
    on_time: "On time",
    overdue: "Overdue"
  };

  return (["next_3_days", "on_time", "overdue"] as const).map((rowKey) => {
    const bounds = getMatrixRowDateBounds(rowKey, today);

    return {
      key: rowKey,
      label: rowLabels[rowKey],
      start: {
        count: counts[rowKey].start,
        href: buildPipelineHref({
          status: "open",
          dateField: "start",
          from: bounds.from,
          to: bounds.to
        })
      },
      due: {
        count: counts[rowKey].due,
        href: buildPipelineHref({
          status: "open",
          dateField: "due",
          from: bounds.from,
          to: bounds.to
        })
      },
      publish: {
        count: counts[rowKey].publish,
        href: buildPipelineHref({
          status: "open",
          dateField: "publish",
          from: bounds.from,
          to: bounds.to
        })
      }
    };
  });
}

function buildOwnerWorkloads(
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    ownedTasks: Array<{ id: string }>;
  }>
): DashboardOwnerWorkload[] {
  return users
    .map((user) => ({
      userId: user.id,
      displayName: getUserDisplayName(user.name, user.email),
      openTaskCount: user.ownedTasks.length,
      href: buildPipelineHref({
        ownerUserId: user.id,
        status: "open"
      })
    }))
    .sort((left, right) => {
      if (left.openTaskCount !== right.openTaskCount) {
        return right.openTaskCount - left.openTaskCount;
      }

      return left.displayName.localeCompare(right.displayName);
    });
}

export async function getDashboardSnapshot(now = new Date()): Promise<DashboardSnapshot> {
  const today = startOfDay(now);
  const weekAhead = addDays(today, 7);
  const openTaskWhere = {
    status: { not: "DONE" as const }
  };

  const [
    totalTasks,
    doneTasks,
    overdueCount,
    dueSoonCount,
    publishingSoonCount,
    unassignedCount,
    urgentTasks,
    taskTypes,
    openTasksForMatrix,
    activeUsers
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: "DONE" } }),
    prisma.task.count({
      where: {
        status: { not: "DONE" },
        dueDate: { lt: today }
      }
    }),
    prisma.task.count({
      where: {
        status: { not: "DONE" },
        dueDate: {
          gte: today,
          lte: weekAhead
        }
      }
    }),
    prisma.task.count({
      where: {
        publishDate: {
          gte: today,
          lte: weekAhead
        }
      }
    }),
    prisma.task.count({
      where: {
        ownerUserId: null
      }
    }),
    prisma.task.findMany({
      where: {
        OR: [
          {
            status: { not: "DONE" },
            dueDate: { lt: today }
          },
          {
            status: { not: "DONE" },
            dueDate: {
              gte: today,
              lte: weekAhead
            }
          },
          {
            publishDate: {
              gte: today,
              lte: weekAhead
            }
          }
        ]
      },
      include: {
        taskType: true,
        ownerUser: true
      },
      take: 24
    }),
    prisma.taskType.findMany({
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    }),
    prisma.task.findMany({
      where: openTaskWhere,
      select: {
        startDate: true,
        dueDate: true,
        publishDate: true
      }
    }),
    prisma.user.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        ownedTasks: {
          where: openTaskWhere,
          select: {
            id: true
          }
        }
      }
    })
  ]);

  const completionRate = toPercent(doneTasks, totalTasks);
  const mappedUrgentItems = urgentTasks.map((task) => mapUrgentTask(task, today, weekAhead)).filter(Boolean) as Array<
    DashboardUrgentItem & { rank: number }
  >;

  const topTypes: DashboardTopType[] = taskTypes
    .map((taskType) => ({
      name: taskType.name,
      taskCount: taskType._count.tasks,
      percent: toPercent(taskType._count.tasks, totalTasks)
    }))
    .sort((left, right) => right.taskCount - left.taskCount)
    .slice(0, 4);

  const milestoneMatrix = {
    rows: buildMilestoneMatrixRows(
      {
        next_3_days: countMilestonesForRange(openTasksForMatrix, (date) => date >= today && date <= addDays(today, 2)),
        on_time: countMilestonesForRange(openTasksForMatrix, (date) => date >= today),
        overdue: countMilestonesForRange(openTasksForMatrix, (date) => date < today)
      },
      today
    )
  };

  const ownerWorkloads = buildOwnerWorkloads(activeUsers);
  const snapshotBase = {
    overdueCount,
    dueSoonCount,
    publishingSoonCount,
    unassignedCount
  };

  return {
    dateLabel: format(now, "EEEE, MMMM d"),
    summary: summarizeAttention(overdueCount, dueSoonCount, publishingSoonCount, unassignedCount),
    totalTasks,
    doneTasks,
    openTasks: Math.max(totalTasks - doneTasks, 0),
    completionRate,
    overdueCount,
    dueSoonCount,
    publishingSoonCount,
    unassignedCount,
    kpis: buildKpis(today, weekAhead, snapshotBase),
    upcomingItems: sortUrgentItems(mappedUrgentItems).slice(0, 5).map(({ rank, ...item }) => item),
    topTypes,
    milestoneMatrix,
    ownerWorkloads
  };
}
