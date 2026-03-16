export type TaskFormField =
  | "taskCode"
  | "topic"
  | "types"
  | "owner"
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
  suggestedTaskCode: string;
};

export function createTaskFormState(suggestedTaskCode = ""): TaskFormState {
  return {
    status: "idle",
    message: null,
    fieldErrors: {},
    suggestedTaskCode
  };
}

export const initialTaskFormState = createTaskFormState();
