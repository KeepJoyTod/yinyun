import type { OrderStatus } from "@/domain/order";

export type DashboardOrderInput = {
  status: OrderStatus;
  totalCents: number;
};

export type DashboardSummary = {
  totalCount: number;
  pendingCount: number;
  waitingCount: number;
  inServiceCount: number;
  completedCount: number;
  cancelledCount: number;
  revenueCents: number;
};

export function buildDashboardSummary(orders: DashboardOrderInput[]): DashboardSummary {
  return orders.reduce<DashboardSummary>(
    (summary, order) => {
      summary.totalCount += 1;

      if (order.status === "PENDING_CONFIRM") {
        summary.pendingCount += 1;
      }
      if (order.status === "WAITING_SERVICE") {
        summary.waitingCount += 1;
      }
      if (order.status === "IN_SERVICE") {
        summary.inServiceCount += 1;
      }
      if (order.status === "COMPLETED") {
        summary.completedCount += 1;
      }
      if (order.status === "CANCELLED") {
        summary.cancelledCount += 1;
      } else {
        summary.revenueCents += order.totalCents;
      }

      return summary;
    },
    {
      totalCount: 0,
      pendingCount: 0,
      waitingCount: 0,
      inServiceCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      revenueCents: 0
    }
  );
}

export type AppointmentOverviewInput = {
  status: OrderStatus;
  startsAt: Date;
  storeName: string;
};

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildAppointmentOverview(orders: AppointmentOverviewInput[]) {
  const statusCounts: Record<OrderStatus, number> = {
    PENDING_CONFIRM: 0,
    WAITING_SERVICE: 0,
    IN_SERVICE: 0,
    COMPLETED: 0,
    CANCELLED: 0
  };
  const storeSlots = new Map<string, number>();
  const trend = new Map<string, number>();

  for (const order of orders) {
    statusCounts[order.status] += 1;
    storeSlots.set(order.storeName, (storeSlots.get(order.storeName) ?? 0) + 1);
    const key = dateKey(order.startsAt);
    trend.set(key, (trend.get(key) ?? 0) + 1);
  }

  return {
    statusRows: [
      ["待确认", `${statusCounts.PENDING_CONFIRM} 单`],
      ["待服务", `${statusCounts.WAITING_SERVICE} 单`],
      ["服务中", `${statusCounts.IN_SERVICE} 单`],
      ["已完成", `${statusCounts.COMPLETED} 单`],
      ["已取消", `${statusCounts.CANCELLED} 单`]
    ],
    workstationRows: [...storeSlots.entries()].map(([storeName, count]) => [storeName, `${count} 个预约时段`]),
    trendRows: [...trend.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => [date, `${count} 单`])
  };
}
