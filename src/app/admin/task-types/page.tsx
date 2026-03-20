import { redirect } from "next/navigation";
import { createTaskTypeAction, deleteTaskTypeAction } from "@/app/admin/task-types/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { listTaskTypesWithUsage } from "@/lib/server/task-type-service";

export default async function AdminTaskTypesPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  if (!isAdmin(session.user.role)) {
    redirect("/");
  }

  const params = await searchParams;
  const taskTypes = await listTaskTypesWithUsage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Types</h1>
          <p className="text-sm text-muted-foreground">Manage the controlled task-type list used by the pipeline and calendar.</p>
        </div>
        <Badge variant="secondary">{taskTypes.length} task types</Badge>
      </div>

      {params.error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not update task types</AlertTitle>
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      ) : null}

      {params.success ? (
        <Alert>
          <AlertTitle>Task types updated</AlertTitle>
          <AlertDescription>
            {params.success === "created" ? "Task type created successfully." : "Task type deleted successfully."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Add task type</CardTitle>
          <CardDescription>New task types become immediately available in pipeline create and edit forms.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTaskTypeAction} className="flex flex-col gap-3 sm:flex-row">
            <Input name="name" placeholder="e.g. Sponsorship" required />
            <Button type="submit">Add Type</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current task types</CardTitle>
          <CardDescription>Deletion is only allowed when no tasks still reference the task type.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Assigned Tasks</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taskTypes.map((taskType) => (
                <TableRow key={taskType.id}>
                  <TableCell className="font-medium">{taskType.name}</TableCell>
                  <TableCell>{taskType.usageCount}</TableCell>
                  <TableCell>
                    <form action={deleteTaskTypeAction}>
                      <input type="hidden" name="taskTypeId" value={taskType.id} />
                      <Button type="submit" size="sm" variant="outline" disabled={taskType.usageCount > 0}>
                        Delete
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
