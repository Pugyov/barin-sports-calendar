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
        owner: task.owner,
        status: task.status
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
        owner: task.owner,
        status: task.status
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
        owner: task.owner,
        status: task.status
      });
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
