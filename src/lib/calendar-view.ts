import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";
import type { MilestoneEvent } from "@/types/task";

export const CALENDAR_VISIBLE_ITEM_LIMIT = 2;

export const milestonePriority: Record<MilestoneEvent["kind"], number> = {
  DUE: 0,
  PUB: 1,
  START: 2
};

export const milestoneLabels: Record<MilestoneEvent["kind"], string> = {
  DUE: "Due",
  PUB: "Publish",
  START: "Start"
};

export type CalendarDayView = {
  date: string;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasOverdueOpen: boolean;
  events: MilestoneEvent[];
  visibleEvents: MilestoneEvent[];
  overflowCount: number;
};

export type CalendarAgendaGroup = {
  kind: MilestoneEvent["kind"];
  label: string;
  events: MilestoneEvent[];
};

export type CalendarViewModel = {
  month: string;
  selectedDate: string;
  days: CalendarDayView[];
  selectedDay: CalendarDayView;
  agendaDays: Array<{
    date: string;
    label: string;
    count: number;
    hasOverdueOpen: boolean;
    events: MilestoneEvent[];
  }>;
  groups: CalendarAgendaGroup[];
};

export function sortMilestoneEvents(events: MilestoneEvent[]): MilestoneEvent[] {
  return [...events].sort((left, right) => {
    const priorityDiff = milestonePriority[left.kind] - milestonePriority[right.kind];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    if (left.status !== right.status) {
      return left.status.localeCompare(right.status);
    }

    return left.topic.localeCompare(right.topic);
  });
}

export function isOverdueOpenEvent(event: MilestoneEvent, todayIso: string): boolean {
  return event.kind === "DUE" && event.status !== "DONE" && event.date < todayIso;
}

function isDateInMonth(value: string, month: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value.startsWith(`${month}-`);
}

function getUniqueEventDates(events: MilestoneEvent[], month: string): string[] {
  return Array.from(new Set(events.map((event) => event.date).filter((date) => isDateInMonth(date, month)))).sort((left, right) =>
    left.localeCompare(right)
  );
}

export function getDefaultSelectedDate(month: string, events: MilestoneEvent[], now = new Date()): string {
  const todayIso = format(now, "yyyy-MM-dd");
  const uniqueDates = getUniqueEventDates(events, month);

  if (todayIso.startsWith(`${month}-`) && uniqueDates.includes(todayIso)) {
    return todayIso;
  }

  const upcomingDate = uniqueDates.find((date) => date > todayIso);
  if (upcomingDate) {
    return upcomingDate;
  }

  if (todayIso.startsWith(`${month}-`)) {
    return todayIso;
  }

  return `${month}-01`;
}

export function resolveSelectedDate(month: string, selectedDate: string | undefined, events: MilestoneEvent[], now = new Date()): string {
  if (selectedDate && isDateInMonth(selectedDate, month)) {
    const parsed = parseISO(selectedDate);
    if (isValid(parsed)) {
      return selectedDate;
    }
  }

  return getDefaultSelectedDate(month, events, now);
}

export function buildCalendarViewModel(
  month: string,
  events: MilestoneEvent[],
  selectedDate: string | undefined,
  now = new Date()
): CalendarViewModel {
  const todayIso = format(now, "yyyy-MM-dd");
  const monthDate = parseISO(`${month}-01`);
  const calendarStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const resolvedSelectedDate = resolveSelectedDate(month, selectedDate, events, now);

  const dayMap = new Map<string, MilestoneEvent[]>();
  for (const event of events) {
    const list = dayMap.get(event.date) ?? [];
    list.push(event);
    dayMap.set(event.date, list);
  }

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((day) => {
    const date = format(day, "yyyy-MM-dd");
    const dayEvents = sortMilestoneEvents(dayMap.get(date) ?? []);

    return {
      date,
      inMonth: date.startsWith(`${month}-`),
      isToday: date === todayIso,
      isSelected: date === resolvedSelectedDate,
      hasOverdueOpen: dayEvents.some((event) => isOverdueOpenEvent(event, todayIso)),
      events: dayEvents,
      visibleEvents: dayEvents.slice(0, CALENDAR_VISIBLE_ITEM_LIMIT),
      overflowCount: Math.max(dayEvents.length - CALENDAR_VISIBLE_ITEM_LIMIT, 0)
    };
  });

  const selectedDay = days.find((day) => day.date === resolvedSelectedDate) ?? days[0];
  const agendaDays = days
    .filter((day) => day.inMonth && day.events.length > 0)
    .map((day) => ({
      date: day.date,
      label: format(parseISO(day.date), "EEE, MMM d"),
      count: day.events.length,
      hasOverdueOpen: day.hasOverdueOpen,
      events: day.events
    }));

  const groups: CalendarAgendaGroup[] = (["DUE", "PUB", "START"] as const)
    .map((kind) => ({
      kind,
      label: milestoneLabels[kind],
      events: selectedDay.events.filter((event) => event.kind === kind)
    }))
    .filter((group) => group.events.length > 0);

  return {
    month,
    selectedDate: selectedDay.date,
    days,
    selectedDay,
    agendaDays,
    groups
  };
}
