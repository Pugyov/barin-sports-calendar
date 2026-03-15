import { describe, expect, it } from "vitest";
import { normalizeStatus, splitTypes } from "@/lib/task-normalization";

describe("task normalization", () => {
  it("splits and deduplicates type strings", () => {
    expect(splitTypes("Website, Campaign, Website")).toEqual(["Website", "Campaign"]);
  });

  it("maps done variants to normalized done", () => {
    expect(normalizeStatus("Done")).toBe("done");
    expect(normalizeStatus("article completed")).toBe("done");
  });

  it("defaults empty status to planned", () => {
    expect(normalizeStatus("")).toBe("planned");
  });
});
