import { describe, expect, it } from "vitest";
import { buildAppointmentOverview, buildDashboardSummary } from "@/domain/dashboard";

describe("dashboard summary", () => {
  it("counts filtered orders and excludes cancelled revenue", () => {
    const summary = buildDashboardSummary([
      { status: "PENDING_CONFIRM", totalCents: 2000 },
      { status: "WAITING_SERVICE", totalCents: 8800 },
      { status: "IN_SERVICE", totalCents: 12000 },
      { status: "COMPLETED", totalCents: 9900 },
      { status: "CANCELLED", totalCents: 6600 }
    ]);

    expect(summary).toEqual({
      totalCount: 5,
      pendingCount: 1,
      waitingCount: 1,
      inServiceCount: 1,
      completedCount: 1,
      cancelledCount: 1,
      revenueCents: 32700
    });
  });

  it("builds appointment overview for status, workstation slots and trend", () => {
    const overview = buildAppointmentOverview([
      { status: "PENDING_CONFIRM", startsAt: new Date("2026-05-31T10:00:00"), storeName: "威海店" },
      { status: "WAITING_SERVICE", startsAt: new Date("2026-05-31T10:30:00"), storeName: "威海店" },
      { status: "COMPLETED", startsAt: new Date("2026-06-01T11:00:00"), storeName: "滨州店" }
    ]);

    expect(overview.statusRows).toEqual([
      ["待确认", "1 单"],
      ["待服务", "1 单"],
      ["服务中", "0 单"],
      ["已完成", "1 单"],
      ["已取消", "0 单"]
    ]);
    expect(overview.workstationRows).toEqual([
      ["威海店", "2 个预约时段"],
      ["滨州店", "1 个预约时段"]
    ]);
    expect(overview.trendRows).toEqual([
      ["2026-05-31", "2 单"],
      ["2026-06-01", "1 单"]
    ]);
  });
});
