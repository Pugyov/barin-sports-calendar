import { describe, expect, it } from "vitest";
import { deriveMilestones } from "@/lib/milestones";

describe("milestone derivation", () => {
  it("creates START, DUE, and PUB events when all dates exist", () => {
    const tasks = [
      {
        id: "t1",
        topic: "Launch",
        taskTypeId: 1,
        taskTypeName: "Website",
        phaseRule: "Recurring",
        ownerUserId: "user-1",
        ownerDisplay: "Owner Example",
        workLink: null,
        status: "DONE",
        notes: null,
        startDate: "2026-03-01",
        dueDate: "2026-03-05",
        publishDate: "2026-03-10"
      }
    ];

    const events = deriveMilestones(tasks);
    expect(events).toHaveLength(3);
    expect(events.map((event) => event.kind)).toEqual(["START", "DUE", "PUB"]);
    expect(events[0]).toMatchObject({
      phaseRule: "Recurring",
      ownerUserId: "user-1",
      ownerDisplay: "Owner Example",
      status: "DONE",
      startDate: "2026-03-01",
      dueDate: "2026-03-05",
      publishDate: "2026-03-10"
    });
  });

  it("skips missing milestone dates", () => {
    const tasks = [
      {
        id: "t2",
        topic: "Post",
        taskTypeId: 2,
        taskTypeName: "Social media post",
        phaseRule: null,
        ownerUserId: null,
        ownerDisplay: null,
        workLink: null,
        status: "PLANNED",
        notes: null,
        startDate: null,
        dueDate: null,
        publishDate: "2026-04-01"
      }
    ];

    const events = deriveMilestones(tasks);
    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("PUB");
  });
});
