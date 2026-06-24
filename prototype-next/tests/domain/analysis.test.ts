import { describe, expect, it } from "vitest";
import { buildCustomerAnalysis, buildProductAnalysis, buildReviewSummary } from "@/domain/analysis";

describe("analysis rules", () => {
  it("calculates repeat customers and average order value", () => {
    expect(
      buildCustomerAnalysis([
        { customerId: "c1", status: "COMPLETED", totalCents: 10000 },
        { customerId: "c1", status: "WAITING_SERVICE", totalCents: 20000 },
        { customerId: "c2", status: "CANCELLED", totalCents: 30000 }
      ])
    ).toEqual({
      customerCount: 2,
      repeatCustomerCount: 1,
      activeCustomerCount: 1,
      cancelledCustomerCount: 1,
      averageOrderValueCents: 15000
    });
  });

  it("builds product revenue rankings", () => {
    expect(
      buildProductAnalysis([
        {
          status: "COMPLETED",
          items: [
            { name: "证件照", quantity: 1, priceCents: 8800 },
            { name: "冲印", quantity: 2, priceCents: 1200 }
          ]
        },
        {
          status: "CANCELLED",
          items: [{ name: "证件照", quantity: 1, priceCents: 8800 }]
        }
      ])
    ).toEqual([
      { name: "证件照", quantity: 1, revenueCents: 8800 },
      { name: "冲印", quantity: 2, revenueCents: 2400 }
    ]);
  });

  it("summarizes customer reviews", () => {
    expect(buildReviewSummary([{ rating: 5 }, { rating: 4 }, { rating: 3 }])).toEqual({
      reviewCount: 3,
      averageRating: 4
    });
  });
});
