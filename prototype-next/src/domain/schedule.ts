export type BuildAppointmentSlotsInput = {
  brandId: string;
  storeId: string;
  serviceGroupId: string;
  date: string;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  capacity: number;
};

export type AppointmentSlotDraft = {
  brandId: string;
  storeId: string;
  serviceGroupId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
};

function parseLocalDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (!year || !month || !day || hours === undefined || minutes === undefined) {
    throw new Error("日期或时间格式错误");
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function buildAppointmentSlots(input: BuildAppointmentSlotsInput): AppointmentSlotDraft[] {
  if (input.slotMinutes < 5) {
    throw new Error("档期时长不能少于 5 分钟");
  }

  if (input.capacity < 1) {
    throw new Error("档期容量不能小于 1");
  }

  const start = parseLocalDateTime(input.date, input.startTime);
  const end = parseLocalDateTime(input.date, input.endTime);

  if (end <= start) {
    throw new Error("结束时间必须晚于开始时间");
  }

  const slots: AppointmentSlotDraft[] = [];
  const slotMs = input.slotMinutes * 60 * 1000;

  for (let startsAt = start; startsAt.getTime() + slotMs <= end.getTime(); startsAt = new Date(startsAt.getTime() + slotMs)) {
    slots.push({
      brandId: input.brandId,
      storeId: input.storeId,
      serviceGroupId: input.serviceGroupId,
      startsAt,
      endsAt: new Date(startsAt.getTime() + slotMs),
      capacity: input.capacity
    });
  }

  if (!slots.length) {
    throw new Error("时间范围不足以生成档期");
  }

  return slots;
}
