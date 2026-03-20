import { NextResponse } from "next/server";
import { canWrite } from "@/lib/roles";
import { getAuthSession } from "@/lib/auth";
import { normalizeTaskMutationError } from "@/lib/server/task-errors";
import { deleteTask, updateTask } from "@/lib/server/task-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canWrite(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const task = await updateTask(id, payload);
    return NextResponse.json({ task });
  } catch (error) {
    const failure = normalizeTaskMutationError(error);
    return NextResponse.json({ error: failure.message, fieldErrors: failure.fieldErrors }, { status: failure.status });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canWrite(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await deleteTask(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const failure = normalizeTaskMutationError(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}
