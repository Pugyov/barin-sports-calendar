export function getUserDisplayName(name: string | null | undefined, email: string | null | undefined): string {
  const trimmedName = name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  return email?.trim() || "Unknown user";
}
