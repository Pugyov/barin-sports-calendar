import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn()
  })
}));

vi.mock("@/app/pipeline/actions", () => ({
  createTaskFormAction: vi.fn()
}));

import { CreateTaskForm } from "@/components/app/create-task-form";

describe("CreateTaskForm", () => {
  it("renders grouped sections and preserves all task field names", () => {
    const { container } = render(
      <CreateTaskForm
        taskTypes={[
          { id: 1, name: "Campaign" },
          { id: 2, name: "Website" }
        ]}
        assignableUsers={[
          { id: "user-1", displayName: "Koni" },
          { id: "user-2", displayName: "Milica" }
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: "Basics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Schedule" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Details" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();

    const fieldNames = [
      "topic",
      "taskTypeId",
      "ownerUserId",
      "status",
      "startDate",
      "dueDate",
      "publishDate",
      "workLink",
      "notes"
    ];

    for (const name of fieldNames) {
      expect(container.querySelector(`[name="${name}"]`)).toBeTruthy();
    }
  });
});
