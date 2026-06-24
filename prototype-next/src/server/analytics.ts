import { Prisma } from "@prisma/client";
import { buildCustomerAnalysis, buildProductAnalysis, buildReviewSummary } from "@/domain/analysis";
import { normalizeReportFilters, reportDateRange, type ReportFilterInput } from "@/domain/report";
import { orderRows, products, serviceGroups, stores } from "@/lib/camera-data";
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

function fallbackAnalyticsData(input: ReportFilterInput = {}) {
  const filters = normalizeReportFilters(input);
  return {
    filters,
    customerMetrics: {
      customerCount: String(orderRows.length),
      repeatCustomerCount: "0",
      activeCustomerCount: String(orderRows.filter((order) => order.status !== "已完成" && order.status !== "已取消").length),
      averageOrderValue: "¥76"
    },
    productRows: products.map((product, index) => [product.name, `${index + 1} 件`, product.price]),
    reviewSummary: {
      reviewCount: "1",
      averageRating: "5"
    },
    reviewRows: [["5", "测试客户", "YY20260531001", "服务不错，出片很快", "演示数据"]],
    stores: stores.map((store) => ({ id: store.name, name: store.name })),
    serviceGroups: serviceGroups.map((group, index) => ({ id: `fallback-service-group-${index}`, name: group.name, storeName: "演示门店" })),
    source: "fallback" as const
  };
}

export async function getAnalyticsData(brandId: string, input: ReportFilterInput = {}) {
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
    const [orders, reviews, storeOptions, serviceGroupOptions] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { select: { name: true, quantity: true, priceCents: true } }
        }
      }),
      prisma.customerReview.findMany({
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
    const customerAnalysis = buildCustomerAnalysis(orders.map((order) => ({ customerId: order.customerId, status: order.status, totalCents: order.totalCents })));
    const productAnalysis = buildProductAnalysis(orders.map((order) => ({ status: order.status, items: order.items })));
    const reviewSummary = buildReviewSummary(reviews);

    return {
      filters,
      customerMetrics: {
        customerCount: String(customerAnalysis.customerCount),
        repeatCustomerCount: String(customerAnalysis.repeatCustomerCount),
        activeCustomerCount: String(customerAnalysis.activeCustomerCount),
        averageOrderValue: formatMoney(customerAnalysis.averageOrderValueCents)
      },
      productRows: productAnalysis.map((row) => [row.name, `${row.quantity} 件`, formatMoney(row.revenueCents)]),
      reviewSummary: {
        reviewCount: String(reviewSummary.reviewCount),
        averageRating: String(reviewSummary.averageRating)
      },
      reviewRows: reviews.map((review) => [
        String(review.rating),
        review.customer?.name ?? "匿名客户",
        review.order?.orderNo ?? "-",
        review.content ?? "-",
        formatDateTime(review.createdAt)
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
    return fallbackAnalyticsData(input);
  }
}
