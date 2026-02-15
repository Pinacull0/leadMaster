export function normalizeText(value: unknown, maxLen: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > maxLen) return null;
  return text;
}

export function normalizeOptionalText(value: unknown, maxLen: number) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > maxLen) return null;
  return text;
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 190) return null;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return ok ? email : null;
}

export function normalizeRole(value: unknown) {
  return value === "ADMIN" || value === "USER" ? value : null;
}

export function normalizeProjectStatus(value: unknown) {
  return value === "PLANNED" || value === "ACTIVE" || value === "ON_HOLD" || value === "DONE"
    ? value
    : null;
}

export function normalizeTaskStatus(value: unknown) {
  return value === "TODO" || value === "IN_PROGRESS" || value === "REVIEW" || value === "DONE"
    ? value
    : null;
}

export function normalizeTaskPriority(value: unknown) {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH" || value === "URGENT"
    ? value
    : null;
}

export function normalizeLeadStatus(value: unknown) {
  return value === "NEW" || value === "QUALIFIED" || value === "WON" || value === "LOST" ? value : null;
}

export function normalizeRequirementStatus(value: unknown) {
  return value === "OPEN" || value === "IN_PROGRESS" || value === "DONE" ? value : null;
}

export function normalizeDate(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const date = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

export function normalizePositiveInt(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function validateStrongPassword(value: unknown) {
  if (typeof value !== "string") return null;
  const password = value.trim();
  if (password.length < 12 || password.length > 128) return null;
  if (!/[a-z]/.test(password)) return null;
  if (!/[A-Z]/.test(password)) return null;
  if (!/[0-9]/.test(password)) return null;
  if (!/[^A-Za-z0-9]/.test(password)) return null;
  return password;
}
