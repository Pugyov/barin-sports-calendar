import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildCalendarViewModel, getDefaultSelectedDate, isOverdueOpenEvent, sortMilestoneEvents } from "@/lib/calendar-view";
import type { MilestoneEvent } from "@/types/task";

function makeEvent(overrides: Partial<MilestoneEvent> = {}): MilestoneEvent {
  return {
    taskId: "task-1",
    topic: "Launch campaign",
    taskTypeName: "Campaign",
    kind: "DUE",
    date: "2026-03-18",
    phaseRule: "Recurring",
    ownerUserId: "user-1",
    ownerDisplay: "Alex",
    workLink: null,
    status: "PLANNED",
    notes: null,
    startDate: "2026-03-10",
    dueDate: "2026-03-18",
    publishDate: "2026-03-20",
    ...overrides
  };
}

describe("calendar view model", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("chooses today when today has events", () => {
    vi.setSystemTime(new Date("2026-03-18T10:00:00.000Z"));

    expect(getDefaultSelectedDate("2026-03", [makeEvent()])).toBe("2026-03-18");
  });

  it("falls back to the next active day when today has no events", () => {
    vi.setSystemTime(new Date("2026-03-17T10:00:00.000Z"));

    expect(
      getDefaultSelectedDate("2026-03", [
        makeEvent({ date: "2026-03-22", dueDate: "2026-03-22" }),
        makeEvent({ date: "2026-03-25", dueDate: "2026-03-25", taskId: "task-2" })
      ])
    ).toBe("2026-03-22");
  });

  it("orders milestones due, then publish, then start", () => {
    const ordered = sortMilestoneEvents([
      makeEvent({ kind: "START", taskId: "task-1", topic: "Start" }),
      makeEvent({ kind: "PUB", taskId: "task-2", topic: "Publish" }),
      makeEvent({ kind: "DUE", taskId: "task-3", topic: "Due" })
    ]);

    expect(ordered.map((event) => event.kind)).toEqual(["DUE", "PUB", "START"]);
  });

  it("marks overdue due events that are still open", () => {
    expect(isOverdueOpenEvent(makeEvent({ date: "2026-03-18", status: "IN_PROGRESS" }), "2026-03-19")).toBe(true);
    expect(isOverdueOpenEvent(makeEvent({ date: "2026-03-18", status: "DONE" }), "2026-03-19")).toBe(false);
  });

  it("limits visible items per day and computes overflow", () => {
    const model = buildCalendarViewModel(
      "2026-03",
      [
        makeEvent({ taskId: "task-1", topic: "A", kind: "DUE" }),
        makeEvent({ taskId: "task-2", topic: "B", kind: "PUB" }),
        makeEvent({ taskId: "task-3", topic: "C", kind: "START" })
      ],
      "2026-03-18",
      new Date("2026-03-18T00:00:00.000Z")
    );

    const selectedDay = model.selectedDay;
    expect(selectedDay.visibleEvents).toHaveLength(2);
    expect(selectedDay.overflowCount).toBe(1);
  });
});
