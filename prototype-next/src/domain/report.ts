import type { OrderStatus } from "@/domain/order";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type ReportFilterInput = {
  date?: string | null;
  storeId?: string | null;
  serviceGroupId?: string | null;
};

export type ReportFilters = {
  date: string;
  storeId: string | null;
  serviceGroupId: string | null;
};

export type ReportOrderInput = {
  orderNo: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  serviceGroupName: string;
  totalCents: number;
  items: Array<{
    name: string;
    quantity: number;
    priceCents: number;
  }>;
};

export type ReportSummary = {
  metrics: {
    orderCount: number;
    pendingCount: number;
    completedCount: number;
    cancelledCount: number;
    grossRevenueCents: number;
    paidCents: number;
    unpaidCents: number;
    refundedCents: number;
  };
  serviceGroupRows: Array<{
    name: string;
    orderCount: number;
    revenueCents: number;
  }>;
  productRows: Array<{
    name: string;
    quantity: number;
    revenueCents: number;
  }>;
};

function todayInputValue() {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function normalizeReportFilters(input: ReportFilterInput = {}): ReportFilters {
  const date = normalizeOptionalText(input.date);
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T00:00:00`).getTime()) ? date : todayInputValue();

  return {
    date: validDate,
    storeId: normalizeOptionalText(input.storeId),
    serviceGroupId: normalizeOptionalText(input.serviceGroupId)
  };
}

export function reportDateRange(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

export function buildReportSummary(orders: ReportOrderInput[]): ReportSummary {
  const serviceGroups = new Map<string, { name: string; orderCount: number; revenueCents: number }>();
  const products = new Map<string, { name: string; quantity: number; revenueCents: number }>();
  const metrics: ReportSummary["metrics"] = {
    orderCount: 0,
    pendingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    grossRevenueCents: 0,
    paidCents: 0,
    unpaidCents: 0,
    refundedCents: 0
  };

  for (const order of orders) {
    const isCancelled = order.status === "CANCELLED";
    const revenueCents = isCancelled ? 0 : order.totalCents;

    metrics.orderCount += 1;
    if (order.status === "PENDING_CONFIRM") {
      metrics.pendingCount += 1;
    }
    if (order.status === "COMPLETED") {
      metrics.completedCount += 1;
    }
    if (isCancelled) {
      metrics.cancelledCount += 1;
    } else {
      metrics.grossRevenueCents += order.totalCents;
    }

    if (order.paymentStatus === "PAID") {
      metrics.paidCents += order.totalCents;
    }
    if (order.paymentStatus === "UNPAID") {
      metrics.unpaidCents += order.totalCents;
    }
    if (order.paymentStatus === "REFUNDED") {
      metrics.refundedCents += order.totalCents;
    }

    const groupName = order.serviceGroupName || "未分组";
    const group = serviceGroups.get(groupName) ?? { name: groupName, orderCount: 0, revenueCents: 0 };
    group.orderCount += 1;
    group.revenueCents += revenueCents;
    serviceGroups.set(groupName, group);

    for (const item of order.items) {
      const product = products.get(item.name) ?? { name: item.name, quantity: 0, revenueCents: 0 };
      product.quantity += item.quantity;
      product.revenueCents += isCancelled ? 0 : item.priceCents * item.quantity;
      products.set(item.name, product);
    }
  }

  return {
    metrics,
    serviceGroupRows: [...serviceGroups.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.orderCount - a.orderCount),
    productRows: [...products.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.quantity - a.quantity)
  };
}
