export type TaskFormField =
  | "topic"
  | "taskTypeId"
  | "ownerUserId"
  | "workLink"
  | "status"
  | "notes"
  | "startDate"
  | "dueDate"
  | "publishDate";

export type TaskFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<TaskFormField, string[]>>;
};

export function createTaskFormState(): TaskFormState {
  return {
    status: "idle",
    message: null,
    fieldErrors: {}
  };
}

export const initialTaskFormState = createTaskFormState();
