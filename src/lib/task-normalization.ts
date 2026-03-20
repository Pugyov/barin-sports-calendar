export const DEFAULT_PHASE_RULE = "Recurring";

export const TASK_STATUS_VALUES = ["PLANNED", "IN_PROGRESS", "DONE", "BLOCKED"] as const;

export type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  BLOCKED: "Blocked"
};

export function splitTypes(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return Array.from(new Set(raw.map((value) => value.trim()).filter(Boolean)));
  }

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

export function normalizeLegacyStatus(raw: string | null | undefined): TaskStatusValue {
  const value = raw?.trim().toLowerCase();

  if (!value) return "PLANNED";
  if (value === "done" || value === "article completed") return "DONE";
  if (value.includes("progress")) return "IN_PROGRESS";
  if (value.includes("block")) return "BLOCKED";

  return "PLANNED";
}

export function getTaskStatusLabel(status: TaskStatusValue): string {
  return TASK_STATUS_LABELS[status];
}

export function cleanNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
