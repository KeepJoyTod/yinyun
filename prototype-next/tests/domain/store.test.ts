import { describe, expect, it } from "vitest";
import { assertStoreCanBeDeleted, buildStoreBusinessMetrics, createStoreDraft, updateStoreDraft } from "@/domain/store";

describe("store management rules", () => {
  it("normalizes store input for persistence", () => {
    expect(
      createStoreDraft({
        name: "  威海智慧谷店  ",
        phone: " 16620013461 ",
        address: " 威海智慧谷商业区 "
      })
    ).toEqual({
      name: "威海智慧谷店",
      phone: "16620013461",
      address: "威海智慧谷商业区",
      enabled: true
    });
  });

  it("rejects empty store names", () => {
    expect(() => createStoreDraft({ name: " " })).toThrow("请填写门店名称");
  });

  it("keeps unchanged fields out of store updates", () => {
    expect(updateStoreDraft({ enabled: false })).toEqual({ enabled: false });
    expect(updateStoreDraft({ phone: "" })).toEqual({ phone: null });
  });

  it("prevents deleting stores with existing orders", () => {
    expect(() => assertStoreCanBeDeleted({ orderCount: 1 })).toThrow("门店已有订单，不能删除");
    expect(() => assertStoreCanBeDeleted({ orderCount: 0 })).not.toThrow();
  });

  it("summarizes store card business metrics", () => {
    expect(
      buildStoreBusinessMetrics([
        { status: "WAITING_SERVICE", scheduledAt: new Date("2026-05-31T10:00:00") },
        { status: "COMPLETED", scheduledAt: new Date("2026-05-20T10:00:00") },
        { status: "CANCELLED", scheduledAt: new Date("2026-04-30T10:00:00") }
      ], "2026-05")
    ).toEqual({
      monthOrderCount: 2,
      waitingServiceCount: 1
    });
  });
});
