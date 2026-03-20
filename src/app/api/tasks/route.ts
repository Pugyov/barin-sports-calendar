import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { canWrite } from "@/lib/roles";
import { getAuthSession } from "@/lib/auth";
import { invalidTaskFiltersError, normalizeTaskMutationError } from "@/lib/server/task-errors";
import { createTask, listTasks } from "@/lib/server/task-service";

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ownerState = searchParams.get("ownerState");
    const tasks = await listTasks({
      q: searchParams.get("q") ?? undefined,
      taskId: searchParams.get("taskId") ?? undefined,
      taskTypeId: searchParams.get("taskTypeId") ?? undefined,
      ownerUserId: searchParams.get("ownerUserId") ?? undefined,
      ownerState: ownerState === "assigned" || ownerState === "unassigned" ? ownerState : undefined,
      status: (searchParams.get("status") as "open" | "PLANNED" | "IN_PROGRESS" | "DONE" | "BLOCKED" | null) ?? undefined,
      dateField: (searchParams.get("dateField") as "start" | "due" | "publish" | null) ?? undefined,
      phaseRule: searchParams.get("phaseRule") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    const failure = error instanceof ZodError ? invalidTaskFiltersError() : normalizeTaskMutationError(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canWrite(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const task = await createTask(payload);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const failure = normalizeTaskMutationError(error);
    return NextResponse.json({ error: failure.message, fieldErrors: failure.fieldErrors }, { status: failure.status });
  }
}
