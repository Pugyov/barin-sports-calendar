"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { deleteTaskAction, updateTaskAction } from "@/app/pipeline/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { TaskListItem } from "@/types/task";

type TaskActionsMenuProps = {
  task: TaskListItem;
};

export function TaskActionsMenu({ task }: TaskActionsMenuProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit task {task.taskCode}</DialogTitle>
            <DialogDescription>Update scheduling, ownership, and task details without leaving the pipeline view.</DialogDescription>
          </DialogHeader>
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateTaskAction(formData);
                setIsEditDialogOpen(false);
                router.refresh();
              });
            }}
            className="grid gap-3 md:grid-cols-3"
          >
            <input type="hidden" name="taskId" value={task.id} />
            <div className="space-y-2">
              <Label htmlFor={`edit-taskCode-${task.id}`}>Task Code</Label>
              <Input id={`edit-taskCode-${task.id}`} name="taskCode" defaultValue={task.taskCode} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`edit-topic-${task.id}`}>Topic</Label>
              <Input id={`edit-topic-${task.id}`} name="topic" defaultValue={task.topic} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-types-${task.id}`}>Types (comma-separated)</Label>
              <Input id={`edit-types-${task.id}`} name="types" defaultValue={task.types.join(", ")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-phaseRule-${task.id}`}>Phase Rule</Label>
              <Input id={`edit-phaseRule-${task.id}`} name="phaseRule" defaultValue={task.phaseRule ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-owner-${task.id}`}>Owner</Label>
              <Input id={`edit-owner-${task.id}`} name="owner" defaultValue={task.owner ?? ""} />
            </div>
            <Separator className="md:col-span-3" />
            <div className="space-y-2">
              <Label htmlFor={`edit-startDate-${task.id}`}>Start Date</Label>
              <Input id={`edit-startDate-${task.id}`} name="startDate" type="date" defaultValue={task.startDate ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-dueDate-${task.id}`}>Due Date</Label>
              <Input id={`edit-dueDate-${task.id}`} name="dueDate" type="date" defaultValue={task.dueDate ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-publishDate-${task.id}`}>Publish Date</Label>
              <Input id={`edit-publishDate-${task.id}`} name="publishDate" type="date" defaultValue={task.publishDate ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-status-${task.id}`}>Status</Label>
              <Input id={`edit-status-${task.id}`} name="status" defaultValue={task.status ?? ""} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`edit-workLink-${task.id}`}>Work Link</Label>
              <Input id={`edit-workLink-${task.id}`} name="workLink" defaultValue={task.workLink ?? ""} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor={`edit-notes-${task.id}`}>Notes</Label>
              <Textarea id={`edit-notes-${task.id}`} name="notes" defaultValue={task.notes ?? ""} />
            </div>
            <DialogFooter className="md:col-span-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${task.taskCode}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setIsEditDialogOpen(true);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault();
              setIsDeleteDialogOpen(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task {task.taskCode}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form action={deleteTaskAction}>
              <input type="hidden" name="taskId" value={task.id} />
              <AlertDialogAction asChild>
                <Button type="submit" variant="destructive">
                  Delete
                </Button>
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
