import type { OrderStatus } from "@/domain/order";

export type PerformanceFilterInput = {
  month?: string | null;
  storeId?: string | null;
  staffId?: string | null;
};

export type PerformanceFilters = {
  month: string;
  storeId: string | null;
  staffId: string | null;
};

export type PerformanceOrderInput = {
  storeName: string;
  staffName: string;
  status: OrderStatus;
  totalCents: number;
};

export type PerformanceRow = {
  name: string;
  orderCount: number;
  completedCount: number;
  revenueCents: number;
};

function currentMonthValue() {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function normalizePerformanceFilters(input: PerformanceFilterInput = {}): PerformanceFilters {
  const month = normalizeOptionalText(input.month);
  const validMonth = month && /^\d{4}-\d{2}$/.test(month) && !Number.isNaN(new Date(`${month}-01T00:00:00`).getTime()) ? month : currentMonthValue();

  return {
    month: validMonth,
    storeId: normalizeOptionalText(input.storeId),
    staffId: normalizeOptionalText(input.staffId)
  };
}

export function performanceMonthRange(month: string) {
  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);
  return { start, end };
}

function addRow(rows: Map<string, PerformanceRow>, name: string, order: PerformanceOrderInput) {
  const current = rows.get(name) ?? { name, orderCount: 0, completedCount: 0, revenueCents: 0 };
  current.orderCount += 1;
  if (order.status === "COMPLETED") {
    current.completedCount += 1;
  }
  if (order.status !== "CANCELLED") {
    current.revenueCents += order.totalCents;
  }
  rows.set(name, current);
}

function sortRows(rows: Map<string, PerformanceRow>) {
  return [...rows.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.completedCount - a.completedCount || b.orderCount - a.orderCount);
}

export function buildPerformanceSummary(orders: PerformanceOrderInput[]) {
  const staff = new Map<string, PerformanceRow>();
  const stores = new Map<string, PerformanceRow>();

  for (const order of orders) {
    addRow(staff, order.staffName || "未分配员工", order);
    addRow(stores, order.storeName || "未绑定门店", order);
  }

  return {
    staffRows: sortRows(staff),
    storeRows: sortRows(stores)
  };
}
