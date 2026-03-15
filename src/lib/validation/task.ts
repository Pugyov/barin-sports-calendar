import { z } from "zod";

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

export const taskMutationSchema = z
  .object({
    taskCode: z.string().trim().min(1, "Task code is required"),
    topic: z.string().trim().min(1, "Topic is required"),
    types: z.array(z.string().trim().min(1)).default([]),
    phaseRule: maybeString,
    owner: maybeString,
    workLink: maybeString.refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Work link must be a valid URL"),
    status: maybeString,
    notes: maybeString,
    startDate: maybeDateString,
    dueDate: maybeDateString,
    publishDate: maybeDateString,
    rawTypeText: maybeString
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
  type: z.string().trim().optional(),
  status: z.string().trim().optional(),
  owner: z.string().trim().optional(),
  phaseRule: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional()
});

export type TaskMutationInput = z.infer<typeof taskMutationSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
