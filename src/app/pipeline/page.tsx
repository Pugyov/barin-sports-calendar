import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateTaskForm } from "@/components/app/create-task-form";
import { PipelineTable } from "@/components/app/pipeline-table";
import { getAuthSession } from "@/lib/auth";
import { TASK_STATUS_LABELS, TASK_STATUS_VALUES } from "@/lib/task-normalization";
import { canWrite } from "@/lib/roles";
import { listAssignableUsers } from "@/lib/server/user-service";
import { listTaskTypes, listTasks } from "@/lib/server/task-service";

export default async function PipelinePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; taskId?: string; taskTypeId?: string; ownerUserId?: string; ownerState?: "assigned" | "unassigned"; status?: "open" | (typeof TASK_STATUS_VALUES)[number]; dateField?: "start" | "due" | "publish"; from?: string; to?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const writable = canWrite(session.user.role);
  const [tasks, taskTypes, assignableUsers] = await Promise.all([listTasks(params), listTaskTypes(), listAssignableUsers()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        <span className="text-sm text-muted-foreground">{tasks.length} tasks</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-7">
            <Input name="q" placeholder="Search topic, owner, notes" defaultValue={params.q} />
            <input type="hidden" name="taskId" value={params.taskId ?? ""} />
            <input type="hidden" name="dateField" value={params.dateField ?? ""} />
            <select
              name="taskTypeId"
              defaultValue={params.taskTypeId ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="">All task types</option>
              {taskTypes.map((taskType) => (
                <option key={taskType.id} value={taskType.id}>
                  {taskType.name}
                </option>
              ))}
            </select>
            <select
              name="ownerUserId"
              defaultValue={params.ownerUserId ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="">All owners</option>
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName}
                </option>
              ))}
            </select>
            <select
              name="ownerState"
              defaultValue={params.ownerState ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="">Any assignment</option>
              <option value="assigned">Assigned only</option>
              <option value="unassigned">Unassigned only</option>
            </select>
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              {TASK_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <Input name="from" type="date" defaultValue={params.from} />
            <Input name="to" type="date" defaultValue={params.to} />
            <Button type="submit">Apply</Button>
          </form>
          {(params.taskId || params.taskTypeId || params.ownerUserId || params.status || params.ownerState || params.dateField || params.from || params.to) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {params.taskId ? <Badge variant="secondary">Focused task</Badge> : null}
              {params.taskTypeId ? (
                <Badge variant="secondary">
                  Type: {taskTypes.find((taskType) => String(taskType.id) === params.taskTypeId)?.name ?? "Unknown"}
                </Badge>
              ) : null}
              {params.ownerUserId ? (
                <Badge variant="secondary">
                  Owner: {assignableUsers.find((user) => user.id === params.ownerUserId)?.displayName ?? "Unknown"}
                </Badge>
              ) : null}
              {params.status ? <Badge variant="secondary">Status: {params.status === "open" ? "Open" : TASK_STATUS_LABELS[params.status]}</Badge> : null}
              {params.ownerState ? <Badge variant="secondary">{params.ownerState === "unassigned" ? "Unassigned only" : "Assigned only"}</Badge> : null}
              {params.dateField ? <Badge variant="secondary">Milestone: {params.dateField === "start" ? "Start" : params.dateField === "due" ? "Due" : "Publish"}</Badge> : null}
              {params.from ? <Badge variant="secondary">From: {params.from}</Badge> : null}
              {params.to ? <Badge variant="secondary">To: {params.to}</Badge> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {writable ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Task</CardTitle>
            <CardDescription>Quick entry for new work, grouped by basics, schedule, and supporting details.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTaskForm taskTypes={taskTypes} assignableUsers={assignableUsers} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineTable tasks={tasks} taskTypes={taskTypes} assignableUsers={assignableUsers} writable={writable} />
        </CardContent>
      </Card>
    </div>
  );
}
