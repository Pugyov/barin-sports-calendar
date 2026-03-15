export const DEFAULT_PHASE_RULE = "Recurring";

export function splitTypes(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return Array.from(new Set(raw.map((item) => item.trim()).filter(Boolean)));
  }

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export function normalizeStatus(raw: string | null | undefined): string {
  const value = raw?.trim().toLowerCase();

  if (!value) return "planned";
  if (value === "done" || value === "article completed") return "done";
  if (value.includes("progress")) return "in_progress";
  if (value.includes("block")) return "blocked";

  return value.replace(/\s+/g, "_");
}

export function cleanNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
