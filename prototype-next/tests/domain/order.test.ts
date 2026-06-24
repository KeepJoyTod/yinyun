import { describe, expect, it } from "vitest";
import { availableOrderActions, buildOrderUpdateDraft, buildOrderVisibleFields, canTransitionOrder, nextOrderStatus, normalizeCancelReason, orderStatusFromLabel } from "@/domain/order";

describe("order status transitions", () => {
  it("allows the normal appointment service flow", () => {
    expect(nextOrderStatus("PENDING_CONFIRM", "CONFIRM")).toBe("WAITING_SERVICE");
    expect(nextOrderStatus("WAITING_SERVICE", "START_SERVICE")).toBe("IN_SERVICE");
    expect(nextOrderStatus("IN_SERVICE", "COMPLETE")).toBe("COMPLETED");
  });

  it("allows cancellation before completion", () => {
    expect(canTransitionOrder("PENDING_CONFIRM", "CANCELLED")).toBe(true);
    expect(canTransitionOrder("WAITING_SERVICE", "CANCELLED")).toBe(true);
    expect(canTransitionOrder("IN_SERVICE", "CANCELLED")).toBe(true);
  });

  it("prevents changing completed or cancelled orders", () => {
    expect(canTransitionOrder("COMPLETED", "CANCELLED")).toBe(false);
    expect(canTransitionOrder("CANCELLED", "WAITING_SERVICE")).toBe(false);
  });

  it("exposes only the actions available for the current status", () => {
    expect(availableOrderActions("PENDING_CONFIRM").map((action) => action.action)).toEqual(["CONFIRM", "CANCEL"]);
    expect(availableOrderActions("WAITING_SERVICE").map((action) => action.action)).toEqual(["START_SERVICE", "CANCEL"]);
    expect(availableOrderActions("IN_SERVICE").map((action) => action.action)).toEqual(["COMPLETE", "CANCEL"]);
    expect(availableOrderActions("COMPLETED")).toEqual([]);
  });

  it("maps Chinese status labels to canonical status values", () => {
    expect(orderStatusFromLabel("待确认")).toBe("PENDING_CONFIRM");
    expect(orderStatusFromLabel("待服务")).toBe("WAITING_SERVICE");
    expect(orderStatusFromLabel("服务中")).toBe("IN_SERVICE");
    expect(orderStatusFromLabel("已完成")).toBe("COMPLETED");
    expect(orderStatusFromLabel("已取消")).toBe("CANCELLED");
  });

  it("requires a cancellation reason", () => {
    expect(() => normalizeCancelReason("  ")).toThrow("请填写取消原因");
    expect(normalizeCancelReason(" 客户临时取消 ")).toBe("客户临时取消");
  });

  it("normalizes order detail updates", () => {
    const draft = buildOrderUpdateDraft({
      scheduledAt: "2026-06-01T10:30",
      staffId: "staff-1",
      remark: "  需要加急修图  "
    });

    expect(draft.scheduledAt?.getFullYear()).toBe(2026);
    expect(draft.staffId).toBe("staff-1");
    expect(draft.remark).toBe("需要加急修图");
    expect(buildOrderUpdateDraft({ staffId: "" })).toEqual({ staffId: null });
  });

  it("builds order visible fields for source, booking method and arrival date filters", () => {
    expect(
      buildOrderVisibleFields({
        source: "DOUYIN",
        bookingMethod: "ONLINE",
        createdAt: new Date("2026-05-30T09:00:00"),
        scheduledAt: new Date("2026-05-31T10:30:00")
      })
    ).toEqual({
      sourceLabel: "抖音",
      bookingMethodLabel: "线上预约",
      createdAtDate: "2026-05-30",
      arrivalAtDate: "2026-05-31"
    });
  });
});
