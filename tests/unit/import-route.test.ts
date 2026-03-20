import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthSession, importPipelineWorkbook, ImportValidationError } = vi.hoisted(() => {
  class ImportValidationError extends Error {}

  return {
    getAuthSession: vi.fn(),
    importPipelineWorkbook: vi.fn(),
    ImportValidationError
  };
});

vi.mock("@/lib/auth", () => ({
  getAuthSession
}));

vi.mock("@/lib/server/import-service", () => ({
  ImportValidationError,
  importPipelineWorkbook
}));

import { POST } from "@/app/api/import/excel/route";

function buildRequest(file?: File, dryRun = "1") {
  const formData = new FormData();

  if (file) {
    formData.set("file", file);
  }

  formData.set("dryRun", dryRun);

  return new Request("http://localhost/api/import/excel", {
    method: "POST",
    body: formData
  });
}

describe("import route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated uploads", async () => {
    getAuthSession.mockResolvedValue(null);

    const response = await POST(buildRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("rejects unsupported file types", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "editor-1",
        email: "editor@barinsports.com",
        role: "editor"
      }
    });

    const response = await POST(buildRequest(new File(["hello"], "notes.txt", { type: "text/plain" })));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Only .xlsx or .xls workbooks are supported." });
  });

  it("rejects files above the size limit", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "editor-1",
        email: "editor@barinsports.com",
        role: "editor"
      }
    });

    const oversizedFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "pipeline.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const response = await POST(buildRequest(oversizedFile));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Workbook exceeds the 5 MB upload limit." });
  });

  it("passes a valid workbook to the import service", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "editor-1",
        email: "editor@barinsports.com",
        role: "editor"
      }
    });
    importPipelineWorkbook.mockResolvedValue({
      batchId: "batch-1",
      dryRun: false,
      createdCount: 1,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: []
    });

    const workbook = new File([new Uint8Array([1, 2, 3])], "pipeline.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const response = await POST(buildRequest(workbook, "0"));

    expect(response.status).toBe(200);
    const [buffer, options] = importPipelineWorkbook.mock.calls[0] ?? [];

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(options).toEqual({
      dryRun: false,
      importedBy: "editor@barinsports.com",
      fileName: expect.any(String)
    });
    await expect(response.json()).resolves.toEqual({
      batchId: "batch-1",
      dryRun: false,
      createdCount: 1,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: []
    });
  });

  it("returns a safe message for workbook validation failures", async () => {
    getAuthSession.mockResolvedValue({
      user: {
        id: "editor-1",
        email: "editor@barinsports.com",
        role: "editor"
      }
    });
    importPipelineWorkbook.mockRejectedValue(new ImportValidationError('Sheet "Pipeline(All)" was not found'));

    const workbook = new File([new Uint8Array([1, 2, 3])], "pipeline.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const response = await POST(buildRequest(workbook));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Sheet "Pipeline(All)" was not found' });
  });
});
