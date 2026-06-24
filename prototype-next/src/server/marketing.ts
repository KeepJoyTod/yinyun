import { ProductType, Prisma } from "@prisma/client";
import { buildCsv } from "@/domain/export-import";
import { buildMarketingSummary, normalizeMarketingFilters, marketingMonthRange, type MarketingFilterInput, type MarketingOrderInput, type MarketingRedemptionInput } from "@/domain/marketing";
import { orderRows, serviceGroups, stores } from "@/lib/camera-data";
import { prisma } from "@/lib/prisma";

function formatMoney(cents: number) {
  return `¥${(cents / 100).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function channelFromProductType(type: ProductType | string) {
  switch (type) {
    case "DOUYIN":
      return "抖音";
    case "MEITUAN":
      return "美团";
    case "GROUP_DEAL":
      return "团购";
    default:
      return "直营";
  }
}

function fallbackMarketingData(input: MarketingFilterInput = {}) {
  const filters = normalizeMarketingFilters(input);
  const orders: MarketingOrderInput[] = orderRows.map((order, index) => ({
    channel: index % 3 === 0 ? "抖音" : index % 3 === 1 ? "美团" : "团购",
    status: order.status === "已完成" ? "COMPLETED" : order.status === "已取消" ? "CANCELLED" : order.status === "服务中" ? "IN_SERVICE" : order.status === "待服务" ? "WAITING_SERVICE" : "PENDING_CONFIRM",
    totalCents: Number(order.amount.replace(/[^\d.]/g, "")) * 100
  }));
  const redemptions: MarketingRedemptionInput[] = [
    { channel: "抖音", status: "REDEEMED", amountCents: 2000 },
    { channel: "美团", status: "PENDING", amountCents: 1000 }
  ];
  const summary = buildMarketingSummary({ orders, redemptions });

  return {
    filters,
    metrics: {
      orderCount: String(summary.metrics.orderCount),
      revenue: formatMoney(summary.metrics.revenueCents),
      redeemedCount: String(summary.metrics.redeemedCount),
      redeemedAmount: formatMoney(summary.metrics.redeemedAmountCents)
    },
    channelRows: summary.channelRows.map((row) => [row.channel, `${row.orderCount} 单`, formatMoney(row.revenueCents), `${row.redeemedCount} 次`]),
    redemptionRows: redemptions.map((redemption, index) => [redemption.channel, redemption.status, formatMoney(redemption.amountCents), `券码-${index + 1}`]),
    orderRows: orders.map((order, index) => [order.channel, `YY20260531${String(index + 1).padStart(3, "0")}`, order.status, formatMoney(order.totalCents)]),
    stores: stores.map((store) => ({ id: store.name, name: store.name })),
    serviceGroups: serviceGroups.map((group, index) => ({ id: `fallback-service-group-${index}`, name: group.name, storeName: "演示门店" })),
    source: "fallback" as const
  };
}

function isMatchChannel(channel: string, selected?: string | null) {
  return !selected || channel === selected;
}

export async function getMarketingData(brandId: string, input: MarketingFilterInput = {}) {
  const filters = normalizeMarketingFilters(input);
  const { start, end } = marketingMonthRange(filters.month);
  const where: Prisma.OrderWhereInput = {
    brandId,
    scheduledAt: { gte: start, lt: end }
  };

  try {
    const [orders, redemptions, storeOptions, serviceGroupOptions] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          items: {
            include: {
              product: { select: { type: true } }
            }
          }
        },
        orderBy: { scheduledAt: "desc" }
      }),
      prisma.benefitRedemption.findMany({
        where: {
          brandId,
          createdAt: { gte: start, lt: end }
        },
        include: {
          customer: { select: { name: true } },
          order: { select: { orderNo: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 50
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

    const marketingOrders: MarketingOrderInput[] = orders
      .map((order) => ({
        channel: channelFromProductType(order.items[0]?.product.type ?? "SERVICE"),
        status: order.status,
        totalCents: order.totalCents
      }))
      .filter((order) => isMatchChannel(order.channel, filters.channel));
    const marketingRedemptionRows = redemptions
      .map((redemption) => ({
        channel: redemption.channel,
        status: redemption.status,
        amountCents: redemption.amountCents,
        note: redemption.order?.orderNo ?? redemption.customer?.name ?? redemption.code
      }))
      .filter((redemption) => isMatchChannel(redemption.channel, filters.channel));
    const marketingRedemptions: MarketingRedemptionInput[] = marketingRedemptionRows.map((redemption) => ({
      channel: redemption.channel,
      status: redemption.status,
      amountCents: redemption.amountCents
    }));
    const summary = buildMarketingSummary({ orders: marketingOrders, redemptions: marketingRedemptions });

    return {
      filters,
      metrics: {
        orderCount: String(summary.metrics.orderCount),
        revenue: formatMoney(summary.metrics.revenueCents),
        redeemedCount: String(summary.metrics.redeemedCount),
        redeemedAmount: formatMoney(summary.metrics.redeemedAmountCents)
      },
      channelRows: summary.channelRows.map((row) => [row.channel, `${row.orderCount} 单`, formatMoney(row.revenueCents), `${row.redeemedCount} 次`]),
      redemptionRows: marketingRedemptionRows.map((redemption) => [redemption.channel, redemption.status, formatMoney(redemption.amountCents), redemption.note]),
      orderRows: orders
        .map((order) => {
          const channel = channelFromProductType(order.items[0]?.product.type ?? "SERVICE");
          return [
            channel,
            order.orderNo,
            order.customer?.name ?? order.customer?.phone ?? order.customerId,
            order.status,
            formatMoney(order.totalCents)
          ];
        })
        .filter((row) => isMatchChannel(row[0], filters.channel)),
      stores: storeOptions,
      serviceGroups: serviceGroupOptions.map((group) => ({
        id: group.id,
        name: group.name,
        storeName: group.store?.name ?? "未绑定门店"
      })),
      source: "database" as const
    };
  } catch {
    return fallbackMarketingData(input);
  }
}

export async function exportMarketingCsv(brandId: string, input: MarketingFilterInput = {}) {
  const data = await getMarketingData(brandId, input);
  return buildCsv([
    ["月份", data.filters.month],
    ["渠道", data.filters.channel ?? "全部"],
    ["预约总数", data.metrics.orderCount],
    ["收入", data.metrics.revenue],
    ["核销数", data.metrics.redeemedCount],
    ["核销金额", data.metrics.redeemedAmount],
    [],
    ["渠道收入", "订单数", "收入", "核销数"],
    ...data.channelRows,
    [],
    ["核销明细", "状态", "金额", "备注"],
    ...data.redemptionRows,
    [],
    ["订购分析", "订单号", "客户/券码", "状态", "金额"],
    ...data.orderRows
  ]);
}
