import type { MilestoneEvent, TaskListItem } from "@/types/task";

export function deriveMilestones(tasks: TaskListItem[]): MilestoneEvent[] {
  const events: MilestoneEvent[] = [];

  for (const task of tasks) {
    if (task.startDate) {
      events.push({
        taskId: task.id,
        topic: task.topic,
        taskTypeName: task.taskTypeName,
        kind: "START",
        date: task.startDate,
        phaseRule: task.phaseRule,
        ownerUserId: task.ownerUserId,
        ownerDisplay: task.ownerDisplay,
        workLink: task.workLink,
        status: task.status,
        notes: task.notes,
        startDate: task.startDate,
        dueDate: task.dueDate,
        publishDate: task.publishDate
      });
    }

    if (task.dueDate) {
      events.push({
        taskId: task.id,
        topic: task.topic,
        taskTypeName: task.taskTypeName,
        kind: "DUE",
        date: task.dueDate,
        phaseRule: task.phaseRule,
        ownerUserId: task.ownerUserId,
        ownerDisplay: task.ownerDisplay,
        workLink: task.workLink,
        status: task.status,
        notes: task.notes,
        startDate: task.startDate,
        dueDate: task.dueDate,
        publishDate: task.publishDate
      });
    }

    if (task.publishDate) {
      events.push({
        taskId: task.id,
        topic: task.topic,
        taskTypeName: task.taskTypeName,
        kind: "PUB",
        date: task.publishDate,
        phaseRule: task.phaseRule,
        ownerUserId: task.ownerUserId,
        ownerDisplay: task.ownerDisplay,
        workLink: task.workLink,
        status: task.status,
        notes: task.notes,
        startDate: task.startDate,
        dueDate: task.dueDate,
        publishDate: task.publishDate
      });
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
