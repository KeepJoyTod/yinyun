import { describe, expect, it } from "vitest";
import { createAppointmentDraft } from "@/domain/appointment";

describe("appointment draft creation", () => {
  it("creates an order draft with total amount and pending status", () => {
    const draft = createAppointmentDraft({
      brandId: "brand_1",
      storeId: "store_1",
      serviceGroupId: "group_1",
      slotId: "slot_1",
      customer: { name: "张三", phone: "13800000000" },
      scheduledAt: new Date("2026-06-01T10:00:00+08:00"),
      products: [
        { id: "product_1", name: "证件照预约", priceCents: 2000, quantity: 1 },
        { id: "product_2", name: "加急修图", priceCents: 3000, quantity: 2 }
      ],
      remark: "需要电子版"
    });

    expect(draft.orderNo).toMatch(/^YY\d{14}$/);
    expect(draft.status).toBe("PENDING_CONFIRM");
    expect(draft.paymentStatus).toBe("UNPAID");
    expect(draft.totalCents).toBe(8000);
    expect(draft.items).toHaveLength(2);
  });

  it("rejects empty product selections", () => {
    expect(() =>
      createAppointmentDraft({
        brandId: "brand_1",
        storeId: "store_1",
        serviceGroupId: "group_1",
        slotId: "slot_1",
        customer: { name: "张三", phone: "13800000000" },
        scheduledAt: new Date("2026-06-01T10:00:00+08:00"),
        products: []
      })
    ).toThrow("至少选择一个预约产品");
  });
});
