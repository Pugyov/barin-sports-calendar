import { describe, expect, it } from "vitest";
import { taskFilterSchema, taskMutationSchema } from "@/lib/validation/task";

describe("task mutation validation", () => {
  it("accepts valid task payload", () => {
    const result = taskMutationSchema.parse({
      topic: "Test task",
      taskTypeId: "1",
      status: "PLANNED",
      startDate: "2026-03-01",
      dueDate: "2026-03-03",
      publishDate: "2026-03-10"
    });

    expect(result.taskTypeId).toBe("1");
    expect(result.status).toBe("PLANNED");
  });

  it("rejects invalid date order", () => {
    const result = taskMutationSchema.safeParse({
      topic: "Broken dates",
      taskTypeId: "1",
      status: "PLANNED",
      startDate: "2026-03-10",
      dueDate: "2026-03-03",
      publishDate: "2026-03-01"
    });

    expect(result.success).toBe(false);
  });

  it("rejects a non-numeric task type id", () => {
    const result = taskMutationSchema.safeParse({
      topic: "Bad type",
      taskTypeId: "campaign",
      status: "PLANNED"
    });

    expect(result.success).toBe(false);
  });
});

describe("task filter validation", () => {
  it("treats empty select query params as unset filters", () => {
    const result = taskFilterSchema.parse({
      status: "",
      ownerState: "",
      taskTypeId: "",
      q: ""
    });

    expect(result.status).toBeUndefined();
    expect(result.ownerState).toBeUndefined();
    expect(result.taskTypeId).toBeUndefined();
    expect(result.q).toBe("");
  });

  it("accepts a concrete status filter", () => {
    const result = taskFilterSchema.parse({
      status: "PLANNED",
      ownerState: ""
    });

    expect(result.status).toBe("PLANNED");
    expect(result.ownerState).toBeUndefined();
  });
});
