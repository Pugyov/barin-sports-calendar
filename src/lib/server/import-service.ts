import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { parseSpreadsheetDate, toDateOnlyIso } from "@/lib/excel";
import { splitTypes } from "@/lib/task-normalization";
import { upsertTaskByCode } from "@/lib/server/task-service";

const PIPELINE_SHEET_NAME = "Pipeline(All)";

const REQUIRED_HEADERS = [
  "Topic",
  "Type",
  "Start Date",
  "Delivery Due",
  "Publish Date",
  "Phase/Rule",
  "Task ID",
  "Owner",
  "Work Link",
  "Status",
  "Notes"
] as const;

type PipelineRow = Record<string, unknown>;

type ImportOptions = {
  dryRun: boolean;
  importedBy: string | null;
  fileName: string;
};

export type ImportResult = {
  batchId: string;
  dryRun: boolean;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{ rowNumber: number; taskCode: string | null; message: string }>;
};

function readWorkbook(buffer: Buffer): PipelineRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: true });
  const worksheet = workbook.Sheets[PIPELINE_SHEET_NAME];

  if (!worksheet) {
    throw new Error(`Sheet \"${PIPELINE_SHEET_NAME}\" was not found`);
  }

  const headers = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, range: 0, raw: false })[0] ?? [];
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  return XLSX.utils.sheet_to_json<PipelineRow>(worksheet, {
    defval: "",
    raw: true
  });
}

function mapRow(row: PipelineRow) {
  const taskCode = String(row["Task ID"] ?? "").trim();
  const topic = String(row["Topic"] ?? "").trim();

  const rawTypeText = String(row["Type"] ?? "").trim();
  const types = splitTypes(rawTypeText);

  return {
    taskCode,
    topic,
    types,
    rawTypeText,
    phaseRule: String(row["Phase/Rule"] ?? "").trim() || null,
    owner: String(row["Owner"] ?? "").trim() || null,
    workLink: String(row["Work Link"] ?? "").trim() || null,
    status: String(row["Status"] ?? "").trim() || null,
    notes: String(row["Notes"] ?? "").trim() || null,
    startDate: toDateOnlyIso(parseSpreadsheetDate(row["Start Date"])),
    dueDate: toDateOnlyIso(parseSpreadsheetDate(row["Delivery Due"])),
    publishDate: toDateOnlyIso(parseSpreadsheetDate(row["Publish Date"]))
  };
}

export async function importPipelineWorkbook(buffer: Buffer, options: ImportOptions): Promise<ImportResult> {
  const rows = readWorkbook(buffer);

  const batch = await prisma.importBatch.create({
    data: {
      fileName: options.fileName,
      importedBy: options.importedBy,
      dryRun: options.dryRun
    }
  });

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ rowNumber: number; taskCode: string | null; message: string }> = [];

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 2;
    const mapped = mapRow(rows[index]);

    if (!mapped.taskCode && !mapped.topic) {
      skippedCount += 1;
      continue;
    }

    if (!mapped.taskCode) {
      errors.push({ rowNumber, taskCode: null, message: "Task ID is required" });
      continue;
    }

    if (!mapped.topic) {
      errors.push({ rowNumber, taskCode: mapped.taskCode, message: "Topic is required" });
      continue;
    }

    try {
      if (options.dryRun) {
        const existing = await prisma.task.findUnique({
          where: { taskCode: mapped.taskCode },
          select: { id: true }
        });

        if (existing) {
          updatedCount += 1;
        } else {
          createdCount += 1;
        }
        continue;
      }

      const result = await upsertTaskByCode(mapped);

      if (result.action === "created") createdCount += 1;
      if (result.action === "updated") updatedCount += 1;

      await prisma.importBatchTask.create({
        data: {
          importBatchId: batch.id,
          taskId: result.task.id,
          action: result.action
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown import error";
      errors.push({ rowNumber, taskCode: mapped.taskCode, message });
    }
  }

  if (errors.length > 0) {
    await prisma.importRowError.createMany({
      data: errors.map((err) => ({
        importBatchId: batch.id,
        rowNumber: err.rowNumber,
        taskCode: err.taskCode,
        message: err.message
      }))
    });
  }

  await prisma.importBatch.update({
    where: { id: batch.id },
    data: {
      createdCount,
      updatedCount,
      skippedCount,
      errorCount: errors.length
    }
  });

  return {
    batchId: batch.id,
    dryRun: options.dryRun,
    createdCount,
    updatedCount,
    skippedCount,
    errorCount: errors.length,
    errors
  };
}

export async function listRecentImports(limit = 10) {
  return prisma.importBatch.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      rowErrors: {
        take: 5,
        orderBy: { rowNumber: "asc" }
      }
    }
  });
}
