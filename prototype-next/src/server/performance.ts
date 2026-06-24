import { Prisma } from "@prisma/client";
import { buildCsv } from "@/domain/export-import";
import { buildPerformanceSummary, normalizePerformanceFilters, performanceMonthRange, type PerformanceFilterInput, type PerformanceOrderInput } from "@/domain/performance";
import { orderRows, stores } from "@/lib/camera-data";
import { prisma } from "@/lib/prisma";

function formatMoney(cents: number) {
  return `¥${(cents / 100).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function fallbackPerformanceData(input: PerformanceFilterInput = {}) {
  const filters = normalizePerformanceFilters(input);
  const orders: PerformanceOrderInput[] = orderRows.map((order, index) => ({
    storeName: stores[index % stores.length]?.name ?? "默认门店",
    staffName: index % 2 === 0 ? "张三" : "李四",
    status: order.status === "已完成" ? "COMPLETED" : order.status === "已取消" ? "CANCELLED" : order.status === "服务中" ? "IN_SERVICE" : order.status === "待服务" ? "WAITING_SERVICE" : "PENDING_CONFIRM",
    totalCents: Number(order.amount.replace(/[^\d.]/g, "")) * 100
  }));
  const summary = buildPerformanceSummary(orders);

  return {
    filters,
    staffRows: summary.staffRows.map((row) => [row.name, `${row.orderCount} 单`, `${row.completedCount} 单`, formatMoney(row.revenueCents)]),
    storeRows: summary.storeRows.map((row) => [row.name, `${row.orderCount} 单`, `${row.completedCount} 单`, formatMoney(row.revenueCents)]),
    stores: stores.map((store) => ({ id: store.name, name: store.name })),
    staff: [
      { id: "fallback-staff-1", name: "张三", storeName: "演示门店" },
      { id: "fallback-staff-2", name: "李四", storeName: "演示门店" }
    ],
    source: "fallback" as const
  };
}

export async function getPerformanceData(brandId: string, input: PerformanceFilterInput = {}) {
  const filters = normalizePerformanceFilters(input);
  const { start, end } = performanceMonthRange(filters.month);
  const where: Prisma.OrderWhereInput = {
    brandId,
    scheduledAt: { gte: start, lt: end }
  };

  if (filters.storeId) {
    where.storeId = filters.storeId;
  }

  if (filters.staffId) {
    where.staffId = filters.staffId;
  }

  try {
    const [orders, storeOptions, staffOptions] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          store: { select: { name: true } },
          staff: { select: { name: true } }
        },
        orderBy: { scheduledAt: "desc" }
      }),
      prisma.store.findMany({
        where: { brandId, enabled: true },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" }
      }),
      prisma.staff.findMany({
        where: { brandId, enabled: true },
        include: { store: { select: { name: true } } },
        orderBy: { createdAt: "asc" }
      })
    ]);
    const summary = buildPerformanceSummary(
      orders.map((order) => ({
        storeName: order.store.name,
        staffName: order.staff?.name ?? "未分配员工",
        status: order.status,
        totalCents: order.totalCents
      }))
    );

    return {
      filters,
      staffRows: summary.staffRows.map((row) => [row.name, `${row.orderCount} 单`, `${row.completedCount} 单`, formatMoney(row.revenueCents)]),
      storeRows: summary.storeRows.map((row) => [row.name, `${row.orderCount} 单`, `${row.completedCount} 单`, formatMoney(row.revenueCents)]),
      stores: storeOptions,
      staff: staffOptions.map((staff) => ({ id: staff.id, name: staff.name, storeName: staff.store?.name ?? "未绑定门店" })),
      source: "database" as const
    };
  } catch {
    return fallbackPerformanceData(input);
  }
}

export async function exportPerformanceCsv(brandId: string, input: PerformanceFilterInput = {}) {
  const data = await getPerformanceData(brandId, input);
  return buildCsv([
    ["月份", data.filters.month],
    [],
    ["员工业绩", "订单数", "完成数", "收入"],
    ...data.staffRows,
    [],
    ["门店月报", "订单数", "完成数", "收入"],
    ...data.storeRows
  ]);
}
