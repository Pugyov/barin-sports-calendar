import { describe, expect, it } from "vitest";
import { getTaskStatusLabel, normalizeLegacyStatus } from "@/lib/task-normalization";

describe("task normalization", () => {
  it("maps done variants to normalized done", () => {
    expect(normalizeLegacyStatus("Done")).toBe("DONE");
    expect(normalizeLegacyStatus("article completed")).toBe("DONE");
  });

  it("defaults empty status to planned", () => {
    expect(normalizeLegacyStatus("")).toBe("PLANNED");
  });

  it("returns human labels for task statuses", () => {
    expect(getTaskStatusLabel("IN_PROGRESS")).toBe("In Progress");
  });
});
