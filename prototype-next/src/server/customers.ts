import { orderRows } from "@/lib/camera-data";
import { buildCustomerSummary, updateCustomerDraft, type CustomerUpdateInput } from "@/domain/customer";
import type { OrderStatus } from "@/domain/order";
import { prisma } from "@/lib/prisma";

function formatMoney(cents: number) {
  return `¥${(cents / 100).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function statusLabel(status: OrderStatus | string) {
  const labels: Record<string, string> = {
    PENDING_CONFIRM: "待确认",
    WAITING_SERVICE: "待服务",
    IN_SERVICE: "服务中",
    COMPLETED: "已完成",
    CANCELLED: "已取消"
  };

  return labels[status] ?? status;
}

export type CustomerOrderPreview = {
  orderNo: string;
  scheduledAt: string;
  statusLabel: string;
  products: string;
  total: string;
};

export type CustomerManagementRow = {
  id: string;
  name: string;
  phone: string;
  remark: string;
  orderCount: number;
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
  totalSpent: string;
  latestOrderAt: string;
  recentOrders: CustomerOrderPreview[];
};

function toCustomerManagementRow(customer: {
  id: string;
  name: string;
  phone: string;
  remark: string | null;
  orders: Array<{
    orderNo: string;
    scheduledAt: Date;
    status: OrderStatus;
    totalCents: number;
    items: Array<{ name: string }>;
  }>;
}): CustomerManagementRow {
  const summary = buildCustomerSummary(customer.orders);
  const latestOrder = customer.orders[0] ?? null;

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    remark: customer.remark ?? "",
    orderCount: summary.orderCount,
    activeCount: summary.activeCount,
    completedCount: summary.completedCount,
    cancelledCount: summary.cancelledCount,
    totalSpent: formatMoney(summary.totalSpentCents),
    latestOrderAt: latestOrder ? formatDateTime(latestOrder.scheduledAt) : "-",
    recentOrders: customer.orders.slice(0, 5).map((order) => ({
      orderNo: order.orderNo,
      scheduledAt: formatDateTime(order.scheduledAt),
      statusLabel: statusLabel(order.status),
      products: order.items.map((item) => item.name).join("、") || "预约服务",
      total: formatMoney(order.totalCents)
    }))
  };
}

function fallbackCustomers(): CustomerManagementRow[] {
  return orderRows.map((order, index) => ({
    id: `fallback-customer-${index}`,
    name: order.customer,
    phone: order.phone,
    remark: "",
    orderCount: 1,
    activeCount: order.status === "已完成" || order.status === "已取消" ? 0 : 1,
    completedCount: order.status === "已完成" ? 1 : 0,
    cancelledCount: order.status === "已取消" ? 1 : 0,
    totalSpent: order.amount,
    latestOrderAt: "演示数据",
    recentOrders: [
      {
        orderNo: order.no,
        scheduledAt: "演示数据",
        statusLabel: order.status,
        products: "预约服务",
        total: order.amount
      }
    ]
  }));
}

export async function getCustomerManagementData(brandId: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: { brandId },
      include: {
        orders: {
          include: { items: { select: { name: true } } },
          orderBy: { scheduledAt: "desc" }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return {
      customers: customers.map(toCustomerManagementRow),
      source: "database" as const
    };
  } catch {
    return {
      customers: fallbackCustomers(),
      source: "fallback" as const
    };
  }
}

export async function updateCustomer(brandId: string, id: string, input: CustomerUpdateInput) {
  const existing = await prisma.customer.findFirst({
    where: { id, brandId },
    select: { id: true }
  });

  if (!existing) {
    throw new Error("客户不存在");
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: updateCustomerDraft(input),
    include: {
      orders: {
        include: { items: { select: { name: true } } },
        orderBy: { scheduledAt: "desc" }
      }
    }
  });

  return toCustomerManagementRow(customer);
}
