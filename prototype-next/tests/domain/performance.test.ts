import { describe, expect, it } from "vitest";
import { buildPerformanceSummary, normalizePerformanceFilters } from "@/domain/performance";

describe("performance report rules", () => {
  it("normalizes month filters", () => {
    expect(normalizePerformanceFilters({ month: " 2026-05 ", storeId: " store-1 ", staffId: " staff-1 " })).toEqual({
      month: "2026-05",
      storeId: "store-1",
      staffId: "staff-1"
    });
  });

  it("summarizes staff and store performance", () => {
    const summary = buildPerformanceSummary([
      { storeName: "威海店", staffName: "张三", status: "COMPLETED", totalCents: 10000 },
      { storeName: "威海店", staffName: "张三", status: "WAITING_SERVICE", totalCents: 5000 },
      { storeName: "滨州店", staffName: "李四", status: "CANCELLED", totalCents: 3000 }
    ]);

    expect(summary.staffRows).toEqual([
      { name: "张三", orderCount: 2, completedCount: 1, revenueCents: 15000 },
      { name: "李四", orderCount: 1, completedCount: 0, revenueCents: 0 }
    ]);
    expect(summary.storeRows).toEqual([
      { name: "威海店", orderCount: 2, completedCount: 1, revenueCents: 15000 },
      { name: "滨州店", orderCount: 1, completedCount: 0, revenueCents: 0 }
    ]);
  });
});
