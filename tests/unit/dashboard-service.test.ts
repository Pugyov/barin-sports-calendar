import { buildMilestoneMatrixRows, mapUrgentTask, sortUrgentItems } from "@/lib/server/dashboard-service";

describe("dashboard-service urgency mapping", () => {
  const today = new Date("2026-03-19T00:00:00.000Z");
  const weekAhead = new Date("2026-03-26T00:00:00.000Z");

  function makeTask(overrides: Record<string, unknown> = {}) {
    return {
      id: "task-1",
      topic: "Launch campaign",
      ownerUser: {
        name: "Alex",
        email: "alex@example.com"
      },
      dueDate: null,
      publishDate: null,
      status: "PLANNED",
      taskType: {
        name: "Campaign"
      },
      ...overrides
    } as never;
  }

  it("marks past-due open tasks as overdue", () => {
    const item = mapUrgentTask(
      makeTask({
        dueDate: new Date("2026-03-18T00:00:00.000Z")
      }),
      today,
      weekAhead
    );

    expect(item?.kind).toBe("overdue");
    expect(item?.label).toBe("Overdue");
    expect(item?.date).toBe("2026-03-18");
  });

  it("ignores due-soon tasks that are already done", () => {
    const item = mapUrgentTask(
      makeTask({
        dueDate: new Date("2026-03-22T00:00:00.000Z"),
        status: "DONE"
      }),
      today,
      weekAhead
    );

    expect(item).toBeNull();
  });

  it("uses publishing urgency when no due urgency applies", () => {
    const item = mapUrgentTask(
      makeTask({
        publishDate: new Date("2026-03-24T00:00:00.000Z")
      }),
      today,
      weekAhead
    );

    expect(item?.kind).toBe("publishing_soon");
    expect(item?.label).toBe("Publishing soon");
  });

  it("sorts overdue before due soon before publishing soon", () => {
    const items = sortUrgentItems([
      {
        taskId: "3",
        topic: "Publish recap",
        taskTypeName: "Website",
        ownerDisplay: null,
        status: "PLANNED",
        kind: "publishing_soon",
        label: "Publishing soon",
        tone: "info",
        date: "2026-03-21",
        href: "/pipeline?taskId=3",
        rank: 2
      },
      {
        taskId: "2",
        topic: "Prepare copy",
        taskTypeName: "Campaign",
        ownerDisplay: null,
        status: "IN_PROGRESS",
        kind: "due_soon",
        label: "Due soon",
        tone: "warning",
        date: "2026-03-20",
        href: "/pipeline?taskId=2",
        rank: 1
      },
      {
        taskId: "1",
        topic: "Missed deadline",
        taskTypeName: "Campaign",
        ownerDisplay: null,
        status: "BLOCKED",
        kind: "overdue",
        label: "Overdue",
        tone: "critical",
        date: "2026-03-18",
        href: "/pipeline?taskId=1",
        rank: 0
      }
    ]);

    expect(items.map((item) => item.topic)).toEqual(["Missed deadline", "Prepare copy", "Publish recap"]);
  });

  it("builds matrix rows with exact pipeline filters", () => {
    const rows = buildMilestoneMatrixRows(
      {
        next_3_days: { start: 5, due: 3, publish: 7 },
        on_time: { start: 2, due: 4, publish: 2 },
        overdue: { start: 1, due: 4, publish: 2 }
      },
      today
    );

    expect(rows[0]).toMatchObject({
      key: "next_3_days",
      label: "Next 3 days"
    });
    expect(rows[0].start).toEqual({
      count: 5,
      href: "/pipeline?status=open&dateField=start&from=2026-03-19&to=2026-03-21"
    });
    expect(rows[1].due.href).toBe("/pipeline?status=open&dateField=due&from=2026-03-19");
    expect(rows[2].publish.href).toBe("/pipeline?status=open&dateField=publish&to=2026-03-18");
  });
});
