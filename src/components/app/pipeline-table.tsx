import { Badge } from "@/components/ui/badge";
import { TaskActionsMenu } from "@/components/app/task-actions-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TaskListItem } from "@/types/task";

type PipelineTableProps = {
  tasks: TaskListItem[];
  writable: boolean;
};

export function PipelineTable({ tasks, writable }: PipelineTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead>Types</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Publish</TableHead>
          {writable ? <TableHead>Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.taskCode}</TableCell>
            <TableCell className="max-w-sm">{task.topic}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {task.types.length ? task.types.map((type) => <Badge key={type} variant="secondary">{type}</Badge>) : "-"}
              </div>
            </TableCell>
            <TableCell>{task.owner ?? "-"}</TableCell>
            <TableCell>{task.status ?? "Planned"}</TableCell>
            <TableCell>{task.startDate ?? "-"}</TableCell>
            <TableCell>{task.dueDate ?? "-"}</TableCell>
            <TableCell>{task.publishDate ?? "-"}</TableCell>
            {writable ? (
              <TableCell>
                <TaskActionsMenu task={task} />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
