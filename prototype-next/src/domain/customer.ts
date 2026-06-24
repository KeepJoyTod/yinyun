import type { OrderStatus } from "@/domain/order";

export type CustomerUpdateInput = {
  name?: string | null;
  phone?: string | null;
  remark?: string | null;
};

export type CustomerUpdateDraft = {
  name?: string;
  phone?: string;
  remark?: string | null;
};

export type CustomerSummaryInput = {
  status: OrderStatus;
  totalCents: number;
};

export type CustomerSummary = {
  orderCount: number;
  completedCount: number;
  activeCount: number;
  cancelledCount: number;
  totalSpentCents: number;
};

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function updateCustomerDraft(input: CustomerUpdateInput): CustomerUpdateDraft {
  const draft: CustomerUpdateDraft = {};

  if (input.name !== undefined) {
    const name = normalizeOptionalText(input.name);
    if (!name) {
      throw new Error("请填写客户姓名");
    }
    draft.name = name;
  }

  if (input.phone !== undefined) {
    const phone = normalizeOptionalText(input.phone);
    if (!phone || phone.length < 6) {
      throw new Error("请填写有效手机号");
    }
    draft.phone = phone;
  }

  if (input.remark !== undefined) {
    draft.remark = normalizeOptionalText(input.remark);
  }

  return draft;
}

export function buildCustomerSummary(orders: CustomerSummaryInput[]): CustomerSummary {
  return orders.reduce<CustomerSummary>(
    (summary, order) => {
      summary.orderCount += 1;

      if (order.status === "COMPLETED") {
        summary.completedCount += 1;
      } else if (order.status === "CANCELLED") {
        summary.cancelledCount += 1;
      } else {
        summary.activeCount += 1;
      }

      if (order.status !== "CANCELLED") {
        summary.totalSpentCents += order.totalCents;
      }

      return summary;
    },
    {
      orderCount: 0,
      completedCount: 0,
      activeCount: 0,
      cancelledCount: 0,
      totalSpentCents: 0
    }
  );
}
