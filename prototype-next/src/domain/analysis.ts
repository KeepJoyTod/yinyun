import type { OrderStatus } from "@/domain/order";

export type CustomerAnalysisOrder = {
  customerId: string;
  status: OrderStatus;
  totalCents: number;
};

export type ProductAnalysisOrder = {
  status: OrderStatus;
  items: Array<{
    name: string;
    quantity: number;
    priceCents: number;
  }>;
};

export function buildCustomerAnalysis(orders: CustomerAnalysisOrder[]) {
  const customerOrders = new Map<string, CustomerAnalysisOrder[]>();

  for (const order of orders) {
    customerOrders.set(order.customerId, [...(customerOrders.get(order.customerId) ?? []), order]);
  }

  const nonCancelledOrders = orders.filter((order) => order.status !== "CANCELLED");
  const totalRevenue = nonCancelledOrders.reduce((sum, order) => sum + order.totalCents, 0);

  return {
    customerCount: customerOrders.size,
    repeatCustomerCount: [...customerOrders.values()].filter((rows) => rows.length > 1).length,
    activeCustomerCount: [...customerOrders.values()].filter((rows) => rows.some((order) => order.status !== "CANCELLED" && order.status !== "COMPLETED")).length,
    cancelledCustomerCount: [...customerOrders.values()].filter((rows) => rows.every((order) => order.status === "CANCELLED")).length,
    averageOrderValueCents: nonCancelledOrders.length ? Math.round(totalRevenue / nonCancelledOrders.length) : 0
  };
}

export function buildProductAnalysis(orders: ProductAnalysisOrder[]) {
  const products = new Map<string, { name: string; quantity: number; revenueCents: number }>();

  for (const order of orders) {
    if (order.status === "CANCELLED") {
      continue;
    }

    for (const item of order.items) {
      const current = products.get(item.name) ?? { name: item.name, quantity: 0, revenueCents: 0 };
      current.quantity += item.quantity;
      current.revenueCents += item.priceCents * item.quantity;
      products.set(item.name, current);
    }
  }

  return [...products.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.quantity - a.quantity);
}

export function buildReviewSummary(reviews: Array<{ rating: number }>) {
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    reviewCount: reviews.length,
    averageRating: reviews.length ? Number((total / reviews.length).toFixed(1)) : 0
  };
}
