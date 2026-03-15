import { describe, expect, it } from "vitest";
import { taskMutationSchema } from "@/lib/validation/task";

describe("task mutation validation", () => {
  it("accepts valid task payload", () => {
    const result = taskMutationSchema.parse({
      taskCode: "BS-201",
      topic: "Test task",
      types: ["Website"],
      startDate: "2026-03-01",
      dueDate: "2026-03-03",
      publishDate: "2026-03-10"
    });

    expect(result.taskCode).toBe("BS-201");
  });

  it("rejects invalid date order", () => {
    const result = taskMutationSchema.safeParse({
      taskCode: "BS-202",
      topic: "Broken dates",
      types: ["Website"],
      startDate: "2026-03-10",
      dueDate: "2026-03-03",
      publishDate: "2026-03-01"
    });

    expect(result.success).toBe(false);
  });
});
