import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/calendar",
  useSearchParams: () => new URLSearchParams("month=2026-03")
}));

import { CalendarGrid } from "@/components/app/calendar-grid";
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

describe("CalendarGrid", () => {
  it("shows only two visible items in a day cell and renders overflow", () => {
    replace.mockReset();
    render(
      <CalendarGrid
        month="2026-03"
        selectedDate="2026-03-18"
        taskTypes={[{ id: 1, name: "Campaign" }]}
        assignableUsers={[{ id: "user-1", displayName: "Alex" }]}
        filters={{}}
        events={[
          makeEvent({ taskId: "task-1", topic: "Deadline", kind: "DUE" }),
          makeEvent({ taskId: "task-2", topic: "Publish", kind: "PUB" }),
          makeEvent({ taskId: "task-3", topic: "Kickoff", kind: "START" })
        ]}
      />
    );

    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("updates the selected-day panel when a different day is selected", async () => {
    replace.mockReset();
    const user = userEvent.setup();

    render(
      <CalendarGrid
        month="2026-03"
        selectedDate="2026-03-18"
        taskTypes={[{ id: 1, name: "Campaign" }]}
        assignableUsers={[{ id: "user-1", displayName: "Alex" }]}
        filters={{}}
        events={[
          makeEvent({ taskId: "task-1", topic: "Deadline", kind: "DUE", date: "2026-03-18", dueDate: "2026-03-18" }),
          makeEvent({ taskId: "task-2", topic: "Publish recap", kind: "PUB", date: "2026-03-21", publishDate: "2026-03-21" })
        ]}
      />
    );

    expect(screen.getByTestId("selected-day-title")).toHaveTextContent("Wednesday, March 18");

    await user.click(screen.getByRole("button", { name: "Select March 21, 2026" }));

    expect(screen.getByTestId("selected-day-title")).toHaveTextContent("Saturday, March 21");
  });

  it("opens mobile details and links to the pipeline task view", async () => {
    replace.mockReset();
    const user = userEvent.setup();

    render(
      <CalendarGrid
        month="2026-03"
        selectedDate="2026-03-18"
        taskTypes={[{ id: 1, name: "Campaign" }]}
        assignableUsers={[{ id: "user-1", displayName: "Alex" }]}
        filters={{}}
        events={[makeEvent({ taskId: "task-9", topic: "Publish recap", kind: "PUB", date: "2026-03-21", publishDate: "2026-03-21" })]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open details for Publish recap" }));

    const sheet = screen.getByTestId("calendar-mobile-sheet");
    expect(within(sheet).getByRole("heading", { name: "Publish recap" })).toBeInTheDocument();
    expect(within(sheet).getByRole("link", { name: "Open In Pipeline" })).toHaveAttribute("href", "/pipeline?taskId=task-9");
  });
});
