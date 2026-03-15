const EXCEL_EPOCH_IN_UTC = Date.UTC(1899, 11, 30);
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function excelSerialToDate(serial: number): Date {
  return new Date(EXCEL_EPOCH_IN_UTC + serial * DAY_IN_MS);
}

export function parseSpreadsheetDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return excelSerialToDate(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return excelSerialToDate(numeric);
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

export function toDateOnlyIso(value: Date | null | undefined): string | null {
  if (!value) return null;

  const y = value.getUTCFullYear();
  const m = `${value.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${value.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
