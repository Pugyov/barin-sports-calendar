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
    topic: "Campaign launch",
    taskTypeId: 1,
    taskTypeName: "Campaign",
    phaseRule: "Recurring",
    ownerUserId: "user-1",
    ownerDisplay: "Owner Example",
    workLink: "https://example.com",
    status: "PLANNED",
    notes: "Notes",
    startDate: "2026-03-14",
    dueDate: "2026-03-16",
    publishDate: "2026-03-18"
  } as const;

  const taskTypes = [
    { id: 1, name: "Campaign" },
    { id: 2, name: "Website" }
  ] as const;

  const assignableUsers = [
    { id: "user-1", displayName: "Owner Example" },
    { id: "user-2", displayName: "Milica" }
  ] as const;

  it("opens edit dialog from actions menu", async () => {
    const user = userEvent.setup();

    render(<TaskActionsMenu task={task} taskTypes={taskTypes} assignableUsers={assignableUsers} />);

    await user.click(screen.getByRole("button", { name: /actions for campaign launch/i }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(screen.getByText("Edit task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Campaign launch")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Campaign")).toBeInTheDocument();
  });

  it("opens delete confirmation dialog from actions menu", async () => {
    const user = userEvent.setup();

    render(<TaskActionsMenu task={task} taskTypes={taskTypes} assignableUsers={assignableUsers} />);

    await user.click(screen.getByRole("button", { name: /actions for campaign launch/i }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(screen.getByText("Delete task?")).toBeInTheDocument();
  });
});
