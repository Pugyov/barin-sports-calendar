import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn()
  })
}));

vi.mock("@/app/pipeline/actions", () => ({
  updateTaskFormAction: vi.fn(),
  deleteTaskFormAction: vi.fn()
}));

import { TaskActionsMenu } from "@/components/app/task-actions-menu";

describe("TaskActionsMenu", () => {
  const task = {
    id: "task-1",
    taskCode: "BS-001",
    topic: "Campaign launch",
    phaseRule: "Recurring",
    owner: "owner@example.com",
    workLink: "https://example.com",
    status: "Planned",
    statusNormalized: "planned",
    notes: "Notes",
    startDate: "2026-03-14",
    dueDate: "2026-03-16",
    publishDate: "2026-03-18",
    types: ["Campaign"]
  } as const;

  it("opens edit dialog from actions menu", async () => {
    const user = userEvent.setup();

    render(<TaskActionsMenu task={task} />);

    await user.click(screen.getByRole("button", { name: /actions for bs-001/i }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(screen.getByText("Edit task BS-001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Campaign launch")).toBeInTheDocument();
  });

  it("opens delete confirmation dialog from actions menu", async () => {
    const user = userEvent.setup();

    render(<TaskActionsMenu task={task} />);

    await user.click(screen.getByRole("button", { name: /actions for bs-001/i }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(screen.getByText("Delete task BS-001?")).toBeInTheDocument();
  });
});
