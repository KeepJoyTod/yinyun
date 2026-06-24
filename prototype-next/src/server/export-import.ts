import { buildCsv } from "@/domain/export-import";
import { buildOrderVisibleFields } from "@/domain/order";
import { prisma } from "@/lib/prisma";

function formatMoney(cents: number) {
  return `¥${(cents / 100).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_CONFIRM: "待确认",
    WAITING_SERVICE: "待服务",
    IN_SERVICE: "服务中",
    COMPLETED: "已完成",
    CANCELLED: "已取消"
  };

  return labels[status] ?? status;
}

export async function exportOrdersCsv(brandId: string) {
  const orders = await prisma.order.findMany({
    where: { brandId },
    include: {
      customer: true,
      store: true,
      serviceGroup: true,
      items: true
    },
    orderBy: { scheduledAt: "desc" }
  });

  return buildCsv([
    ["订单号", "客户", "手机号", "门店", "来源", "预约方式", "下单时间", "到店时间", "服务组", "状态", "金额", "产品"],
    ...orders.map((order) => {
      const visible = buildOrderVisibleFields({
        source: order.source,
        bookingMethod: order.bookingMethod,
        createdAt: order.createdAt,
        scheduledAt: order.scheduledAt
      });
      return [
        order.orderNo,
        order.customer.name,
        order.customer.phone,
        order.store.name,
        visible.sourceLabel,
        visible.bookingMethodLabel,
        formatDateTime(order.createdAt),
        formatDateTime(order.scheduledAt),
        order.serviceGroup?.name ?? "",
        statusLabel(order.status),
        formatMoney(order.totalCents),
        order.items.map((item) => item.name).join("、")
      ];
    })
  ]);
}

export async function exportCustomersCsv(brandId: string) {
  const customers = await prisma.customer.findMany({
    where: { brandId },
    include: {
      orders: {
        select: {
          status: true,
          totalCents: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return buildCsv([
    ["客户", "手机号", "备注", "订单数", "已完成", "消费金额"],
    ...customers.map((customer) => {
      const completed = customer.orders.filter((order) => order.status === "COMPLETED").length;
      const spent = customer.orders.filter((order) => order.status !== "CANCELLED").reduce((sum, order) => sum + order.totalCents, 0);
      return [customer.name, customer.phone, customer.remark ?? "", String(customer.orders.length), String(completed), formatMoney(spent)];
    })
  ]);
}
