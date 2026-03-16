"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { deleteTaskFormAction, updateTaskFormAction } from "@/app/pipeline/actions";
import { FormFieldError } from "@/components/app/form-field-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { initialTaskFormState } from "@/types/task-form";
import type { TaskListItem } from "@/types/task";

type TaskActionsMenuProps = {
  task: TaskListItem;
};

export function TaskActionsMenu({ task }: TaskActionsMenuProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editState, editFormAction, editPending] = useActionState(updateTaskFormAction, initialTaskFormState);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteTaskFormAction, initialTaskFormState);

  useEffect(() => {
    if (editState.status !== "success") return;

    router.refresh();
    const closeTimeout = window.setTimeout(() => {
      setIsEditDialogOpen(false);
    }, 0);

    return () => window.clearTimeout(closeTimeout);
  }, [editState.status, router]);

  useEffect(() => {
    if (deleteState.status !== "success") return;

    router.refresh();
    const closeTimeout = window.setTimeout(() => {
      setIsDeleteDialogOpen(false);
    }, 0);

    return () => window.clearTimeout(closeTimeout);
  }, [deleteState.status, router]);

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit task {task.taskCode}</DialogTitle>
            <DialogDescription>Update scheduling, ownership, and task details without leaving the pipeline view.</DialogDescription>
          </DialogHeader>
          <form action={editFormAction} className="grid gap-3 md:grid-cols-3">
            <input type="hidden" name="taskId" value={task.id} />
            {editState.message ? (
              <Alert variant={editState.status === "error" ? "destructive" : "default"} className="md:col-span-3">
                <AlertTitle>{editState.status === "success" ? "Task saved" : "Could not update task"}</AlertTitle>
                <AlertDescription>{editState.message}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor={`edit-taskCode-${task.id}`}>Task Code</Label>
              <Input id={`edit-taskCode-${task.id}`} name="taskCode" defaultValue={task.taskCode} required />
              <FormFieldError message={editState.fieldErrors.taskCode?.[0]} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`edit-topic-${task.id}`}>Topic</Label>
              <Input id={`edit-topic-${task.id}`} name="topic" defaultValue={task.topic} required />
              <FormFieldError message={editState.fieldErrors.topic?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-types-${task.id}`}>Types (comma-separated)</Label>
              <Input id={`edit-types-${task.id}`} name="types" defaultValue={task.types.join(", ")} />
              <FormFieldError message={editState.fieldErrors.types?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-owner-${task.id}`}>Owner</Label>
              <Input id={`edit-owner-${task.id}`} name="owner" defaultValue={task.owner ?? ""} />
              <FormFieldError message={editState.fieldErrors.owner?.[0]} />
            </div>
            <Separator className="md:col-span-3" />
            <div className="space-y-2">
              <Label htmlFor={`edit-startDate-${task.id}`}>Start Date</Label>
              <Input id={`edit-startDate-${task.id}`} name="startDate" type="date" defaultValue={task.startDate ?? ""} />
              <FormFieldError message={editState.fieldErrors.startDate?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-dueDate-${task.id}`}>Due Date</Label>
              <Input id={`edit-dueDate-${task.id}`} name="dueDate" type="date" defaultValue={task.dueDate ?? ""} />
              <FormFieldError message={editState.fieldErrors.dueDate?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-publishDate-${task.id}`}>Publish Date</Label>
              <Input id={`edit-publishDate-${task.id}`} name="publishDate" type="date" defaultValue={task.publishDate ?? ""} />
              <FormFieldError message={editState.fieldErrors.publishDate?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-status-${task.id}`}>Status</Label>
              <Input id={`edit-status-${task.id}`} name="status" defaultValue={task.status ?? ""} />
              <FormFieldError message={editState.fieldErrors.status?.[0]} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`edit-workLink-${task.id}`}>Work Link</Label>
              <Input id={`edit-workLink-${task.id}`} name="workLink" defaultValue={task.workLink ?? ""} />
              <FormFieldError message={editState.fieldErrors.workLink?.[0]} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor={`edit-notes-${task.id}`}>Notes</Label>
              <Textarea id={`edit-notes-${task.id}`} name="notes" defaultValue={task.notes ?? ""} />
              <FormFieldError message={editState.fieldErrors.notes?.[0]} />
            </div>
            <DialogFooter className="md:col-span-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={editPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={editPending}>
                {editPending ? "Saving..." : "Save Changes"}
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
          <form action={deleteFormAction}>
            {deleteState.message ? (
              <Alert variant={deleteState.status === "error" ? "destructive" : "default"} className="mb-4">
                <AlertTitle>{deleteState.status === "success" ? "Task deleted" : "Could not delete task"}</AlertTitle>
                <AlertDescription>{deleteState.message}</AlertDescription>
              </Alert>
            ) : null}
            <input type="hidden" name="taskId" value={task.id} />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletePending}>Cancel</AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={deletePending}>
                {deletePending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
