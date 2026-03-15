import { redirect } from "next/navigation";
import { ImportForm } from "@/components/app/import-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthSession } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { listRecentImports } from "@/lib/server/import-service";

type ImportBatchSummary = Awaited<ReturnType<typeof listRecentImports>>[number];

export default async function ImportPage() {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const writable = canWrite(session.user.role);
  const imports = await listRecentImports();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Excel Import</h1>

      {writable ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Workbook</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportForm />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            You have read-only access. Import is limited to admin/editor roles.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Import Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {imports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No imports yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Skipped</TableHead>
                  <TableHead>Errors</TableHead>
                  <TableHead>At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((batch: ImportBatchSummary) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.fileName}</TableCell>
                    <TableCell>
                      <Badge variant={batch.dryRun ? "secondary" : "default"}>{batch.dryRun ? "Dry-run" : "Commit"}</Badge>
                    </TableCell>
                    <TableCell>{batch.createdCount}</TableCell>
                    <TableCell>{batch.updatedCount}</TableCell>
                    <TableCell>{batch.skippedCount}</TableCell>
                    <TableCell>{batch.errorCount}</TableCell>
                    <TableCell>{batch.createdAt.toISOString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
