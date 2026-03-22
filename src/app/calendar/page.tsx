import { endOfMonth, format, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";
import { CalendarGrid } from "@/components/app/calendar-grid";
import { CalendarMonthSelector } from "@/components/app/calendar-month-selector";
import { TASK_STATUS_VALUES } from "@/lib/task-normalization";
import { deriveMilestones } from "@/lib/milestones";
import { getAuthSession } from "@/lib/auth";
import { listTasks, listTaskTypes } from "@/lib/server/task-service";
import { listAssignableUsers } from "@/lib/server/user-service";

function normalizeMonth(raw: string | undefined): string {
  if (!raw) return format(new Date(), "yyyy-MM");
  return /^\d{4}-\d{2}$/.test(raw) ? raw : format(new Date(), "yyyy-MM");
}

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<{
    month?: string;
    status?: "open" | (typeof TASK_STATUS_VALUES)[number];
    taskTypeId?: string;
    ownerUserId?: string;
    selectedDate?: string;
  }>;
}) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const monthDate = new Date(`${month}-01T00:00:00.000Z`);

  const [tasks, taskTypes, assignableUsers] = await Promise.all([
    listTasks({
      from: format(startOfMonth(monthDate), "yyyy-MM-dd"),
      to: format(endOfMonth(monthDate), "yyyy-MM-dd"),
      status: params.status,
      taskTypeId: params.taskTypeId,
      ownerUserId: params.ownerUserId === "unassigned" ? undefined : params.ownerUserId,
      ownerState: params.ownerUserId === "unassigned" ? "unassigned" : undefined
    }),
    listTaskTypes(),
    listAssignableUsers()
  ]);

  const events = deriveMilestones(tasks);

  return (
    <div className="space-y-6">
      <div className="workspace-header app-fade-in">
        <div className="space-y-2">
          <p className="workspace-kicker">Schedule Workspace</p>
          <h1 className="workspace-title">Calendar</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Inspect milestone timing, filter the board, and drill into the selected day without leaving the calendar view.</p>
        </div>
        <CalendarMonthSelector currentMonth={month} />
      </div>

      <CalendarGrid
        month={month}
        events={events}
        taskTypes={taskTypes}
        assignableUsers={assignableUsers}
        filters={{
          status: params.status,
          taskTypeId: params.taskTypeId ?? "",
          ownerUserId: params.ownerUserId ?? ""
        }}
        selectedDate={params.selectedDate}
      />
    </div>
  );
}
