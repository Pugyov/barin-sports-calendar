"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImportResult = {
  batchId: string;
  dryRun: boolean;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{ rowNumber: number; taskCode: string | null; message: string }>;
};

export function ImportForm() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dryRun, setDryRun] = useState(true);

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await fetch("/api/import/excel", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Import failed");
      setIsLoading(false);
      return;
    }

    const payload = (await response.json()) as ImportResult;
    setResult(payload);
    setIsLoading(false);
  }

  return (
    <div className="space-y-4">
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input type="file" name="file" accept=".xlsx,.xls" required />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="dryRun"
            checked={dryRun}
            onCheckedChange={(checked) => {
              setDryRun(Boolean(checked));
            }}
          />
          <Label htmlFor="dryRun">Dry-run only (validate and preview, no DB writes)</Label>
          <input type="hidden" name="dryRun" value={dryRun ? "1" : "0"} />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Run Import"}
        </Button>
      </form>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Import failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {result ? (
        <Alert>
          <AlertTitle>Import result</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
            Batch: <span className="font-mono">{result.batchId}</span>
            </p>
            {result.dryRun ? <p className="font-medium">Dry-run mode: no database writes were made.</p> : null}
            <p>
              Created: {result.createdCount} | Updated: {result.updatedCount} | Skipped: {result.skippedCount} | Errors: {result.errorCount}
            </p>
            {result.errors.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4">
                {result.errors.slice(0, 10).map((err, index) => (
                  <li key={`${err.rowNumber}-${index}`}>
                    Row {err.rowNumber}
                    {err.taskCode ? ` (${err.taskCode})` : ""}: {err.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
