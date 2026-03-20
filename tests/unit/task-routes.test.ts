import { ZodError } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskMutationError } from "@/lib/server/task-errors";

const { getAuthSession, createTask, deleteTask, listTasks, updateTask } = vi.hoisted(() => ({
  getAuthSession: vi.fn(),
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  listTasks: vi.fn(),
  updateTask: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  getAuthSession
}));

vi.mock("@/lib/server/task-service", () => ({
  createTask,
  deleteTask,
  listTasks,
  updateTask
}));

import { DELETE, PATCH } from "@/app/api/tasks/[id]/route";
import { GET, POST } from "@/app/api/tasks/route";

describe("task routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated task creation", async () => {
    getAuthSession.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost/api/tasks", { method: "POST", body: JSON.stringify({}) }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("rejects viewer task creation", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "viewer-1",
        role: "viewer"
      }
    });

    const response = await POST(new Request("http://localhost/api/tasks", { method: "POST", body: JSON.stringify({}) }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("normalizes invalid task payload errors", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "editor-1",
        role: "editor"
      }
    });
    createTask.mockRejectedValue(
      new TaskMutationError("Please correct the highlighted fields.", {
        status: 400,
        fieldErrors: {
          taskTypeId: ["Task type is invalid"]
        }
      })
    );

    const response = await POST(new Request("http://localhost/api/tasks", { method: "POST", body: JSON.stringify({ topic: "Task" }) }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please correct the highlighted fields.",
      fieldErrors: {
        taskTypeId: ["Task type is invalid"]
      }
    });
  });

  it("returns a safe 400 when task filters are invalid", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "viewer-1",
        role: "viewer"
      }
    });
    listTasks.mockRejectedValue(new ZodError([]));

    const response = await GET(new Request("http://localhost/api/tasks?taskTypeId=bad"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Task filters are invalid." });
  });

  it("returns 404 for updates to missing tasks", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "editor-1",
        role: "editor"
      }
    });
    updateTask.mockRejectedValue(new TaskMutationError("Task not found.", { status: 404 }));

    const response = await PATCH(new Request("http://localhost/api/tasks/task-1", { method: "PATCH", body: JSON.stringify({}) }), {
      params: Promise.resolve({ id: "task-1" })
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Task not found.",
      fieldErrors: {}
    });
  });

  it("returns 401 for unauthenticated task deletion", async () => {
    getAuthSession.mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost/api/tasks/task-1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "task-1" })
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 204 for successful task deletion", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "editor-1",
        role: "editor"
      }
    });
    deleteTask.mockResolvedValue(undefined);

    const response = await DELETE(new Request("http://localhost/api/tasks/task-1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "task-1" })
    });

    expect(response.status).toBe(204);
  });
});
