import type { MilestoneEvent, TaskListItem } from "@/types/task";

export function deriveMilestones(tasks: TaskListItem[]): MilestoneEvent[] {
  const events: MilestoneEvent[] = [];

  for (const task of tasks) {
    if (task.startDate) {
      events.push({
        taskId: task.id,
        taskCode: task.taskCode,
        topic: task.topic,
        kind: "START",
        date: task.startDate,
        types: task.types,
        phaseRule: task.phaseRule,
        owner: task.owner,
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
        taskCode: task.taskCode,
        topic: task.topic,
        kind: "DUE",
        date: task.dueDate,
        types: task.types,
        phaseRule: task.phaseRule,
        owner: task.owner,
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
        taskCode: task.taskCode,
        topic: task.topic,
        kind: "PUB",
        date: task.publishDate,
        types: task.types,
        phaseRule: task.phaseRule,
        owner: task.owner,
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
