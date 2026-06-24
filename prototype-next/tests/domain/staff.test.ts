import { describe, expect, it } from "vitest";
import { assertStaffCanBeDeleted, createStaffDraft, updateStaffDraft } from "@/domain/staff";

describe("staff management rules", () => {
  it("normalizes staff input for persistence", () => {
    expect(
      createStaffDraft({
        storeId: " store-1 ",
        name: "  张三  ",
        phone: " 16620010001 ",
        position: " 摄影师 "
      })
    ).toEqual({
      storeId: "store-1",
      name: "张三",
      phone: "16620010001",
      position: "摄影师",
      enabled: true
    });
  });

  it("rejects empty staff names", () => {
    expect(() => createStaffDraft({ name: " " })).toThrow("请填写员工姓名");
  });

  it("keeps unchanged fields out of staff updates", () => {
    expect(updateStaffDraft({ enabled: false })).toEqual({ enabled: false });
    expect(updateStaffDraft({ storeId: "", phone: "", position: "" })).toEqual({
      storeId: null,
      phone: null,
      position: null
    });
  });

  it("prevents deleting staff with existing orders", () => {
    expect(() => assertStaffCanBeDeleted({ orderCount: 1 })).toThrow("员工已有订单，不能删除，请停用");
    expect(() => assertStaffCanBeDeleted({ orderCount: 0 })).not.toThrow();
  });
});
