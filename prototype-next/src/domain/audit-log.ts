export type AuditLogFilterInput = {
  date?: string | null;
  actor?: string | null;
  target?: string | null;
};

export type AuditLogFilters = {
  date: string;
  actor: string | null;
  target: string | null;
};

function todayInputValue() {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function normalizeAuditLogFilters(input: AuditLogFilterInput = {}): AuditLogFilters {
  const date = normalizeOptionalText(input.date);
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T00:00:00`).getTime()) ? date : todayInputValue();

  return {
    date: validDate,
    actor: normalizeOptionalText(input.actor),
    target: normalizeOptionalText(input.target)
  };
}

export function auditLogDateRange(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}
