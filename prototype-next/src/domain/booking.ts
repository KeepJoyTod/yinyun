export type SlotCapacityInput = {
  capacity: number;
  bookedCount: number;
  cancelledCount: number;
};

export type SlotAvailability = {
  capacity: number;
  used: number;
  remaining: number;
  isAvailable: boolean;
};

export type BookingSlotRef = {
  storeId: string;
  serviceGroupId: string;
};

export function calculateSlotAvailability(input: SlotCapacityInput): SlotAvailability {
  const capacity = Math.max(0, input.capacity);
  const used = Math.max(0, input.bookedCount - input.cancelledCount);
  const remaining = Math.max(0, capacity - used);

  return {
    capacity,
    used,
    remaining,
    isAvailable: remaining > 0
  };
}

export function reserveSlot(input: SlotCapacityInput): SlotAvailability {
  const availability = calculateSlotAvailability(input);

  if (!availability.isAvailable) {
    throw new Error("预约时段已满");
  }

  return {
    ...availability,
    used: availability.used + 1,
    remaining: availability.remaining - 1,
    isAvailable: availability.remaining - 1 > 0
  };
}

export function filterBookingSlots<T extends BookingSlotRef>(slots: T[], storeId?: string, serviceGroupId?: string): T[] {
  return slots.filter((slot) => {
    const storeMatched = !storeId || slot.storeId === storeId;
    const groupMatched = !serviceGroupId || slot.serviceGroupId === serviceGroupId;
    return storeMatched && groupMatched;
  });
}

export type BookingSlotDateRef = {
  startsAt: string;
};

export type BookingSlotAvailabilityRef = {
  capacity: number;
  bookedCount: number;
};

export function filterSlotsByDate<T extends BookingSlotDateRef>(slots: T[], date?: string): T[] {
  if (!date) {
    return slots;
  }

  return slots.filter((slot) => slot.startsAt.slice(0, 10) === date);
}

export function getFirstAvailableSlotIndex<T extends BookingSlotAvailabilityRef>(slots: T[]): number {
  return slots.findIndex((slot) =>
    calculateSlotAvailability({
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
      cancelledCount: 0
    }).isAvailable
  );
}
