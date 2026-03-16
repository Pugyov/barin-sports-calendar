import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateTaskForm } from "@/components/app/create-task-form";
import { PipelineTable } from "@/components/app/pipeline-table";
import { getAuthSession } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { getNextTaskCode, listTasks } from "@/lib/server/task-service";

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
  const writable = canWrite(session.user.role);
  const [tasks, suggestedTaskCode] = await Promise.all([listTasks(params), writable ? getNextTaskCode() : Promise.resolve("")]);

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
            <CreateTaskForm suggestedTaskCode={suggestedTaskCode} />
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
