import { describe, expect, it } from "vitest";
import { buildReportSummary, normalizeReportFilters } from "@/domain/report";

describe("report rules", () => {
  it("normalizes report filters", () => {
    expect(
      normalizeReportFilters({
        date: " 2026-05-31 ",
        storeId: " store-1 ",
        serviceGroupId: " group-1 "
      })
    ).toEqual({
      date: "2026-05-31",
      storeId: "store-1",
      serviceGroupId: "group-1"
    });
  });

  it("builds service and revenue summaries", () => {
    const summary = buildReportSummary([
      {
        orderNo: "YY001",
        status: "PENDING_CONFIRM",
        paymentStatus: "UNPAID",
        serviceGroupName: "证件照",
        totalCents: 2000,
        items: [{ name: "团购预约", quantity: 1, priceCents: 2000 }]
      },
      {
        orderNo: "YY002",
        status: "COMPLETED",
        paymentStatus: "PAID",
        serviceGroupName: "证件照",
        totalCents: 8800,
        items: [{ name: "证件照拍摄", quantity: 1, priceCents: 8800 }]
      },
      {
        orderNo: "YY003",
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
        serviceGroupName: "冲印",
        totalCents: 1200,
        items: [{ name: "冲印", quantity: 1, priceCents: 1200 }]
      }
    ]);

    expect(summary.metrics).toEqual({
      orderCount: 3,
      pendingCount: 1,
      completedCount: 1,
      cancelledCount: 1,
      grossRevenueCents: 10800,
      paidCents: 8800,
      unpaidCents: 2000,
      refundedCents: 1200
    });
    expect(summary.serviceGroupRows).toEqual([
      { name: "证件照", orderCount: 2, revenueCents: 10800 },
      { name: "冲印", orderCount: 1, revenueCents: 0 }
    ]);
    expect(summary.productRows[0]).toEqual({ name: "证件照拍摄", quantity: 1, revenueCents: 8800 });
  });
});
