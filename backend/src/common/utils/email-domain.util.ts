export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function extractEmailDomain(email: string): string | null {
  const normalized = normalizeEmail(email);
  const parts = normalized.split('@');

  if (parts.length !== 2) {
    return null;
  }

  const domain = parts[1].trim();
  return domain.length > 0 ? domain : null;
}