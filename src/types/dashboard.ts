export type DashboardKpiTone = "critical" | "warning" | "info" | "neutral";

export type DashboardKpi = {
  label: string;
  value: number;
  hint: string;
  href: string;
  tone: DashboardKpiTone;
};

export type DashboardUrgentItemKind = "overdue" | "due_soon" | "publishing_soon";

export type DashboardUrgentItem = {
  taskId: string;
  topic: string;
  taskTypeName: string;
  ownerDisplay: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  kind: DashboardUrgentItemKind;
  label: string;
  tone: DashboardKpiTone;
  date: string;
  href: string;
};

export type DashboardTopType = {
  name: string;
  taskCount: number;
  percent: number;
};

export type DashboardMilestoneMatrixCell = {
  count: number;
  href: string;
};

export type DashboardMilestoneMatrixRow = {
  key: "next_3_days" | "on_time" | "overdue";
  label: string;
  start: DashboardMilestoneMatrixCell;
  due: DashboardMilestoneMatrixCell;
  publish: DashboardMilestoneMatrixCell;
};

export type DashboardOwnerWorkload = {
  userId: string;
  displayName: string;
  openTaskCount: number;
  href: string;
};

export type DashboardSnapshot = {
  dateLabel: string;
  summary: string;
  totalTasks: number;
  doneTasks: number;
  openTasks: number;
  completionRate: number;
  overdueCount: number;
  dueSoonCount: number;
  publishingSoonCount: number;
  unassignedCount: number;
  kpis: DashboardKpi[];
  upcomingItems: DashboardUrgentItem[];
  topTypes: DashboardTopType[];
  milestoneMatrix: {
    rows: DashboardMilestoneMatrixRow[];
  };
  ownerWorkloads: DashboardOwnerWorkload[];
};
