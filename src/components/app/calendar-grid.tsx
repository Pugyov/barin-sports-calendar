import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MilestoneEvent } from "@/types/task";

const milestoneColors: Record<string, string> = {
  START: "bg-sky-100 text-sky-800",
  DUE: "bg-amber-100 text-amber-900",
  PUB: "bg-emerald-100 text-emerald-900"
};

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
                    <div key={`${event.taskId}-${event.kind}`} className="rounded border border-border bg-card p-1 text-xs">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className={`rounded px-1 py-0.5 text-[10px] font-semibold ${milestoneColors[event.kind]}`}>
                          {event.kind}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">{event.taskCode}</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="line-clamp-2 font-medium">{event.topic}</div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-sm">
                          {event.topic}
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
