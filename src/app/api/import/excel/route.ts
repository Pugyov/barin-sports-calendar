import { NextResponse } from "next/server";
import { canWrite } from "@/lib/roles";
import { getAuthSession } from "@/lib/auth";
import { importPipelineWorkbook } from "@/lib/server/import-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
  }

  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const dryRun = formData.get("dryRun") === "1";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importPipelineWorkbook(buffer, {
      dryRun,
      importedBy: session.user.email ?? null,
      fileName: file.name
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
