"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createTaskFormAction } from "@/app/pipeline/actions";
import { FormFieldError } from "@/components/app/form-field-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUS_LABELS, TASK_STATUS_VALUES } from "@/lib/task-normalization";
import { createTaskFormState } from "@/types/task-form";
import type { AssignableUserOption, TaskTypeOption } from "@/types/task";

type CreateTaskFormProps = {
  taskTypes: TaskTypeOption[];
  assignableUsers: AssignableUserOption[];
};

const selectClassName = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm";
const sectionClassName = "rounded-2xl border bg-secondary/20 p-4 sm:p-5";

export function CreateTaskForm({ taskTypes, assignableUsers }: CreateTaskFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createTaskFormAction, createTaskFormState());

  useEffect(() => {
    if (state.status !== "success") return;

    formRef.current?.reset();
    router.refresh();
  }, [router, state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {state.message ? (
        <Alert variant={state.status === "error" ? "destructive" : "default"}>
          <AlertTitle>{state.status === "success" ? "Task saved" : "Could not create task"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <section className={sectionClassName} aria-labelledby="create-task-basics-heading">
        <div className="mb-4 space-y-1">
          <h3 id="create-task-basics-heading" className="text-sm font-semibold tracking-tight">
            Basics
          </h3>
          <p className="text-sm text-muted-foreground">Define the task identity, type, owner, and current status.</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(16rem,1fr)]">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" name="topic" placeholder="Website article" required />
              <FormFieldError message={state.fieldErrors.topic?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskTypeId">Task Type</Label>
              <select id="taskTypeId" name="taskTypeId" defaultValue="" className={selectClassName} required>
                <option value="" disabled>
                  Select a task type
                </option>
                {taskTypes.map((taskType) => (
                  <option key={taskType.id} value={taskType.id}>
                    {taskType.name}
                  </option>
                ))}
              </select>
              <FormFieldError message={state.fieldErrors.taskTypeId?.[0]} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownerUserId">Owner</Label>
              <select id="ownerUserId" name="ownerUserId" defaultValue="" className={selectClassName}>
                <option value="">Unassigned</option>
                {assignableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName}
                  </option>
                ))}
              </select>
              <FormFieldError message={state.fieldErrors.ownerUserId?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue="PLANNED" className={selectClassName}>
                {TASK_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <FormFieldError message={state.fieldErrors.status?.[0]} />
            </div>
          </div>
        </div>
      </section>

      <section className={sectionClassName} aria-labelledby="create-task-schedule-heading">
        <div className="mb-4 space-y-1">
          <h3 id="create-task-schedule-heading" className="text-sm font-semibold tracking-tight">
            Schedule
          </h3>
          <p className="text-sm text-muted-foreground">Set the milestone dates in the order the task moves through the pipeline.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" name="startDate" type="date" />
            <FormFieldError message={state.fieldErrors.startDate?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
            <FormFieldError message={state.fieldErrors.dueDate?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publishDate">Publish Date</Label>
            <Input id="publishDate" name="publishDate" type="date" />
            <FormFieldError message={state.fieldErrors.publishDate?.[0]} />
          </div>
        </div>
      </section>

      <section className={sectionClassName} aria-labelledby="create-task-details-heading">
        <div className="mb-4 space-y-1">
          <h3 id="create-task-details-heading" className="text-sm font-semibold tracking-tight">
            Details
          </h3>
          <p className="text-sm text-muted-foreground">Add supporting context and an optional work link when you have them.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workLink">Work Link</Label>
            <Input id="workLink" name="workLink" placeholder="https://..." />
            <FormFieldError message={state.fieldErrors.workLink?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Extra context..." />
            <FormFieldError message={state.fieldErrors.notes?.[0]} />
          </div>
        </div>
      </section>

      <div className="flex border-t pt-4 sm:justify-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
