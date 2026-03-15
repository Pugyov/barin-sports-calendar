export type MilestoneKind = "START" | "DUE" | "PUB";

export type TaskListItem = {
  id: string;
  taskCode: string;
  topic: string;
  phaseRule: string | null;
  owner: string | null;
  workLink: string | null;
  status: string | null;
  statusNormalized: string | null;
  notes: string | null;
  startDate: string | null;
  dueDate: string | null;
  publishDate: string | null;
  types: string[];
};

export type MilestoneEvent = {
  taskId: string;
  taskCode: string;
  topic: string;
  kind: MilestoneKind;
  date: string;
  types: string[];
  owner: string | null;
  status: string | null;
};
