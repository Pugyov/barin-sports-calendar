import { describe, expect, it } from "vitest";
import { getNextTaskCodeFromValues } from "@/lib/server/task-service";

describe("task code suggestion", () => {
  it("returns the next BS code from existing values", () => {
    expect(getNextTaskCodeFromValues(["BS-099", "BS-101", "BS-100"])).toBe("BS-102");
  });

  it("ignores non-BS codes and keeps at least three digits", () => {
    expect(getNextTaskCodeFromValues(["FOO-1", "BS-9"])).toBe("BS-010");
  });

  it("falls back to BS-001 when no matching values exist", () => {
    expect(getNextTaskCodeFromValues(["FOO-1", "ABC"])).toBe("BS-001");
  });
});
