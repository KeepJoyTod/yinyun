import { describe, expect, it } from "vitest";
import { buildAppointmentSlots } from "@/domain/schedule";

describe("service group schedule rules", () => {
  it("builds appointment slots from a date and time window", () => {
    const slots = buildAppointmentSlots({
      brandId: "brand-1",
      storeId: "store-1",
      serviceGroupId: "group-1",
      date: "2026-06-01",
      startTime: "09:00",
      endTime: "10:30",
      slotMinutes: 30,
      capacity: 2
    });

    expect(slots).toHaveLength(3);
    expect(slots.map((slot) => slot.capacity)).toEqual([2, 2, 2]);
    expect(slots[0].startsAt.getHours()).toBe(9);
    expect(slots[0].startsAt.getMinutes()).toBe(0);
    expect(slots[2].startsAt.getHours()).toBe(10);
    expect(slots[2].endsAt.getHours()).toBe(10);
    expect(slots[2].endsAt.getMinutes()).toBe(30);
  });

  it("rejects invalid schedule windows", () => {
    expect(() =>
      buildAppointmentSlots({
        brandId: "brand-1",
        storeId: "store-1",
        serviceGroupId: "group-1",
        date: "2026-06-01",
        startTime: "10:00",
        endTime: "09:00",
        slotMinutes: 30,
        capacity: 1
      })
    ).toThrow("结束时间必须晚于开始时间");
  });
});
