import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { ImportValidationError, importPipelineWorkbook } from "@/lib/server/import-service";

const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];
const ACCEPTED_MIME_TYPES = new Set([
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream"
]);

export const runtime = "nodejs";

function parseDryRun(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return true;
  }

  return rawValue !== "0";
}

function isAcceptedSpreadsheet(file: File) {
  const lowerName = file.name.toLowerCase();
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
  const hasAcceptedMimeType = file.type === "" || ACCEPTED_MIME_TYPES.has(file.type);

  return hasAcceptedExtension || hasAcceptedMimeType;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  if (!value || typeof value === "string") {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.size === "number" &&
    typeof value.type === "string" &&
    typeof value.arrayBuffer === "function"
  );
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canWrite(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!isUploadedFile(file)) {
      return NextResponse.json({ error: "An Excel workbook is required." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The uploaded workbook is empty." }, { status: 400 });
    }

    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Workbook exceeds the 5 MB upload limit." }, { status: 400 });
    }

    if (!isAcceptedSpreadsheet(file)) {
      return NextResponse.json({ error: "Only .xlsx or .xls workbooks are supported." }, { status: 400 });
    }

    const result = await importPipelineWorkbook(Buffer.from(await file.arrayBuffer()), {
      dryRun: parseDryRun(formData.get("dryRun")),
      importedBy: session.user.email ?? session.user.id,
      fileName: file.name
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ImportValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Workbook could not be processed." }, { status: 500 });
  }
}
