import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MilestoneEvent } from "@/types/task";

const milestoneColors: Record<string, string> = {
  START: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
  DUE: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  PUB: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200"
};

function formatEventDate(date: string | null) {
  if (!date) return "Not set";
  return format(parseISO(date), "MMM d, yyyy");
}

type CalendarGridProps = {
  month: string;
  events: MilestoneEvent[];
};

export function CalendarGrid({ month, events }: CalendarGridProps) {
  const monthDate = parseISO(`${month}-01`);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase text-muted-foreground">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
        {days.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(parseISO(event.date), day));

          return (
            <Card
              key={day.toISOString()}
              className={isSameMonth(day, monthDate) ? "min-h-40 p-2" : "min-h-40 bg-muted/50 p-2 text-muted-foreground"}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">{format(day, "d")}</span>
                {dayEvents.length > 0 ? <Badge variant="secondary">{dayEvents.length}</Badge> : null}
              </div>

              <ScrollArea className="h-28">
                <div className="space-y-1 pr-2">
                  {dayEvents.map((event) => (
                    <Tooltip key={`${event.taskId}-${event.kind}`}>
                      <TooltipTrigger asChild>
                        <div className="cursor-default rounded border border-border bg-card p-1 text-xs">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className={`rounded px-1 py-0.5 text-[10px] font-semibold ${milestoneColors[event.kind]}`}>
                              {event.kind}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">{event.taskCode}</span>
                          </div>
                          <div className="line-clamp-2 font-medium">{event.topic}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="max-w-md p-4">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${milestoneColors[event.kind]}`}>
                                {event.kind}
                              </span>
                              <span className="text-xs font-medium text-muted-foreground">{event.taskCode}</span>
                            </div>
                            <div className="text-sm font-semibold">{event.topic}</div>
                          </div>

                          <div className="grid gap-2 text-xs sm:grid-cols-2">
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</div>
                              <div className="font-medium">{event.status ?? "Planned"}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Owner</div>
                              <div className="font-medium">{event.owner ?? "Unassigned"}</div>
                            </div>
                            <div className="sm:col-span-2">
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Phase Rule</div>
                              <div className="font-medium">{event.phaseRule ?? "Not set"}</div>
                            </div>
                          </div>

                          {event.types.length ? (
                            <div className="flex flex-wrap gap-1">
                              {event.types.map((type) => (
                                <Badge key={`${event.taskId}-${event.kind}-${type}`} variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          ) : null}

                          <div className="grid gap-2 text-xs sm:grid-cols-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Start</div>
                              <div className="font-medium">{formatEventDate(event.startDate)}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Due</div>
                              <div className="font-medium">{formatEventDate(event.dueDate)}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Publish</div>
                              <div className="font-medium">{formatEventDate(event.publishDate)}</div>
                            </div>
                          </div>

                          {event.notes ? (
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Notes</div>
                              <div className="line-clamp-4 text-xs leading-5">{event.notes}</div>
                            </div>
                          ) : null}

                          {event.workLink ? (
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Work Link</div>
                              <div className="truncate text-xs font-medium">{event.workLink}</div>
                            </div>
                          ) : null}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          );
        })}
      </div>
      </div>
    </TooltipProvider>
  );
}
