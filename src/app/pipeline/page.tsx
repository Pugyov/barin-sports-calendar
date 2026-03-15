import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PipelineTable } from "@/components/app/pipeline-table";
import { createTaskAction } from "@/app/pipeline/actions";
import { getAuthSession } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { listTasks } from "@/lib/server/task-service";

export default async function PipelinePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: string; owner?: string; status?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const tasks = await listTasks(params);
  const writable = canWrite(session.user.role);

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
          <form className="grid gap-3 md:grid-cols-5">
            <Input name="q" placeholder="Search topic or code" defaultValue={params.q} />
            <Input name="type" placeholder="Type (e.g. Website)" defaultValue={params.type} />
            <Input name="owner" placeholder="Owner" defaultValue={params.owner} />
            <Input name="status" placeholder="Status" defaultValue={params.status} />
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      {writable ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTaskAction} className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="taskCode">Task Code</Label>
                <Input id="taskCode" name="taskCode" placeholder="BS-101" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" name="topic" placeholder="Website Article" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="types">Types (comma-separated)</Label>
                <Input id="types" name="types" placeholder="Website, Campaign" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phaseRule">Phase Rule</Label>
                <Input id="phaseRule" name="phaseRule" placeholder="Recurring" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input id="owner" name="owner" placeholder="name@company.com" />
              </div>
              <Separator className="md:col-span-3" />
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input id="publishDate" name="publishDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input id="status" name="status" placeholder="Done" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="workLink">Work Link</Label>
                <Input id="workLink" name="workLink" placeholder="https://..." />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Extra context..." />
              </div>
              <div className="md:col-span-3">
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineTable tasks={tasks} writable={writable} />
        </CardContent>
      </Card>
    </div>
  );
}
