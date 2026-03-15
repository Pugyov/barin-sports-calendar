import { endOfMonth, format, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";
import { CalendarGrid } from "@/components/app/calendar-grid";
import { CalendarMonthSelector } from "@/components/app/calendar-month-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deriveMilestones } from "@/lib/milestones";
import { getAuthSession } from "@/lib/auth";
import { listTasks } from "@/lib/server/task-service";

function normalizeMonth(raw: string | undefined): string {
  if (!raw) return format(new Date(), "yyyy-MM");
  return /^\d{4}-\d{2}$/.test(raw) ? raw : format(new Date(), "yyyy-MM");
}

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const monthDate = new Date(`${month}-01T00:00:00.000Z`);

  const tasks = await listTasks({
    from: format(startOfMonth(monthDate), "yyyy-MM-dd"),
    to: format(endOfMonth(monthDate), "yyyy-MM-dd")
  });

  const events = deriveMilestones(tasks);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <CalendarMonthSelector currentMonth={month} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{format(monthDate, "MMMM yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarGrid month={month} events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
