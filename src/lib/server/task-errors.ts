import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export type TaskFieldErrors = Record<string, string[] | undefined>;

type TaskMutationErrorOptions = {
  status?: number;
  fieldErrors?: TaskFieldErrors;
};

export class TaskMutationError extends Error {
  status: number;
  fieldErrors: TaskFieldErrors;

  constructor(message: string, options: TaskMutationErrorOptions = {}) {
    super(message);
    this.name = "TaskMutationError";
    this.status = options.status ?? 400;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

export function taskNotFoundError() {
  return new TaskMutationError("Task not found.", { status: 404 });
}

export function invalidTaskTypeError() {
  return new TaskMutationError("Task type is invalid.", { status: 400 });
}

export function invalidTaskFiltersError() {
  return new TaskMutationError("Task filters are invalid.", { status: 400 });
}

export function normalizeTaskMutationError(error: unknown): TaskMutationError {
  if (error instanceof TaskMutationError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new TaskMutationError("Please correct the highlighted fields.", {
      status: 400,
      fieldErrors: error.flatten().fieldErrors
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return taskNotFoundError();
    }

    if (error.code === "P2003") {
      return invalidTaskTypeError();
    }
  }

  return new TaskMutationError("Task request could not be processed.", { status: 500 });
}
