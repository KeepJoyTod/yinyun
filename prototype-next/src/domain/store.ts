export type StoreDraftInput = {
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  enabled?: boolean;
};

export type StoreDraft = {
  name: string;
  phone: string | null;
  address: string | null;
  enabled: boolean;
};

export type StoreBusinessOrderInput = {
  status: "PENDING_CONFIRM" | "WAITING_SERVICE" | "IN_SERVICE" | "COMPLETED" | "CANCELLED";
  scheduledAt: Date;
};

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function createStoreDraft(input: StoreDraftInput): StoreDraft {
  const name = input.name?.trim() ?? "";

  if (!name) {
    throw new Error("请填写门店名称");
  }

  return {
    name,
    phone: normalizeOptionalText(input.phone),
    address: normalizeOptionalText(input.address),
    enabled: input.enabled ?? true
  };
}

export function updateStoreDraft(input: StoreDraftInput): Partial<StoreDraft> {
  const draft: Partial<StoreDraft> = {};

  if (input.name !== undefined) {
    const name = input.name?.trim() ?? "";
    if (!name) {
      throw new Error("请填写门店名称");
    }
    draft.name = name;
  }

  if (input.phone !== undefined) {
    draft.phone = normalizeOptionalText(input.phone);
  }

  if (input.address !== undefined) {
    draft.address = normalizeOptionalText(input.address);
  }

  if (input.enabled !== undefined) {
    draft.enabled = input.enabled;
  }

  return draft;
}

export function assertStoreCanBeDeleted({ orderCount }: { orderCount: number }) {
  if (orderCount > 0) {
    throw new Error("门店已有订单，不能删除");
  }
}

export function buildStoreBusinessMetrics(orders: StoreBusinessOrderInput[], month: string) {
  return orders.reduce(
    (metrics, order) => {
      const orderMonth = `${order.scheduledAt.getFullYear()}-${String(order.scheduledAt.getMonth() + 1).padStart(2, "0")}`;
      if (orderMonth === month) {
        metrics.monthOrderCount += 1;
      }
      if (order.status === "WAITING_SERVICE") {
        metrics.waitingServiceCount += 1;
      }
      return metrics;
    },
    {
      monthOrderCount: 0,
      waitingServiceCount: 0
    }
  );
}
