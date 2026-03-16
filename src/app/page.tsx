import Link from "next/link";
import { addDays, endOfMonth, format, formatDistanceToNowStrict, startOfDay, startOfMonth } from "date-fns";
import { CalendarDays, CheckCircle2, Clock3, UploadCloud } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listRecentImports } from "@/lib/server/import-service";

type TypeWithCount = {
  name: string;
  taskCount: number;
};

function getDisplayName(email: string | null | undefined) {
  if (!email) return "team";

  const localPart = email.split("@")[0] ?? "";
  const firstToken = localPart.split(/[._-]+/).find(Boolean) ?? localPart;

  if (!firstToken) return "team";

  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
}

function toPercent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export default async function HomePage() {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const displayName = getDisplayName(session.user.email);
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekAhead = addDays(todayStart, 7);

  const [
    totalTasks,
    doneTasks,
    publishingThisMonth,
    dueThisWeek,
    upcomingPublishes,
    recentImports,
    typeTags
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { statusNormalized: "done" } }),
    prisma.task.count({
      where: {
        publishDate: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    }),
    prisma.task.count({
      where: {
        dueDate: {
          gte: todayStart,
          lte: weekAhead
        }
      }
    }),
    prisma.task.findMany({
      where: {
        publishDate: {
          gte: todayStart
        }
      },
      orderBy: {
        publishDate: "asc"
      },
      take: 6,
      include: {
        taskTypes: {
          include: {
            typeTag: true
          }
        }
      }
    }),
    listRecentImports(5),
    prisma.typeTag.findMany({
      include: {
        _count: {
          select: {
            taskTypes: true
          }
        }
      }
    })
  ]);

  const completionRate = toPercent(doneTasks, totalTasks);
  const topTypes: TypeWithCount[] = typeTags
    .map((tag) => ({
      name: tag.name,
      taskCount: tag._count.taskTypes
    }))
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 5);

  const statCards = [
    {
      label: "Total tasks",
      value: totalTasks,
      hint: `${doneTasks} completed`,
      icon: CalendarDays,
      accent: "bg-chart-1"
    },
    {
      label: "Publishing this month",
      value: publishingThisMonth,
      hint: format(monthEnd, "MMMM yyyy"),
      icon: UploadCloud,
      accent: "bg-chart-2"
    },
    {
      label: "Due in 7 days",
      value: dueThisWeek,
      hint: `By ${format(weekAhead, "MMM d")}`,
      icon: Clock3,
      accent: "bg-chart-3"
    },
    {
      label: "Completion rate",
      value: `${completionRate}%`,
      hint: `${totalTasks - doneTasks} still active`,
      icon: CheckCircle2,
      accent: "bg-chart-4"
    }
  ] as const;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--chart-2),transparent_28%),radial-gradient(circle_at_bottom_right,var(--chart-1),transparent_32%)] opacity-20" />
        <div className="relative grid gap-8 px-6 py-8 md:grid-cols-[1.35fr_0.95fr] md:px-8 md:py-10">
          <div className="space-y-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Marketing operations dashboard
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
                Welcome back, {displayName}. Ready to shape today&apos;s marketing calendar?
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                This workspace gives you a quick read on pipeline load, publishing pressure, and recent imports before you move into
                the calendar or pipeline details.
              </p>
            </div>
          </div>

          <Card className="border-border/70 bg-background/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Execution health</CardTitle>
              <CardDescription>Current completion rate across all imported and manually created tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold">{completionRate}%</p>
                  <p className="text-sm text-muted-foreground">of tasks are marked done</p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {totalTasks} total
                </Badge>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border bg-card p-4">
                  <div className="text-muted-foreground">Open tasks</div>
                  <div className="mt-1 text-2xl font-semibold">{totalTasks - doneTasks}</div>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <div className="text-muted-foreground">Recent imports</div>
                  <div className="mt-1 text-2xl font-semibold">{recentImports.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="overflow-hidden">
              <CardContent className="relative p-0">
                <div className={`h-1 w-full ${item.accent}`} />
                <div className="flex items-start justify-between px-5 py-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.hint}</p>
                  </div>
                  <div className="rounded-2xl border bg-secondary p-3">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming publish queue</CardTitle>
            <CardDescription>The next items with publish dates on or after today.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPublishes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming publish dates are scheduled yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Publish date</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Types</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingPublishes.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="font-medium">{task.topic}</div>
                        <div className="text-xs text-muted-foreground">{task.taskCode}</div>
                      </TableCell>
                      <TableCell>
                        {task.publishDate ? (
                          <div>
                            <div>{format(task.publishDate, "MMM d, yyyy")}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNowStrict(task.publishDate, { addSuffix: true })}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{task.owner ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {task.taskTypes.length > 0 ? (
                            task.taskTypes.slice(0, 3).map((type) => (
                              <Badge key={type.typeTag.id} variant="secondary">
                                {type.typeTag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top content types</CardTitle>
              <CardDescription>Current task volume by tag.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Import data to see content mix.</p>
              ) : (
                topTypes.map((type, index) => (
                  <div key={type.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type.name}</span>
                      <span className="text-muted-foreground">{type.taskCount}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${toPercent(type.taskCount, totalTasks)}%`,
                          backgroundColor: `var(--chart-${(index % 5) + 1})`
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent imports</CardTitle>
              <CardDescription>Last workbook activity in the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentImports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No import batches yet.</p>
              ) : (
                recentImports.map((batch, index) => (
                  <div key={batch.id} className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{batch.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNowStrict(batch.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant={batch.dryRun ? "secondary" : "default"}>{batch.dryRun ? "Dry-run" : "Commit"}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div className="rounded-xl border bg-muted/40 p-2 text-center">
                        <div className="font-medium text-foreground">{batch.createdCount}</div>
                        created
                      </div>
                      <div className="rounded-xl border bg-muted/40 p-2 text-center">
                        <div className="font-medium text-foreground">{batch.updatedCount}</div>
                        updated
                      </div>
                      <div className="rounded-xl border bg-muted/40 p-2 text-center">
                        <div className="font-medium text-foreground">{batch.skippedCount}</div>
                        skipped
                      </div>
                      <div className="rounded-xl border bg-muted/40 p-2 text-center">
                        <div className="font-medium text-foreground">{batch.errorCount}</div>
                        errors
                      </div>
                    </div>
                    {index < recentImports.length - 1 ? <Separator /> : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
}
