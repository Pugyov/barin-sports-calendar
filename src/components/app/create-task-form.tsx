"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createTaskFormAction } from "@/app/pipeline/actions";
import { FormFieldError } from "@/components/app/form-field-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createTaskFormState } from "@/types/task-form";

type CreateTaskFormProps = {
  suggestedTaskCode: string;
};

export function CreateTaskForm({ suggestedTaskCode }: CreateTaskFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const taskCodeRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(createTaskFormAction, createTaskFormState(suggestedTaskCode));

  useEffect(() => {
    if (state.status !== "success") return;

    formRef.current?.reset();
    if (taskCodeRef.current) {
      taskCodeRef.current.value = state.suggestedTaskCode;
    }
    router.refresh();
  }, [router, state.status, state.suggestedTaskCode]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 md:grid-cols-3">
      {state.message ? (
        <Alert variant={state.status === "error" ? "destructive" : "default"} className="md:col-span-3">
          <AlertTitle>{state.status === "success" ? "Task saved" : "Could not create task"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="taskCode">Task Code</Label>
        <Input
          ref={taskCodeRef}
          id="taskCode"
          name="taskCode"
          defaultValue={state.suggestedTaskCode}
          placeholder="BS-101"
          required
        />
        <FormFieldError message={state.fieldErrors.taskCode?.[0]} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" placeholder="Website Article" required />
        <FormFieldError message={state.fieldErrors.topic?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="types">Types (comma-separated)</Label>
        <Input id="types" name="types" placeholder="Website, Campaign" />
        <FormFieldError message={state.fieldErrors.types?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="owner">Owner</Label>
        <Input id="owner" name="owner" placeholder="name@company.com" />
        <FormFieldError message={state.fieldErrors.owner?.[0]} />
      </div>
      <Separator className="md:col-span-3" />
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
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Input id="status" name="status" placeholder="Done" />
        <FormFieldError message={state.fieldErrors.status?.[0]} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="workLink">Work Link</Label>
        <Input id="workLink" name="workLink" placeholder="https://..." />
        <FormFieldError message={state.fieldErrors.workLink?.[0]} />
      </div>
      <div className="space-y-2 md:col-span-3">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Extra context..." />
        <FormFieldError message={state.fieldErrors.notes?.[0]} />
      </div>
      <div className="md:col-span-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
