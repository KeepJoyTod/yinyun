import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { buildCsv } from "@/domain/export-import";
import { buildReportSummary, normalizeReportFilters, reportDateRange, type ReportFilterInput, type ReportOrderInput } from "@/domain/report";
import { orderRows, products, serviceGroups, stores } from "@/lib/camera-data";
import { prisma } from "@/lib/prisma";

export type ReportData = Awaited<ReturnType<typeof getReportData>>;

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

function paymentStatusLabel(status: PaymentStatus | string) {
  const labels: Record<string, string> = {
    UNPAID: "待收款",
    PAID: "已收款",
    REFUNDED: "已退款"
  };

  return labels[status] ?? status;
}

function toReportOrderInput(order: {
  orderNo: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalCents: number;
  serviceGroup: { name: string } | null;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
}): ReportOrderInput {
  return {
    orderNo: order.orderNo,
    status: order.status,
    paymentStatus: order.paymentStatus,
    serviceGroupName: order.serviceGroup?.name ?? "未分组",
    totalCents: order.totalCents,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      priceCents: item.priceCents
    }))
  };
}

function fallbackReportData(input: ReportFilterInput = {}) {
  const filters = normalizeReportFilters(input);
  const fallbackOrders: ReportOrderInput[] = orderRows.map((order, index) => ({
    orderNo: order.no,
    status: order.status === "已完成" ? "COMPLETED" : order.status === "已取消" ? "CANCELLED" : order.status === "服务中" ? "IN_SERVICE" : order.status === "待服务" ? "WAITING_SERVICE" : "PENDING_CONFIRM",
    paymentStatus: order.status === "已完成" ? "PAID" : "UNPAID",
    serviceGroupName: serviceGroups[index % serviceGroups.length]?.name ?? "默认服务组",
    totalCents: Number(order.amount.replace(/[^\d.]/g, "")) * 100,
    items: [
      {
        name: products[index % products.length]?.name ?? "预约服务",
        quantity: 1,
        priceCents: Number(order.amount.replace(/[^\d.]/g, "")) * 100
      }
    ]
  }));
  const summary = buildReportSummary(fallbackOrders);

  return {
    filters,
    metrics: {
      orderCount: String(summary.metrics.orderCount),
      grossRevenue: formatMoney(summary.metrics.grossRevenueCents),
      paidRevenue: formatMoney(summary.metrics.paidCents),
      refundedRevenue: formatMoney(summary.metrics.refundedCents)
    },
    serviceGroupRows: summary.serviceGroupRows.map((row) => [row.name, `${row.orderCount} 单`, formatMoney(row.revenueCents)]),
    productRows: summary.productRows.map((row) => [row.name, `${row.quantity} 件`, formatMoney(row.revenueCents)]),
    paymentRows: [
      ["待收款", `${fallbackOrders.filter((order) => order.paymentStatus === "UNPAID").length} 单`, formatMoney(summary.metrics.unpaidCents)],
      ["已收款", `${fallbackOrders.filter((order) => order.paymentStatus === "PAID").length} 单`, formatMoney(summary.metrics.paidCents)],
      ["已退款", `${fallbackOrders.filter((order) => order.paymentStatus === "REFUNDED").length} 单`, formatMoney(summary.metrics.refundedCents)]
    ],
    orderRows: fallbackOrders.map((order) => [order.orderNo, order.serviceGroupName, statusLabel(order.status), paymentStatusLabel(order.paymentStatus), formatMoney(order.totalCents)]),
    stores: stores.map((store) => ({ id: store.name, name: store.name })),
    serviceGroups: serviceGroups.map((group, index) => ({ id: `fallback-service-group-${index}`, name: group.name, storeName: "演示门店" })),
    source: "fallback" as const
  };
}

export async function getReportData(brandId: string, input: ReportFilterInput = {}) {
  const filters = normalizeReportFilters(input);
  const { start, end } = reportDateRange(filters.date);
  const where: Prisma.OrderWhereInput = {
    brandId,
    scheduledAt: { gte: start, lt: end }
  };

  if (filters.storeId) {
    where.storeId = filters.storeId;
  }

  if (filters.serviceGroupId) {
    where.serviceGroupId = filters.serviceGroupId;
  }

  try {
    const [orders, storeOptions, serviceGroupOptions] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true } },
          store: { select: { name: true } },
          serviceGroup: { select: { name: true } },
          items: { select: { name: true, quantity: true, priceCents: true } }
        },
        orderBy: { scheduledAt: "desc" }
      }),
      prisma.store.findMany({
        where: { brandId, enabled: true },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" }
      }),
      prisma.serviceGroup.findMany({
        where: { brandId, enabled: true },
        include: { store: { select: { name: true } } },
        orderBy: { createdAt: "asc" }
      })
    ]);
    const summary = buildReportSummary(orders.map(toReportOrderInput));

    return {
      filters,
      metrics: {
        orderCount: String(summary.metrics.orderCount),
        grossRevenue: formatMoney(summary.metrics.grossRevenueCents),
        paidRevenue: formatMoney(summary.metrics.paidCents),
        refundedRevenue: formatMoney(summary.metrics.refundedCents)
      },
      serviceGroupRows: summary.serviceGroupRows.map((row) => [row.name, `${row.orderCount} 单`, formatMoney(row.revenueCents)]),
      productRows: summary.productRows.map((row) => [row.name, `${row.quantity} 件`, formatMoney(row.revenueCents)]),
      paymentRows: [
        ["待收款", `${orders.filter((order) => order.paymentStatus === "UNPAID").length} 单`, formatMoney(summary.metrics.unpaidCents)],
        ["已收款", `${orders.filter((order) => order.paymentStatus === "PAID").length} 单`, formatMoney(summary.metrics.paidCents)],
        ["已退款", `${orders.filter((order) => order.paymentStatus === "REFUNDED").length} 单`, formatMoney(summary.metrics.refundedCents)]
      ],
      orderRows: orders.slice(0, 20).map((order) => [
        order.orderNo,
        order.customer.name,
        order.store.name,
        order.serviceGroup?.name ?? "未分组",
        statusLabel(order.status),
        paymentStatusLabel(order.paymentStatus),
        formatDateTime(order.scheduledAt),
        formatMoney(order.totalCents)
      ]),
      stores: storeOptions,
      serviceGroups: serviceGroupOptions.map((group) => ({
        id: group.id,
        name: group.name,
        storeName: group.store?.name ?? "未绑定门店"
      })),
      source: "database" as const
    };
  } catch {
    return fallbackReportData(input);
  }
}

export async function exportReportCsv(brandId: string, input: ReportFilterInput = {}) {
  const data = await getReportData(brandId, input);
  return buildCsv([
    ["报表日期", data.filters.date],
    ["预约总数", data.metrics.orderCount],
    ["预计收入", data.metrics.grossRevenue],
    ["已收款", data.metrics.paidRevenue],
    ["已退款", data.metrics.refundedRevenue],
    [],
    ["服务组", "订单数", "收入"],
    ...data.serviceGroupRows,
    [],
    ["产品", "数量", "收入"],
    ...data.productRows,
    [],
    ["收支状态", "订单数", "金额"],
    ...data.paymentRows
  ]);
}
