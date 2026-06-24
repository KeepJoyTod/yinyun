import { describe, expect, it } from "vitest";
import { buildCustomerSummary, updateCustomerDraft } from "@/domain/customer";

describe("customer management rules", () => {
  it("normalizes customer updates", () => {
    expect(
      updateCustomerDraft({
        name: "  王小明 ",
        phone: " 13900001111 ",
        remark: " 老客户，优先安排证件照 "
      })
    ).toEqual({
      name: "王小明",
      phone: "13900001111",
      remark: "老客户，优先安排证件照"
    });
  });

  it("rejects empty names and invalid phones", () => {
    expect(() => updateCustomerDraft({ name: " " })).toThrow("请填写客户姓名");
    expect(() => updateCustomerDraft({ phone: "123" })).toThrow("请填写有效手机号");
  });

  it("summarizes customer order history and spending", () => {
    expect(
      buildCustomerSummary([
        { status: "COMPLETED", totalCents: 12000 },
        { status: "WAITING_SERVICE", totalCents: 8800 },
        { status: "CANCELLED", totalCents: 6600 }
      ])
    ).toEqual({
      orderCount: 3,
      completedCount: 1,
      activeCount: 1,
      cancelledCount: 1,
      totalSpentCents: 20800
    });
  });
});
