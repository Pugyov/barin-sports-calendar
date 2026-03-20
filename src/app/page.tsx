import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  LayoutGrid,
  ShieldAlert,
  UploadCloud,
  Users,
  UserRoundX,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAuthSession } from "@/lib/auth";
import { getTaskStatusLabel } from "@/lib/task-normalization";
import { getDashboardSnapshot } from "@/lib/server/dashboard-service";
import type { DashboardKpi, DashboardKpiTone, DashboardUrgentItem } from "@/types/dashboard";

function getDisplayName(name: string | null | undefined, email: string | null | undefined) {
  const trimmedName = name?.trim();
  if (trimmedName) {
    return trimmedName.split(/\s+/)[0] ?? trimmedName;
  }

  if (!email) return "team";

  const localPart = email.split("@")[0] ?? "";
  const firstToken = localPart.split(/[._-]+/).find(Boolean) ?? localPart;

  if (!firstToken) return "team";

  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

const kpiToneStyles: Record<DashboardKpiTone, string> = {
  critical: "border-red-500/25 bg-red-500/10",
  warning: "border-amber-500/25 bg-amber-500/10",
  info: "border-sky-500/25 bg-sky-500/10",
  neutral: "border-border bg-secondary/40"
};

const kpiIconMap: Record<DashboardKpi["label"], typeof ShieldAlert> = {
  Overdue: ShieldAlert,
  "Due in 7 days": AlertTriangle,
  "Publishing in 7 days": UploadCloud,
  Unassigned: UserRoundX
};

const urgencyBadgeStyles: Record<DashboardUrgentItem["kind"], string> = {
  overdue: "border-transparent bg-red-500/15 text-red-200",
  due_soon: "border-transparent bg-amber-500/15 text-amber-100",
  publishing_soon: "border-transparent bg-sky-500/15 text-sky-100"
};

export default async function HomePage() {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const snapshot = await getDashboardSnapshot();
  const displayName = getDisplayName(session.user.name, session.user.email);

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-3xl border bg-card">
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {snapshot.dateLabel}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {snapshot.openTasks} open tasks
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {displayName}. Here&apos;s your operational picture for today.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{snapshot.summary}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {snapshot.kpis.map((item) => {
          const Icon = kpiIconMap[item.label];

          return (
            <Link key={item.label} href={item.href} className="block">
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`rounded-2xl border p-2 ${kpiToneStyles[item.tone]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="text-3xl font-semibold tracking-tight">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.hint}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Execution health</CardTitle>
            <CardDescription>Completion rate and remaining workload across the board.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold">{snapshot.completionRate}%</p>
                <p className="text-sm text-muted-foreground">tasks marked done</p>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {snapshot.totalTasks} total
              </Badge>
            </div>
            <Progress value={snapshot.completionRate} className="h-2" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border bg-secondary/40 p-4">
                <div className="text-muted-foreground">Open tasks</div>
                <div className="mt-1 text-2xl font-semibold">{snapshot.openTasks}</div>
              </div>
              <div className="rounded-2xl border bg-secondary/40 p-4">
                <div className="text-muted-foreground">Done tasks</div>
                <div className="mt-1 text-2xl font-semibold">{snapshot.doneTasks}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Milestone matrix</CardTitle>
            </div>
            <CardDescription>Open tasks split by milestone type and timing window.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] bg-secondary/40 text-sm font-medium">
                <div className="border-b px-4 py-3 text-muted-foreground">Window</div>
                <div className="border-b border-l px-4 py-3 text-center">Start</div>
                <div className="border-b border-l px-4 py-3 text-center">Due</div>
                <div className="border-b border-l px-4 py-3 text-center">Publish</div>
              </div>
              {snapshot.milestoneMatrix.rows.map((row) => (
                <div key={row.key} className="grid grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] text-sm">
                  <div className="border-b px-4 py-3 font-medium">{row.label}</div>
                  <Link href={row.start.href} className="border-b border-l px-4 py-3 text-center transition-colors hover:bg-secondary/40">
                    {row.start.count}
                  </Link>
                  <Link href={row.due.href} className="border-b border-l px-4 py-3 text-center transition-colors hover:bg-secondary/40">
                    {row.due.count}
                  </Link>
                  <Link href={row.publish.href} className="border-b border-l px-4 py-3 text-center transition-colors hover:bg-secondary/40">
                    {row.publish.count}
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.25fr_0.75fr]">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle>People assigned</CardTitle>
            </div>
            <CardDescription>Open workload by active registered user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.ownerWorkloads.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">No active users are available for task assignment.</div>
            ) : (
              snapshot.ownerWorkloads.map((entry) => (
                <Link key={entry.userId} href={entry.href} className="block">
                  <div className="flex items-center justify-between rounded-2xl border p-4 transition-colors hover:border-primary/40 hover:bg-secondary/40">
                    <div className="font-medium">{entry.displayName}</div>
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {entry.openTaskCount}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Needs attention today</CardTitle>
            <CardDescription>The next deadlines and publish moments that deserve action first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.upcomingItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                Nothing urgent is queued for the next seven days.
              </div>
            ) : (
              snapshot.upcomingItems.map((item) => {
                const date = parseDateOnly(item.date);

                return (
                  <Link key={`${item.kind}-${item.taskId}`} href={item.href} className="block">
                    <div className="rounded-2xl border p-4 transition-colors hover:border-primary/40 hover:bg-secondary/40">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={urgencyBadgeStyles[item.kind]}>{item.label}</Badge>
                            <Badge variant="secondary">{item.taskTypeName}</Badge>
                          </div>
                          <p className="font-medium leading-6">{item.topic}</p>
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(date, "EEE, MMM d")}</span>
                        <span>·</span>
                        <span>{formatDistanceToNowStrict(date, { addSuffix: true })}</span>
                        <span>·</span>
                        <span>{item.ownerDisplay ?? "Unassigned"}</span>
                        <span>·</span>
                        <span>{getTaskStatusLabel(item.status)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top content types</CardTitle>
            <CardDescription>Current task mix by controlled task type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.topTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create tasks to see content mix.</p>
            ) : (
              snapshot.topTypes.map((type, index) => (
                <div key={type.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{type.name}</span>
                    <span className="text-muted-foreground">{type.taskCount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${type.percent}%`,
                        backgroundColor: `var(--chart-${(index % 5) + 1})`
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
