import { describe, expect, it } from "vitest";
import { deriveMilestones } from "@/lib/milestones";

describe("milestone derivation", () => {
  it("creates START, DUE, and PUB events when all dates exist", () => {
    const tasks = [
      {
        id: "t1",
        taskCode: "BS-001",
        topic: "Launch",
        phaseRule: "Recurring",
        owner: "owner@example.com",
        workLink: null,
        status: "Done",
        statusNormalized: "done",
        notes: null,
        startDate: "2026-03-01",
        dueDate: "2026-03-05",
        publishDate: "2026-03-10",
        types: ["Website"]
      }
    ];

    const events = deriveMilestones(tasks);
    expect(events).toHaveLength(3);
    expect(events.map((event) => event.kind)).toEqual(["START", "DUE", "PUB"]);
    expect(events[0]).toMatchObject({
      phaseRule: "Recurring",
      owner: "owner@example.com",
      status: "Done",
      startDate: "2026-03-01",
      dueDate: "2026-03-05",
      publishDate: "2026-03-10"
    });
  });

  it("skips missing milestone dates", () => {
    const tasks = [
      {
        id: "t2",
        taskCode: "BS-002",
        topic: "Post",
        phaseRule: null,
        owner: null,
        workLink: null,
        status: null,
        statusNormalized: "planned",
        notes: null,
        startDate: null,
        dueDate: null,
        publishDate: "2026-04-01",
        types: ["Social media post"]
      }
    ];

    const events = deriveMilestones(tasks);
    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("PUB");
  });
});
