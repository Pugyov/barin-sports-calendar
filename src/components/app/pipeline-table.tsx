import { NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskActionsMenu } from "@/components/app/task-actions-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TaskListItem } from "@/types/task";

type PipelineTableProps = {
  tasks: TaskListItem[];
  writable: boolean;
};

export function PipelineTable({ tasks, writable }: PipelineTableProps) {
  return (
    <TooltipProvider delayDuration={150}>
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
              <TableCell className="max-w-sm">
                <div className="space-y-2">
                  <div className="line-clamp-2 font-medium">{task.topic}</div>
                  {task.notes ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          aria-label={`View notes for ${task.taskCode}`}
                        >
                          <NotebookPen className="h-3.5 w-3.5" />
                          <span>Note</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent align="start" className="max-w-sm whitespace-pre-wrap text-xs leading-5">
                        <div className="mb-1 font-semibold text-foreground">Notes</div>
                        <div>{task.notes}</div>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </TableCell>
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
    </TooltipProvider>
  );
}
