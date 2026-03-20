export type MilestoneKind = "START" | "DUE" | "PUB";

export type TaskTypeOption = {
  id: number;
  name: string;
};

export type AssignableUserOption = {
  id: string;
  displayName: string;
};

export type TaskListItem = {
  id: string;
  topic: string;
  taskTypeId: number;
  taskTypeName: string;
  phaseRule: string | null;
  ownerUserId: string | null;
  ownerDisplay: string | null;
  workLink: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  notes: string | null;
  startDate: string | null;
  dueDate: string | null;
  publishDate: string | null;
};

export type MilestoneEvent = {
  taskId: string;
  topic: string;
  taskTypeName: string;
  kind: MilestoneKind;
  date: string;
  phaseRule: string | null;
  ownerUserId: string | null;
  ownerDisplay: string | null;
  workLink: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  notes: string | null;
  startDate: string | null;
  dueDate: string | null;
  publishDate: string | null;
};
