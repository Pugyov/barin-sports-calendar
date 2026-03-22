"use client";

import { NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskActionsMenu } from "@/components/app/task-actions-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getTaskStatusLabel } from "@/lib/task-normalization";
import type { AssignableUserOption, TaskListItem, TaskTypeOption } from "@/types/task";

type PipelineTableProps = {
  tasks: TaskListItem[];
  taskTypes: TaskTypeOption[];
  assignableUsers: AssignableUserOption[];
  writable: boolean;
};

export function PipelineTable({ tasks, taskTypes, assignableUsers, writable }: PipelineTableProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Table className="min-w-[860px]">
        <TableHeader>
          <TableRow>
            <TableHead>Topic</TableHead>
            <TableHead>Task Type</TableHead>
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
            <TableRow key={task.id} className="border-border/70 hover:bg-secondary/25">
              <TableCell className="max-w-sm">
                <div className="space-y-2">
                  <div className="line-clamp-2 font-medium leading-6">{task.topic}</div>
                  {task.notes ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-secondary/35 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground"
                          aria-label={`View notes for ${task.topic}`}
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
                <Badge variant="secondary">{task.taskTypeName}</Badge>
              </TableCell>
              <TableCell className="text-sm text-foreground/85">{task.ownerDisplay ?? "-"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {getTaskStatusLabel(task.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{task.startDate ?? "-"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{task.dueDate ?? "-"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{task.publishDate ?? "-"}</TableCell>
              {writable ? (
                <TableCell className="w-[72px]">
                  <TaskActionsMenu task={task} taskTypes={taskTypes} assignableUsers={assignableUsers} />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
