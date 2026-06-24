import { describe, expect, it } from "vitest";
import { buildMarketingSummary, normalizeMarketingFilters } from "@/domain/marketing";

describe("marketing statistics rules", () => {
  it("normalizes month and channel filters", () => {
    expect(normalizeMarketingFilters({ month: " 2026-05 ", channel: " 抖音 " })).toEqual({
      month: "2026-05",
      channel: "抖音"
    });
  });

  it("summarizes channels and redemptions", () => {
    const summary = buildMarketingSummary({
      orders: [
        { channel: "抖音", status: "COMPLETED", totalCents: 10000 },
        { channel: "美团", status: "WAITING_SERVICE", totalCents: 5000 },
        { channel: "抖音", status: "CANCELLED", totalCents: 3000 }
      ],
      redemptions: [
        { channel: "抖音", status: "REDEEMED", amountCents: 2000 },
        { channel: "抖音", status: "PENDING", amountCents: 1000 },
        { channel: "美团", status: "CANCELLED", amountCents: 500 }
      ]
    });

    expect(summary.metrics).toEqual({
      orderCount: 3,
      revenueCents: 15000,
      redeemedCount: 1,
      redeemedAmountCents: 2000,
      pendingRedemptionCount: 1,
      cancelledRedemptionCount: 1
    });
    expect(summary.channelRows).toEqual([
      { channel: "抖音", orderCount: 2, revenueCents: 10000, redeemedCount: 1 },
      { channel: "美团", orderCount: 1, revenueCents: 5000, redeemedCount: 0 }
    ]);
  });
});
