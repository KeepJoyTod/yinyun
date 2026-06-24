export type OrderStatus =
  | "PENDING_CONFIRM"
  | "WAITING_SERVICE"
  | "IN_SERVICE"
  | "COMPLETED"
  | "CANCELLED";

export type OrderSource = "WALK_IN" | "ONLINE" | "DOUYIN" | "MEITUAN" | "PHONE";
export type BookingMethod = "ONLINE" | "STORE" | "PHONE";

export type OrderAction = "CONFIRM" | "START_SERVICE" | "COMPLETE" | "CANCEL";

export type AvailableOrderAction = {
  action: OrderAction;
  label: string;
};

const transitions: Record<OrderStatus, Partial<Record<OrderAction, OrderStatus>>> = {
  PENDING_CONFIRM: {
    CONFIRM: "WAITING_SERVICE",
    CANCEL: "CANCELLED"
  },
  WAITING_SERVICE: {
    START_SERVICE: "IN_SERVICE",
    CANCEL: "CANCELLED"
  },
  IN_SERVICE: {
    COMPLETE: "COMPLETED",
    CANCEL: "CANCELLED"
  },
  COMPLETED: {},
  CANCELLED: {}
};

const actionLabels: Record<OrderAction, string> = {
  CONFIRM: "确认",
  START_SERVICE: "开始服务",
  COMPLETE: "完成",
  CANCEL: "取消"
};

export function nextOrderStatus(current: OrderStatus, action: OrderAction): OrderStatus {
  const next = transitions[current][action];

  if (!next) {
    throw new Error(`订单状态不允许从 ${current} 执行 ${action}`);
  }

  return next;
}

export function canTransitionOrder(current: OrderStatus, target: OrderStatus): boolean {
  return Object.values(transitions[current]).includes(target);
}

export function availableOrderActions(current: OrderStatus): AvailableOrderAction[] {
  return Object.keys(transitions[current]).map((action) => ({
    action: action as OrderAction,
    label: actionLabels[action as OrderAction]
  }));
}

export function orderStatusFromLabel(label: string): OrderStatus {
  const labels: Record<string, OrderStatus> = {
    待确认: "PENDING_CONFIRM",
    待服务: "WAITING_SERVICE",
    服务中: "IN_SERVICE",
    已完成: "COMPLETED",
    已取消: "CANCELLED"
  };

  return labels[label] ?? "PENDING_CONFIRM";
}

export type OrderUpdateInput = {
  scheduledAt?: string | null;
  staffId?: string | null;
  remark?: string | null;
};

export type OrderUpdateDraft = {
  scheduledAt?: Date;
  staffId?: string | null;
  remark?: string | null;
};

function normalizeNullableText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function normalizeCancelReason(value?: string | null) {
  const reason = normalizeNullableText(value);
  if (!reason) {
    throw new Error("请填写取消原因");
  }
  return reason;
}

export function buildOrderUpdateDraft(input: OrderUpdateInput): OrderUpdateDraft {
  const draft: OrderUpdateDraft = {};

  if (input.scheduledAt !== undefined) {
    const raw = normalizeNullableText(input.scheduledAt);
    if (!raw) {
      throw new Error("请选择预约时间");
    }
    const scheduledAt = new Date(raw);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new Error("预约时间格式错误");
    }
    draft.scheduledAt = scheduledAt;
  }

  if (input.staffId !== undefined) {
    draft.staffId = normalizeNullableText(input.staffId);
  }

  if (input.remark !== undefined) {
    draft.remark = normalizeNullableText(input.remark);
  }

  return draft;
}

function formatDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function orderSourceLabel(source: OrderSource | string) {
  const labels: Record<string, string> = {
    WALK_IN: "到店",
    ONLINE: "线上",
    DOUYIN: "抖音",
    MEITUAN: "美团",
    PHONE: "电话"
  };

  return labels[source] ?? source;
}

export function bookingMethodLabel(method: BookingMethod | string) {
  const labels: Record<string, string> = {
    ONLINE: "线上预约",
    STORE: "到店预约",
    PHONE: "电话预约"
  };

  return labels[method] ?? method;
}

export function buildOrderVisibleFields(input: {
  source: OrderSource | string;
  bookingMethod: BookingMethod | string;
  createdAt: Date;
  scheduledAt: Date;
}) {
  return {
    sourceLabel: orderSourceLabel(input.source),
    bookingMethodLabel: bookingMethodLabel(input.bookingMethod),
    createdAtDate: formatDateKey(input.createdAt),
    arrivalAtDate: formatDateKey(input.scheduledAt)
  };
}
