import type { OrderStatus } from "@/domain/order";

export type RedemptionStatus = "PENDING" | "REDEEMED" | "CANCELLED";

export type MarketingFilterInput = {
  month?: string | null;
  channel?: string | null;
};

export type MarketingFilters = {
  month: string;
  channel: string | null;
};

export type MarketingOrderInput = {
  channel: string;
  status: OrderStatus;
  totalCents: number;
};

export type MarketingRedemptionInput = {
  channel: string;
  status: RedemptionStatus;
  amountCents: number;
};

function currentMonthValue() {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function normalizeMarketingFilters(input: MarketingFilterInput = {}): MarketingFilters {
  const month = normalizeOptionalText(input.month);
  const validMonth = month && /^\d{4}-\d{2}$/.test(month) && !Number.isNaN(new Date(`${month}-01T00:00:00`).getTime()) ? month : currentMonthValue();

  return {
    month: validMonth,
    channel: normalizeOptionalText(input.channel)
  };
}

export function marketingMonthRange(month: string) {
  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);
  return { start, end };
}

export function buildMarketingSummary(input: { orders: MarketingOrderInput[]; redemptions: MarketingRedemptionInput[] }) {
  const channels = new Map<string, { channel: string; orderCount: number; revenueCents: number; redeemedCount: number }>();
  const metrics = {
    orderCount: input.orders.length,
    revenueCents: 0,
    redeemedCount: 0,
    redeemedAmountCents: 0,
    pendingRedemptionCount: 0,
    cancelledRedemptionCount: 0
  };

  for (const order of input.orders) {
    const channel = channels.get(order.channel) ?? { channel: order.channel, orderCount: 0, revenueCents: 0, redeemedCount: 0 };
    channel.orderCount += 1;
    if (order.status !== "CANCELLED") {
      channel.revenueCents += order.totalCents;
      metrics.revenueCents += order.totalCents;
    }
    channels.set(order.channel, channel);
  }

  for (const redemption of input.redemptions) {
    const channel = channels.get(redemption.channel) ?? { channel: redemption.channel, orderCount: 0, revenueCents: 0, redeemedCount: 0 };
    if (redemption.status === "REDEEMED") {
      channel.redeemedCount += 1;
      metrics.redeemedCount += 1;
      metrics.redeemedAmountCents += redemption.amountCents;
    }
    if (redemption.status === "PENDING") {
      metrics.pendingRedemptionCount += 1;
    }
    if (redemption.status === "CANCELLED") {
      metrics.cancelledRedemptionCount += 1;
    }
    channels.set(redemption.channel, channel);
  }

  return {
    metrics,
    channelRows: [...channels.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.redeemedCount - a.redeemedCount)
  };
}
