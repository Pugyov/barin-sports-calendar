"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { startTransition, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { buildCalendarViewModel, milestoneLabels, type CalendarAgendaGroup } from "@/lib/calendar-view";
import { getTaskStatusLabel, TASK_STATUS_LABELS, TASK_STATUS_VALUES, type TaskStatusValue } from "@/lib/task-normalization";
import type { AssignableUserOption, MilestoneEvent, TaskTypeOption } from "@/types/task";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const milestoneChipStyles: Record<MilestoneEvent["kind"], string> = {
  DUE: "border-amber-300/60 bg-amber-500/10 text-amber-800 dark:border-amber-400/40 dark:bg-amber-500/18 dark:text-amber-100",
  PUB: "border-emerald-300/60 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/16 dark:text-emerald-100",
  START: "border-sky-300/60 bg-sky-500/10 text-sky-800 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-100"
};

type CalendarGridProps = {
  month: string;
  events: MilestoneEvent[];
  taskTypes: TaskTypeOption[];
  assignableUsers: AssignableUserOption[];
  selectedDate?: string;
  filters: {
    status?: "open" | TaskStatusValue;
    taskTypeId?: string;
    ownerUserId?: string;
  };
};

function eventKey(event: MilestoneEvent): string {
  return `${event.taskId}-${event.kind}-${event.date}`;
}

function buildSearch(searchParams: URLSearchParams, updates: Record<string, string | null>) {
  const nextParams = new URLSearchParams(searchParams.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
  }

  const query = nextParams.toString();
  return query ? `?${query}` : "";
}

function getRelevantDateLabel(event: MilestoneEvent) {
  return `${milestoneLabels[event.kind]} ${format(parseISO(event.date), "MMM d")}`;
}

function renderAgendaGroups(
  groups: CalendarAgendaGroup[],
  activeEventKey: string | null,
  onSelect: (event: MilestoneEvent) => void,
  onOpen: (event: MilestoneEvent) => void
) {
  return groups.map((group) => (
    <div key={group.kind} className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</h4>
        <Badge variant="secondary">{group.events.length}</Badge>
      </div>
      <div className="space-y-2">
        {group.events.map((event) => {
          const key = eventKey(event);
          const isActive = key === activeEventKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(event)}
              onDoubleClick={() => onOpen(event)}
              aria-label={`Focus ${event.topic}`}
              className={`w-full rounded-[calc(var(--radius)+0.05rem)] border p-3 text-left transition-colors ${
                isActive ? "border-primary/45 bg-primary/5 shadow-sm" : "border-border/70 bg-background/85 hover:border-primary/35 hover:bg-accent/35"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={milestoneChipStyles[event.kind]}>{milestoneLabels[event.kind]}</Badge>
                <Badge variant="secondary">{event.taskTypeName}</Badge>
                <span className="text-xs text-muted-foreground">{getRelevantDateLabel(event)}</span>
              </div>
              <div className="mt-2 text-sm font-semibold leading-5">{event.topic}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{getTaskStatusLabel(event.status)}</span>
                <span>•</span>
                <span>{event.ownerDisplay ?? "Unassigned"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  ));
}

function EventDetails({ event }: { event: MilestoneEvent | null }) {
  if (!event) {
    return (
      <div className="rounded-[calc(var(--radius)+0.05rem)] border border-dashed p-4 text-sm text-muted-foreground">
        Select an item to inspect its dates, notes, and pipeline link.
      </div>
    );
  }

  return (
    <div className="surface-subtle space-y-4 rounded-[calc(var(--radius)+0.15rem)] p-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={milestoneChipStyles[event.kind]}>{milestoneLabels[event.kind]}</Badge>
          <Badge variant="secondary">{event.taskTypeName}</Badge>
          <Badge variant="outline">{getTaskStatusLabel(event.status)}</Badge>
        </div>
        <div className="text-lg font-semibold leading-6">{event.topic}</div>
        <div className="text-sm text-muted-foreground">{event.ownerDisplay ?? "Unassigned"}</div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Start</div>
          <div className="mt-1 font-medium">{event.startDate ? format(parseISO(event.startDate), "MMM d, yyyy") : "Not set"}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Due</div>
          <div className="mt-1 font-medium">{event.dueDate ? format(parseISO(event.dueDate), "MMM d, yyyy") : "Not set"}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Publish</div>
          <div className="mt-1 font-medium">{event.publishDate ? format(parseISO(event.publishDate), "MMM d, yyyy") : "Not set"}</div>
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Phase Rule</div>
          <div className="mt-1 font-medium">{event.phaseRule ?? "Not set"}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Relevant Milestone</div>
          <div className="mt-1 font-medium">{getRelevantDateLabel(event)}</div>
        </div>
      </div>

      {event.notes ? (
        <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Notes</div>
          <div className="mt-1 text-sm leading-6">{event.notes}</div>
        </div>
      ) : null}

      {event.workLink ? (
        <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Work Link</div>
          <div className="mt-1 truncate text-sm font-medium">{event.workLink}</div>
        </div>
      ) : null}

      <Button asChild className="w-full">
        <Link href={`/pipeline?taskId=${event.taskId}`}>Open In Pipeline</Link>
      </Button>
    </div>
  );
}

export function CalendarGrid({ month, events, taskTypes, assignableUsers, selectedDate, filters }: CalendarGridProps) {
  const initialModel = useMemo(() => buildCalendarViewModel(month, events, selectedDate), [events, month, selectedDate]);

  return (
    <CalendarGridBody
      key={`${month}:${initialModel.selectedDate}`}
      month={month}
      events={events}
      taskTypes={taskTypes}
      assignableUsers={assignableUsers}
      selectedDate={selectedDate}
      filters={filters}
      initialSelectedDate={initialModel.selectedDate}
    />
  );
}

type CalendarGridBodyProps = CalendarGridProps & {
  initialSelectedDate: string;
};

function CalendarGridBody({ month, events, taskTypes, assignableUsers, filters, initialSelectedDate }: CalendarGridBodyProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedDateState, setSelectedDateState] = useState(initialSelectedDate);
  const [preferredActiveEventKey, setPreferredActiveEventKey] = useState<string | null>(null);
  const [mobileOpenEventKey, setMobileOpenEventKey] = useState<string | null>(null);

  const model = useMemo(() => buildCalendarViewModel(month, events, selectedDateState), [events, month, selectedDateState]);
  const activeEvent = model.selectedDay.events.find((event) => eventKey(event) === preferredActiveEventKey) ?? model.selectedDay.events[0] ?? null;
  const activeEventKey = activeEvent ? eventKey(activeEvent) : null;
  const mobileOpenEvent = model.agendaDays.flatMap((day) => day.events).find((event) => eventKey(event) === mobileOpenEventKey) ?? null;
  const hasFilters = Boolean(filters.ownerUserId || filters.status || filters.taskTypeId);

  function syncSelectedDate(nextDate: string) {
    const search = buildSearch(searchParams, { selectedDate: nextDate });
    startTransition(() => {
      router.replace(`${pathname}${search}`, { scroll: false });
    });
  }

  function selectDate(nextDate: string) {
    setSelectedDateState(nextDate);
    setPreferredActiveEventKey(null);
    syncSelectedDate(nextDate);
  }

  function handleSelectEvent(event: MilestoneEvent) {
    setSelectedDateState(event.date);
    setPreferredActiveEventKey(eventKey(event));
    syncSelectedDate(event.date);
  }

  function handleOpenMobileEvent(event: MilestoneEvent) {
    handleSelectEvent(event);
    setMobileOpenEventKey(eventKey(event));
  }

  return (
    <div className="space-y-6">
      <Card className="app-fade-in overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-card/88">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle>{format(parseISO(`${month}-01`), "MMMM yyyy")}</CardTitle>
                <CardDescription>Deadline-first calendar with selected-day agenda and mobile drill-down.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={milestoneChipStyles.DUE}>Due</Badge>
                <Badge className={milestoneChipStyles.PUB}>Publish</Badge>
                <Badge className={milestoneChipStyles.START}>Start</Badge>
                <Badge variant="outline" className="border-red-400/40 text-red-600 dark:text-red-300">
                  Overdue open work
                </Badge>
              </div>
            </div>

            <form className="grid gap-3 md:grid-cols-[12rem_12rem_12rem_auto_auto]">
              <input type="hidden" name="month" value={month} />
              <input type="hidden" name="selectedDate" value={model.selectedDate} />
              <select name="ownerUserId" defaultValue={filters.ownerUserId ?? ""} className="field-select">
                <option value="">All owners</option>
                <option value="unassigned">Unassigned</option>
                {assignableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName}
                  </option>
                ))}
              </select>
              <select name="status" defaultValue={filters.status ?? ""} className="field-select">
                <option value="">All statuses</option>
                <option value="open">Open</option>
                {TASK_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <select name="taskTypeId" defaultValue={filters.taskTypeId ?? ""} className="field-select">
                <option value="">All task types</option>
                {taskTypes.map((taskType) => (
                  <option key={taskType.id} value={taskType.id}>
                    {taskType.name}
                  </option>
                ))}
              </select>
              <Button type="submit">Apply</Button>
              {hasFilters ? (
                <Button type="button" variant="ghost" asChild>
                  <Link href={`/calendar?month=${month}`}>Reset</Link>
                </Button>
              ) : null}
            </form>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.95fr)]">
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {weekdayLabels.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {model.days.map((day) => {
                  const selected = day.isSelected;
                  const baseTone = day.inMonth ? "bg-card/82 text-foreground" : "bg-muted/35 text-muted-foreground";
                  const activeTone = selected ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border/70";
                  const overdueTone = day.hasOverdueOpen ? "ring-1 ring-red-400/50" : "";
                  const todayTone = day.isToday ? "border-sky-400/40" : "";

                  return (
                    <div
                      key={day.date}
                      onClick={() => selectDate(day.date)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectDate(day.date);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${format(parseISO(day.date), "MMMM d, yyyy")}`}
                      className={`min-h-40 rounded-[calc(var(--radius)+0.3rem)] border p-3 text-left transition-colors ${baseTone} ${activeTone} ${overdueTone} ${todayTone}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{format(parseISO(day.date), "d")}</span>
                        {day.events.length > 0 ? <Badge variant={selected ? "default" : "secondary"}>{day.events.length}</Badge> : null}
                      </div>

                      <div className="space-y-2">
                        {day.visibleEvents.map((event) => (
                          <button
                            key={eventKey(event)}
                            type="button"
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              handleSelectEvent(event);
                            }}
                            aria-label={`Focus ${event.topic}`}
                            className={`block w-full rounded-2xl border px-2 py-2 text-left text-xs transition-colors ${milestoneChipStyles[event.kind]}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold uppercase tracking-[0.14em]">{event.kind}</span>
                              {event.kind === "DUE" && event.status !== "DONE" && event.date < format(new Date(), "yyyy-MM-dd") ? (
                                <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-600 dark:text-red-300">Late</span>
                              ) : null}
                            </div>
                            <div className="mt-1 line-clamp-2 font-medium leading-4">{event.topic}</div>
                          </button>
                        ))}

                        {day.overflowCount > 0 ? (
                          <div className="rounded-2xl border border-dashed px-2 py-1.5 text-xs font-medium text-muted-foreground">+{day.overflowCount} more</div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="h-full rounded-[calc(var(--radius)+0.35rem)] border border-border/70 bg-secondary/25">
              <CardHeader className="border-b border-border/70">
                <CardTitle data-testid="selected-day-title">{format(parseISO(model.selectedDay.date), "EEEE, MMMM d")}</CardTitle>
                <CardDescription>
                  {model.selectedDay.events.length > 0
                    ? `${model.selectedDay.events.length} milestone${model.selectedDay.events.length === 1 ? "" : "s"} scheduled`
                    : "No scheduled milestones"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4">
                {model.groups.length > 0 ? (
                  <>
                    <div className="space-y-4">{renderAgendaGroups(model.groups, activeEventKey, handleSelectEvent, handleOpenMobileEvent)}</div>
                    <EventDetails event={activeEvent} />
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                    No scheduled milestones on {format(parseISO(model.selectedDay.date), "MMMM d")}.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {model.agendaDays.length > 0 ? (
                model.agendaDays.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => selectDate(day.date)}
                    aria-label={`Jump to ${format(parseISO(day.date), "MMMM d, yyyy")}`}
                    className={`min-w-fit rounded-full border px-3 py-2 text-left text-sm transition-colors ${
                      day.date === model.selectedDate ? "border-primary/40 bg-primary/5 text-foreground" : "border-border/70 bg-background/80 text-muted-foreground"
                    } ${day.hasOverdueOpen ? "ring-1 ring-red-400/60" : ""}`}
                  >
                    <div className="font-medium">{format(parseISO(day.date), "MMM d")}</div>
                    <div className="text-xs">{day.count} items</div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed px-4 py-3 text-sm text-muted-foreground">No milestones in this month.</div>
              )}
            </div>

            {model.agendaDays.map((day) => (
              <Card key={day.date} className={day.date === model.selectedDate ? "border-primary/40" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{day.label}</CardTitle>
                      <CardDescription>
                        {day.count} milestone{day.count === 1 ? "" : "s"}
                      </CardDescription>
                    </div>
                    {day.hasOverdueOpen ? (
                      <Badge variant="outline" className="border-red-400/40 text-red-600 dark:text-red-300">
                        Overdue
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {day.events.map((event) => (
                    <button
                      key={eventKey(event)}
                      type="button"
                      onClick={() => handleOpenMobileEvent(event)}
                      aria-label={`Open details for ${event.topic}`}
                      className="w-full rounded-2xl border border-border/70 bg-background/85 p-3 text-left transition-colors hover:border-primary/35 hover:bg-accent/30"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={milestoneChipStyles[event.kind]}>{milestoneLabels[event.kind]}</Badge>
                        <Badge variant="secondary">{event.taskTypeName}</Badge>
                      </div>
                      <div className="mt-2 font-semibold leading-5">{event.topic}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {getTaskStatusLabel(event.status)} • {event.ownerDisplay ?? "Unassigned"} • {getRelevantDateLabel(event)}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(mobileOpenEvent)} onOpenChange={(open) => (!open ? setMobileOpenEventKey(null) : undefined)}>
        <SheetContent data-testid="calendar-mobile-sheet" side="bottom" className="max-h-[85vh] rounded-t-3xl px-4 pb-8 pt-6">
          <SheetHeader className="mb-4">
            <SheetTitle>{mobileOpenEvent?.topic ?? "Task details"}</SheetTitle>
            <SheetDescription>{mobileOpenEvent ? `${milestoneLabels[mobileOpenEvent.kind]} milestone details` : "Inspect task details"}</SheetDescription>
          </SheetHeader>
          <EventDetails event={mobileOpenEvent} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
