import { NextResponse } from "next/server";
import { canWrite } from "@/lib/roles";
import { getAuthSession } from "@/lib/auth";
import { createTask, listTasks } from "@/lib/server/task-service";

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tasks = await listTasks({
    q: searchParams.get("q") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    owner: searchParams.get("owner") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    phaseRule: searchParams.get("phaseRule") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const task = await createTask(payload);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
