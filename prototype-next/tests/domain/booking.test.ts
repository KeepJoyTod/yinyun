import { describe, expect, it } from "vitest";
import { calculateSlotAvailability, filterBookingSlots, filterSlotsByDate, getFirstAvailableSlotIndex, reserveSlot } from "@/domain/booking";

describe("booking slot capacity", () => {
  it("reports remaining capacity for a slot", () => {
    const result = calculateSlotAvailability({
      capacity: 3,
      bookedCount: 1,
      cancelledCount: 0
    });

    expect(result).toEqual({
      capacity: 3,
      used: 1,
      remaining: 2,
      isAvailable: true
    });
  });

  it("does not count cancelled orders against capacity", () => {
    const result = calculateSlotAvailability({
      capacity: 2,
      bookedCount: 2,
      cancelledCount: 1
    });

    expect(result.remaining).toBe(1);
    expect(result.isAvailable).toBe(true);
  });

  it("rejects reservation when the slot is full", () => {
    expect(() =>
      reserveSlot({
        capacity: 2,
        bookedCount: 2,
        cancelledCount: 0
      })
    ).toThrow("预约时段已满");
  });


  it("filters slots by local date", () => {
    const slots = [
      { id: "a", startsAt: "2026-06-01T09:00:00.000Z" },
      { id: "b", startsAt: "2026-06-02T09:00:00.000Z" }
    ];

    expect(filterSlotsByDate(slots, "2026-06-01").map((slot) => slot.id)).toEqual(["a"]);
    expect(filterSlotsByDate(slots, "").map((slot) => slot.id)).toEqual(["a", "b"]);
  });

  it("selects the first available slot and ignores full slots", () => {
    const slots = [
      { id: "full", capacity: 1, bookedCount: 1 },
      { id: "available", capacity: 2, bookedCount: 1 }
    ];

    expect(getFirstAvailableSlotIndex(slots)).toBe(1);
    expect(getFirstAvailableSlotIndex([{ id: "full", capacity: 1, bookedCount: 1 }])).toBe(-1);
  });
  it("filters slots by store and service group", () => {
    const slots = [
      { id: "a", storeId: "store-1", serviceGroupId: "group-1" },
      { id: "b", storeId: "store-1", serviceGroupId: "group-2" },
      { id: "c", storeId: "store-2", serviceGroupId: "group-1" }
    ];

    expect(filterBookingSlots(slots, "store-1", "group-1").map((slot) => slot.id)).toEqual(["a"]);
    expect(filterBookingSlots(slots, "store-1", "").map((slot) => slot.id)).toEqual(["a", "b"]);
  });
});
