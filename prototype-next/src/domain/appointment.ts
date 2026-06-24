import type { OrderStatus } from "@/domain/order";

export type AppointmentProductInput = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export type AppointmentDraftInput = {
  brandId: string;
  storeId: string;
  serviceGroupId: string;
  slotId: string;
  customer: {
    name: string;
    phone: string;
  };
  scheduledAt: Date;
  products: AppointmentProductInput[];
  remark?: string;
};

export type AppointmentDraft = {
  orderNo: string;
  brandId: string;
  storeId: string;
  serviceGroupId: string;
  slotId: string;
  customer: AppointmentDraftInput["customer"];
  scheduledAt: Date;
  status: OrderStatus;
  paymentStatus: "UNPAID";
  totalCents: number;
  remark?: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    priceCents: number;
  }>;
};

export function createAppointmentDraft(input: AppointmentDraftInput, now = new Date()): AppointmentDraft {
  if (!input.products.length) {
    throw new Error("至少选择一个预约产品");
  }

  const items = input.products.map((product) => ({
    productId: product.id,
    name: product.name,
    quantity: product.quantity,
    priceCents: product.priceCents
  }));

  return {
    orderNo: buildOrderNo(now),
    brandId: input.brandId,
    storeId: input.storeId,
    serviceGroupId: input.serviceGroupId,
    slotId: input.slotId,
    customer: input.customer,
    scheduledAt: input.scheduledAt,
    status: "PENDING_CONFIRM",
    paymentStatus: "UNPAID",
    totalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    remark: input.remark,
    items
  };
}

function buildOrderNo(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    "YY",
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join("");
}
