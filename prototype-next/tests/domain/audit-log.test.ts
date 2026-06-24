import { describe, expect, it } from "vitest";
import { normalizeAuditLogFilters } from "@/domain/audit-log";

describe("audit log filters", () => {
  it("normalizes query filters for audit log search", () => {
    expect(
      normalizeAuditLogFilters({
        date: " 2026-05-31 ",
        actor: " 文瑞 ",
        target: " order:YY20260531001 "
      })
    ).toEqual({
      date: "2026-05-31",
      actor: "文瑞",
      target: "order:YY20260531001"
    });
  });

  it("falls back to today's date when date is invalid", () => {
    const result = normalizeAuditLogFilters({ date: "invalid" });
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
