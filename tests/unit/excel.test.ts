import { describe, expect, it } from "vitest";
import { excelSerialToDate, parseSpreadsheetDate, toDateOnlyIso } from "@/lib/excel";

describe("excel helpers", () => {
  it("converts excel serial to date", () => {
    const date = excelSerialToDate(46059);
    expect(toDateOnlyIso(date)).toBe("2026-02-06");
  });

  it("parses numeric spreadsheet date", () => {
    const date = parseSpreadsheetDate(46066);
    expect(date).not.toBeNull();
    expect(toDateOnlyIso(date)).toBe("2026-02-13");
  });

  it("parses string spreadsheet date", () => {
    const date = parseSpreadsheetDate("2026-03-05");
    expect(toDateOnlyIso(date)).toBe("2026-03-05");
  });
});
