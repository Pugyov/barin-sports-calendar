const EXCEL_EPOCH_IN_UTC = Date.UTC(1899, 11, 30);
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function excelSerialToDate(serial: number): Date {
  return new Date(EXCEL_EPOCH_IN_UTC + serial * DAY_IN_MS);
}

function toUtcDateOnly(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

export function parseSpreadsheetDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toUtcDateOnly(value.getFullYear(), value.getMonth(), value.getDate());
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

    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (isoDateMatch) {
      return toUtcDateOnly(Number(isoDateMatch[1]), Number(isoDateMatch[2]) - 1, Number(isoDateMatch[3]));
    }

    const slashDateMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/.exec(trimmed);
    if (slashDateMatch) {
      const year = slashDateMatch[3].length === 2 ? 2000 + Number(slashDateMatch[3]) : Number(slashDateMatch[3]);
      return toUtcDateOnly(year, Number(slashDateMatch[2]) - 1, Number(slashDateMatch[1]));
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
