import { z } from "zod";
import { TASK_STATUS_VALUES } from "@/lib/task-normalization";

function emptyQueryValueToUndefined(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

const maybeDateString = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) return null;
    return value;
  });

const maybeString = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) return null;
    return value;
  });

const taskTypeIdSchema = z
  .string()
  .trim()
  .min(1, "Task type is required")
  .refine((value) => /^\d+$/.test(value) && Number(value) > 0, "Task type is invalid");

export const taskMutationSchema = z
  .object({
    topic: z.string().trim().min(1, "Topic is required"),
    taskTypeId: taskTypeIdSchema,
    phaseRule: maybeString,
    ownerUserId: maybeString,
    workLink: maybeString.refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Work link must be a valid URL"),
    status: z.enum(TASK_STATUS_VALUES, {
      error: "Status is required"
    }),
    notes: maybeString,
    startDate: maybeDateString,
    dueDate: maybeDateString,
    publishDate: maybeDateString
  })
  .superRefine((value, ctx) => {
    const start = value.startDate ? new Date(value.startDate) : null;
    const due = value.dueDate ? new Date(value.dueDate) : null;
    const publish = value.publishDate ? new Date(value.publishDate) : null;

    if (start && due && start > due) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date cannot be after due date",
        path: ["startDate"]
      });
    }

    if (due && publish && due > publish) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be after publish date",
        path: ["dueDate"]
      });
    }
  });

export const taskFilterSchema = z.object({
  q: z.string().trim().optional(),
  taskId: z.string().trim().optional(),
  taskTypeId: z.preprocess(emptyQueryValueToUndefined, taskTypeIdSchema.optional()),
  status: z.preprocess(emptyQueryValueToUndefined, z.enum([...TASK_STATUS_VALUES, "open"]).optional()),
  ownerUserId: z.preprocess(emptyQueryValueToUndefined, z.string().trim().optional()),
  ownerState: z.preprocess(emptyQueryValueToUndefined, z.enum(["assigned", "unassigned"]).optional()),
  dateField: z.preprocess(emptyQueryValueToUndefined, z.enum(["start", "due", "publish"]).optional()),
  phaseRule: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional()
});

export type TaskMutationInput = z.infer<typeof taskMutationSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
