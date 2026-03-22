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
  searchParams: Promise<{
    q?: string;
    taskId?: string;
    taskTypeId?: string;
    ownerUserId?: string;
    ownerState?: "assigned" | "unassigned";
    status?: "open" | (typeof TASK_STATUS_VALUES)[number];
    dateField?: "start" | "due" | "publish";
    from?: string;
    to?: string;
  }>;
}) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const writable = canWrite(session.user.role);
  const [tasks, taskTypes, assignableUsers] = await Promise.all([listTasks(params), listTaskTypes(), listAssignableUsers()]);

  const hasFilters = Boolean(
    params.taskId || params.taskTypeId || params.ownerUserId || params.status || params.ownerState || params.dateField || params.from || params.to
  );

  return (
    <div className="space-y-6">
      <section className="workspace-header app-fade-in">
        <div className="space-y-2">
          <p className="workspace-kicker">Execution Workspace</p>
          <h1 className="workspace-title">Pipeline</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Filter work, add new tasks, and manage the active queue from a single surface.</p>
        </div>
        <div className="surface-subtle px-4 py-3 text-sm text-muted-foreground">
          <span className="text-2xl font-semibold tracking-tight text-foreground">{tasks.length}</span> tasks in view
        </div>
      </section>

      <section className="workspace-toolbar app-fade-in">
        <div className="min-w-0 flex-1">
          <div className="workspace-kicker">Filters</div>
          <div className="text-sm text-muted-foreground">Refine the task list by owner, type, status, and milestone window.</div>
        </div>
        <form className="grid w-full gap-3 lg:grid-cols-[minmax(14rem,1.6fr)_repeat(4,minmax(9rem,1fr))_minmax(9rem,1fr)_minmax(9rem,1fr)_auto]">
          <Input name="q" placeholder="Search topic, owner, notes" defaultValue={params.q} />
          <input type="hidden" name="taskId" value={params.taskId ?? ""} />
          <input type="hidden" name="dateField" value={params.dateField ?? ""} />
          <select name="taskTypeId" defaultValue={params.taskTypeId ?? ""} className="field-select">
            <option value="">All task types</option>
            {taskTypes.map((taskType) => (
              <option key={taskType.id} value={taskType.id}>
                {taskType.name}
              </option>
            ))}
          </select>
          <select name="ownerUserId" defaultValue={params.ownerUserId ?? ""} className="field-select">
            <option value="">All owners</option>
            {assignableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
          <select name="ownerState" defaultValue={params.ownerState ?? ""} className="field-select">
            <option value="">Any assignment</option>
            <option value="assigned">Assigned only</option>
            <option value="unassigned">Unassigned only</option>
          </select>
          <select name="status" defaultValue={params.status ?? ""} className="field-select">
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
      </section>

      {hasFilters ? (
        <div className="flex flex-wrap gap-2">
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

      {writable ? (
        <Card className="app-fade-in">
          <CardHeader className="pb-4">
            <CardTitle>Create Task</CardTitle>
            <CardDescription>Quick entry for new work, grouped by basics, schedule, and supporting details.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTaskForm taskTypes={taskTypes} assignableUsers={assignableUsers} />
          </CardContent>
        </Card>
      ) : null}

      <Card className="app-fade-in">
        <CardHeader className="pb-4">
          <CardTitle>Task List</CardTitle>
          <CardDescription>Operational list view for editing, ownership checks, and schedule scanning.</CardDescription>
        </CardHeader>
        <CardContent>
          <PipelineTable tasks={tasks} taskTypes={taskTypes} assignableUsers={assignableUsers} writable={writable} />
        </CardContent>
      </Card>
    </div>
  );
}
