import { OrderStatus, Prisma, ProductType as PrismaProductType } from "@prisma/client";
import { dashboardOrders, metrics, orderRows, products, serviceGroups, stores } from "@/lib/camera-data";
import { buildAppointmentOverview, buildDashboardSummary } from "@/domain/dashboard";
import { availableOrderActions, buildOrderUpdateDraft, buildOrderVisibleFields, nextOrderStatus, normalizeCancelReason, orderStatusFromLabel, type BookingMethod, type OrderAction, type OrderSource } from "@/domain/order";
import { channelPluginStatus, createProductDraft, productTypeLabel, type ProductType } from "@/domain/product";
import { buildAppointmentSlots } from "@/domain/schedule";
import { prisma } from "@/lib/prisma";

export type StoreOption = {
  id: string;
  name: string;
};

export type StaffOption = {
  id: string;
  name: string;
  storeName: string;
};

export type ServiceGroupRow = {
  id: string;
  storeId: string | null;
  storeName: string;
  name: string;
  description: string;
  slotMinutes: number;
  capacityPerSlot: number;
  enabled: boolean;
  productCount: number;
};

export type OrderManagementRow = {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  storeName: string;
  products: string;
  scheduledAt: string;
  scheduledAtInput: string;
  source: OrderSource;
  sourceLabel: string;
  bookingMethod: BookingMethod;
  bookingMethodLabel: string;
  createdAtDate: string;
  arrivalAtDate: string;
  staffId: string | null;
  staffName: string;
  remark: string;
  status: OrderStatus;
  statusLabel: string;
  total: string;
  actions: Array<{ action: OrderAction; label: string }>;
};

export type ProductManagementRow = {
  id: string;
  serviceGroupId: string | null;
  name: string;
  nickname: string;
  type: ProductType;
  typeLabel: string;
  externalCode: string;
  selectionUnitPriceYuan: number;
  selectionUnitPrice: string;
  albumProductName: string;
  channelPluginEnabled: boolean;
  channelPluginMessage: string;
  serviceGroupName: string;
  priceYuan: number;
  price: string;
  durationMin: number;
  enabled: boolean;
};

export type GeneratedSlotSummary = {
  created: number;
  skipped: number;
  total: number;
};

export type DashboardFilterInput = {
  date?: string | null;
  storeId?: string | null;
  serviceGroupId?: string | null;
};

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

function formatDateTimeInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function todayInputValue() {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function normalizeDateInput(value?: string | null) {
  const raw = value?.trim();
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return todayInputValue();
  }

  const parsed = new Date(`${raw}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? todayInputValue() : raw;
}

function dateRangeForInput(value: string) {
  const start = new Date(`${value}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

function normalizeOptionalFilter(value?: string | null) {
  const raw = value?.trim() ?? "";
  return raw ? raw : null;
}

function fallbackDashboard(filters: DashboardFilterInput = {}) {
  const selectedDate = normalizeDateInput(filters.date);
  return {
    metrics,
    orders: dashboardOrders,
    businessRows: [
      ["预计收入", "¥18,600"],
      ["退款金额", "¥0"],
      ["服务完成", "9 单"],
      ["待确认", "5 单"]
    ],
    appointmentOverview: {
      statusRows: [
        ["待确认", "5 单"],
        ["待服务", "3 单"],
        ["服务中", "2 单"],
        ["已完成", "9 单"],
        ["已取消", "0 单"]
      ],
      workstationRows: stores.map((store) => [store.name, `${store.slots} 工位/档期`]),
      trendRows: [
        [selectedDate, "12 单"]
      ]
    },
    filters: {
      date: selectedDate,
      storeId: normalizeOptionalFilter(filters.storeId),
      serviceGroupId: normalizeOptionalFilter(filters.serviceGroupId)
    },
    stores: stores.map((store) => ({ id: store.name, name: store.name })),
    serviceGroups: serviceGroups.map((group, index) => ({ id: `fallback-service-group-${index}`, name: group.name, storeName: "演示门店" })),
    source: "fallback" as const
  };
}

export async function getDashboardOverview(brandId: string, filters: DashboardFilterInput = {}) {
  try {
    const selectedDate = normalizeDateInput(filters.date);
    const selectedStoreId = normalizeOptionalFilter(filters.storeId);
    const selectedServiceGroupId = normalizeOptionalFilter(filters.serviceGroupId);
    const { start, end } = dateRangeForInput(selectedDate);
    const where: Prisma.OrderWhereInput = {
      brandId,
      scheduledAt: { gte: start, lt: end }
    };

    if (selectedStoreId) {
      where.storeId = selectedStoreId;
    }

    if (selectedServiceGroupId) {
      where.serviceGroupId = selectedServiceGroupId;
    }

    const [summaryOrders, visibleOrders, overviewOrders, storeOptions, serviceGroupOptions] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          status: true,
          totalCents: true
        }
      }),
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          store: true,
          serviceGroup: true,
          items: true
        },
        orderBy: { scheduledAt: "asc" },
        take: 5
      }),
      prisma.order.findMany({
        where,
        include: { store: { select: { name: true } } },
        orderBy: { scheduledAt: "asc" }
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
    const summary = buildDashboardSummary(summaryOrders);
    const appointmentOverview = buildAppointmentOverview(overviewOrders.map((order) => ({
      status: order.status,
      startsAt: order.scheduledAt,
      storeName: order.store.name
    })));

    return {
      metrics: [
        { label: "预约总数", value: String(summary.totalCount), delta: selectedDate, tone: "success" as const },
        { label: "待确认", value: String(summary.pendingCount), delta: "需处理", tone: "warning" as const },
        { label: "进行中", value: String(summary.inServiceCount), delta: "服务中", tone: "neutral" as const },
        { label: "预计收入", value: formatMoney(summary.revenueCents), delta: "不含取消", tone: "success" as const }
      ],
      orders: visibleOrders.map((order) => ({
        title: `${order.customer.name} / ${order.store.name}`,
        subtitle: order.items.map((item) => item.name).join("、") || "预约服务",
        status: statusLabel(order.status),
        meta: `${formatDateTime(order.scheduledAt)} · ${order.serviceGroup?.name ?? "默认服务组"}`
      })),
      businessRows: [
        ["预约总数", `${summary.totalCount} 单`],
        ["预计收入", formatMoney(summary.revenueCents)],
        ["退款金额", "¥0"],
        ["待确认", `${summary.pendingCount} 单`],
        ["待服务", `${summary.waitingCount} 单`],
        ["服务中", `${summary.inServiceCount} 单`],
        ["服务完成", `${summary.completedCount} 单`],
        ["已取消", `${summary.cancelledCount} 单`]
      ],
      appointmentOverview,
      filters: {
        date: selectedDate,
        storeId: selectedStoreId,
        serviceGroupId: selectedServiceGroupId
      },
      stores: storeOptions,
      serviceGroups: serviceGroupOptions.map((group) => ({
        id: group.id,
        name: group.name,
        storeName: group.store?.name ?? "未绑定门店"
      })),
      source: "database" as const
    };
  } catch {
    return fallbackDashboard(filters);
  }
}

export async function getStoreRows(brandId: string) {
  try {
    const rows = await prisma.store.findMany({
      where: { brandId },
      include: {
        _count: {
          select: {
            staff: true,
            slots: true,
            orders: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return rows.map((store) => ({
      id: store.id,
      name: store.name,
      status: store.enabled ? "正常" : "停用",
      staff: store._count.staff,
      slots: `${store._count.orders}/${store._count.slots}`,
      phone: store.phone ?? "-",
      address: store.address ?? "-"
    }));
  } catch {
    return stores.map((store) => ({ ...store, id: store.name, address: "-" }));
  }
}

export async function getServiceGroupManagementData(brandId: string) {
  try {
    const [storeRows, groups] = await Promise.all([
      prisma.store.findMany({
        where: { brandId, enabled: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true }
      }),
      prisma.serviceGroup.findMany({
        where: { brandId },
        include: {
          store: { select: { id: true, name: true } },
          _count: { select: { products: true } }
        },
        orderBy: [{ enabled: "desc" }, { createdAt: "asc" }]
      })
    ]);

    return {
      stores: storeRows,
      groups: groups.map(toServiceGroupRow),
      source: "database" as const
    };
  } catch {
    return {
      stores: stores.map((store) => ({ id: store.name, name: store.name })),
      groups: serviceGroups.map((group, index) => ({
        id: `fallback-service-group-${index}`,
        storeId: null,
        storeName: "默认门店",
        name: group.name,
        description: "",
        slotMinutes: group.slotMinutes,
        capacityPerSlot: group.capacity,
        enabled: group.enabled,
        productCount: index + 1
      })),
      source: "fallback" as const
    };
  }
}

export async function getProductRows(brandId: string) {
  try {
    const data = await getProductManagementData(brandId);
    return data.products;
  } catch {
    return fallbackProductRows();
  }
}

export async function getProductManagementData(brandId: string) {
  try {
    const [productRows, groupRows] = await Promise.all([
      prisma.product.findMany({
        where: { brandId },
        include: { serviceGroup: { select: { id: true, name: true } } },
        orderBy: [{ enabled: "desc" }, { createdAt: "asc" }]
      }),
      prisma.serviceGroup.findMany({
        where: { brandId, enabled: true },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return {
      products: productRows.map(toProductManagementRow),
      serviceGroups: groupRows,
      source: "database" as const
    };
  } catch {
    return {
      products: fallbackProductRows(),
      serviceGroups: serviceGroups.map((group, index) => ({ id: `fallback-service-group-${index}`, name: group.name })),
      source: "fallback" as const
    };
  }
}

export async function createProduct(
  brandId: string,
  input: {
    serviceGroupId?: string | null;
    name: string;
    nickname?: string | null;
    type: ProductType;
    priceYuan: number;
    durationMin: number;
    externalCode?: string | null;
    selectionUnitPriceYuan?: number | null;
    albumProductName?: string | null;
  }
) {
  const draft = createProductDraft(input);
  const product = await prisma.product.create({
    data: {
      brandId,
      serviceGroupId: draft.serviceGroupId,
      name: draft.name,
      nickname: draft.nickname,
      externalCode: draft.externalCode,
      selectionUnitPriceCents: draft.selectionUnitPriceCents,
      albumProductName: draft.albumProductName,
      type: draft.type,
      priceCents: draft.priceCents,
      durationMin: draft.durationMin,
      enabled: true
    },
    include: { serviceGroup: { select: { id: true, name: true } } }
  });

  return toProductManagementRow(product);
}

export async function updateProduct(
  brandId: string,
  id: string,
  input: Partial<{
    serviceGroupId: string | null;
    name: string;
    nickname: string | null;
    externalCode: string | null;
    selectionUnitPriceYuan: number | null;
    albumProductName: string | null;
    type: ProductType;
    priceYuan: number;
    durationMin: number;
    enabled: boolean;
  }>
) {
  const existing = await prisma.product.findFirst({
    where: { id, brandId },
    select: { id: true, name: true, nickname: true, externalCode: true, selectionUnitPriceCents: true, albumProductName: true, type: true, priceCents: true, durationMin: true, serviceGroupId: true }
  });

  if (!existing) {
    throw new Error("产品不存在");
  }

  const draft =
    input.name ||
    input.type ||
    input.priceYuan !== undefined ||
    input.durationMin !== undefined ||
    input.serviceGroupId !== undefined ||
    input.externalCode !== undefined ||
    input.selectionUnitPriceYuan !== undefined ||
    input.albumProductName !== undefined
      ? createProductDraft({
          serviceGroupId: input.serviceGroupId === undefined ? existing.serviceGroupId : input.serviceGroupId,
          name: input.name ?? existing.name,
          nickname: input.nickname === undefined ? existing.nickname : input.nickname,
          externalCode: input.externalCode === undefined ? existing.externalCode : input.externalCode,
          selectionUnitPriceYuan: input.selectionUnitPriceYuan === undefined ? existing.selectionUnitPriceCents ? existing.selectionUnitPriceCents / 100 : null : input.selectionUnitPriceYuan,
          albumProductName: input.albumProductName === undefined ? existing.albumProductName : input.albumProductName,
          type: input.type ?? (existing.type as ProductType),
          priceYuan: input.priceYuan ?? existing.priceCents / 100,
          durationMin: input.durationMin ?? existing.durationMin
        })
      : null;

  const product = await prisma.product.update({
    where: { id },
    data: {
      serviceGroupId: draft?.serviceGroupId,
      name: draft?.name,
      nickname: draft?.nickname,
      externalCode: draft?.externalCode,
      selectionUnitPriceCents: draft?.selectionUnitPriceCents,
      albumProductName: draft?.albumProductName,
      type: draft?.type,
      priceCents: draft?.priceCents,
      durationMin: draft?.durationMin,
      enabled: input.enabled
    },
    include: { serviceGroup: { select: { id: true, name: true } } }
  });

  return toProductManagementRow(product);
}

export async function deleteProduct(brandId: string, id: string) {
  const existing = await prisma.product.findFirst({
    where: { id, brandId },
    select: { id: true }
  });

  if (!existing) {
    throw new Error("产品不存在");
  }

  await prisma.product.delete({ where: { id } });
}

export async function getOrderManagementData(brandId: string) {
  try {
    const [rows, staff] = await Promise.all([
      prisma.order.findMany({
        where: { brandId },
        include: {
          customer: true,
          store: true,
          staff: true,
          items: true
        },
        orderBy: { scheduledAt: "desc" },
        take: 50
      }),
      prisma.staff.findMany({
        where: { brandId, enabled: true },
        include: { store: { select: { name: true } } },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return {
      orders: rows.map(toOrderManagementRow),
      staff: staff.map((item) => ({ id: item.id, name: item.name, storeName: item.store?.name ?? "未绑定门店" })),
      source: "database" as const
    };
  } catch {
    return {
      orders: orderRows.map((order, index) => {
        const status = orderStatusFromLabel(order.status) as OrderStatus;
        const source = (index % 3 === 0 ? "DOUYIN" : index % 3 === 1 ? "MEITUAN" : "ONLINE") as OrderSource;
        return {
          id: `fallback-order-${index}`,
          orderNo: order.no,
          customerName: order.customer,
          customerPhone: order.phone,
          storeName: "威海智慧谷店",
          products: "预约服务",
          scheduledAt: "今日",
          scheduledAtInput: "",
          source,
          sourceLabel: source === "DOUYIN" ? "抖音" : source === "MEITUAN" ? "美团" : "线上",
          bookingMethod: "ONLINE" as BookingMethod,
          bookingMethodLabel: "线上预约",
          createdAtDate: todayInputValue(),
          arrivalAtDate: todayInputValue(),
          staffId: null,
          staffName: "未分配",
          remark: "",
          status,
          statusLabel: order.status,
          total: order.amount,
          actions: availableOrderActions(status)
        };
      }),
      staff: [],
      source: "fallback" as const
    };
  }
}

export async function getOrderTableRows(brandId: string) {
  const data = await getOrderManagementData(brandId);
  return data.orders;
}

export async function updateOrderAction(
  brandId: string,
  id: string,
  action: OrderAction,
  actor: string,
  input: { cancelReason?: string | null } = {}
) {
  const existing = await prisma.order.findFirst({
    where: { id, brandId },
    select: {
      id: true,
      status: true,
      orderNo: true,
      remark: true
    }
  });

  if (!existing) {
    throw new Error("订单不存在");
  }

  const nextStatus = nextOrderStatus(existing.status, action);
  const cancelReason = action === "CANCEL" ? normalizeCancelReason(input.cancelReason) : null;

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: nextStatus,
      remark: cancelReason ? [existing.remark, `取消原因：${cancelReason}`].filter(Boolean).join("\n") : undefined
    },
    include: {
      customer: true,
      store: true,
      staff: true,
      items: true
    }
  });

  await prisma.auditLog.create({
    data: {
      brandId,
      actor,
      action,
      target: `order:${existing.orderNo}`,
      detail: { from: existing.status, to: nextStatus, cancelReason }
    }
  });

  return toOrderManagementRow(order);
}

export async function updateOrderDetails(
  brandId: string,
  id: string,
  input: {
    scheduledAt?: string | null;
    staffId?: string | null;
    remark?: string | null;
  },
  actor: string
) {
  const existing = await prisma.order.findFirst({
    where: { id, brandId },
    select: { id: true, orderNo: true }
  });

  if (!existing) {
    throw new Error("订单不存在");
  }

  const draft = buildOrderUpdateDraft(input);

  if (draft.staffId) {
    const staff = await prisma.staff.findFirst({
      where: { id: draft.staffId, brandId, enabled: true },
      select: { id: true }
    });
    if (!staff) {
      throw new Error("员工不存在或已停用");
    }
  }

  const order = await prisma.order.update({
    where: { id },
    data: draft,
    include: {
      customer: true,
      store: true,
      staff: true,
      items: true
    }
  });

  await prisma.auditLog.create({
    data: {
      brandId,
      actor,
      action: "update_order_details",
      target: `order:${existing.orderNo}`,
      detail: input
    }
  });

  return toOrderManagementRow(order);
}
function toServiceGroupRow(group: {
  id: string;
  storeId: string | null;
  store: { id: string; name: string } | null;
  name: string;
  description: string | null;
  slotMinutes: number;
  capacityPerSlot: number;
  enabled: boolean;
  _count: { products: number };
}): ServiceGroupRow {
  return {
    id: group.id,
    storeId: group.storeId,
    storeName: group.store?.name ?? "未绑定门店",
    name: group.name,
    description: group.description ?? "",
    slotMinutes: group.slotMinutes,
    capacityPerSlot: group.capacityPerSlot,
    enabled: group.enabled,
    productCount: group._count.products
  };
}

export async function listServiceGroups(brandId: string) {
  const data = await getServiceGroupManagementData(brandId);
  return data.groups;
}

export async function createServiceGroup(
  brandId: string,
  data: {
    storeId?: string | null;
    name: string;
    description?: string;
    slotMinutes: number;
    capacityPerSlot: number;
  }
) {
  const group = await prisma.serviceGroup.create({
    data: {
      brandId,
      storeId: data.storeId || null,
      name: data.name,
      description: data.description || null,
      slotMinutes: data.slotMinutes,
      capacityPerSlot: data.capacityPerSlot,
      enabled: true
    },
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { products: true } }
    }
  });

  return toServiceGroupRow(group);
}

export async function updateServiceGroup(
  brandId: string,
  id: string,
  data: Partial<{
    storeId: string | null;
    name: string;
    description: string;
    slotMinutes: number;
    capacityPerSlot: number;
    enabled: boolean;
  }>
) {
  const existing = await prisma.serviceGroup.findFirst({
    where: { id, brandId },
    select: { id: true }
  });

  if (!existing) {
    throw new Error("服务组不存在");
  }

  const group = await prisma.serviceGroup.update({
    where: { id },
    data: {
      storeId: data.storeId === undefined ? undefined : data.storeId || null,
      name: data.name,
      description: data.description,
      slotMinutes: data.slotMinutes,
      capacityPerSlot: data.capacityPerSlot,
      enabled: data.enabled
    },
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { products: true } }
    }
  });

  return toServiceGroupRow(group);
}

export async function deleteServiceGroup(brandId: string, id: string) {
  const existing = await prisma.serviceGroup.findFirst({
    where: { id, brandId },
    select: { id: true }
  });

  if (!existing) {
    throw new Error("服务组不存在");
  }

  await prisma.serviceGroup.delete({
    where: { id }
  });
}

export async function generateServiceGroupSlots(
  brandId: string,
  id: string,
  input: {
    date: string;
    startTime: string;
    endTime: string;
  }
): Promise<GeneratedSlotSummary> {
  const group = await prisma.serviceGroup.findFirst({
    where: { id, brandId },
    select: {
      id: true,
      storeId: true,
      slotMinutes: true,
      capacityPerSlot: true,
      enabled: true
    }
  });

  if (!group) {
    throw new Error("服务组不存在");
  }

  if (!group.enabled) {
    throw new Error("停用的服务组不能生成档期");
  }

  if (!group.storeId) {
    throw new Error("服务组未绑定门店，不能生成档期");
  }

  const slots = buildAppointmentSlots({
    brandId,
    storeId: group.storeId,
    serviceGroupId: group.id,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    slotMinutes: group.slotMinutes,
    capacity: group.capacityPerSlot
  });

  const created = await prisma.appointmentSlot.createMany({
    data: slots,
    skipDuplicates: true
  });

  return {
    created: created.count,
    skipped: slots.length - created.count,
    total: slots.length
  };
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    PENDING_CONFIRM: "待确认",
    WAITING_SERVICE: "待服务",
    IN_SERVICE: "服务中",
    COMPLETED: "已完成",
    CANCELLED: "已取消"
  };

  return labels[status];
}

function toOrderManagementRow(order: {
  id: string;
  orderNo: string;
  customer: { name: string; phone: string };
  store: { name: string };
  staff?: { id: string; name: string } | null;
  items: Array<{ name: string }>;
  scheduledAt: Date;
  createdAt: Date;
  source: OrderSource | string;
  bookingMethod: BookingMethod | string;
  remark: string | null;
  status: OrderStatus;
  totalCents: number;
}): OrderManagementRow {
  const visibleFields = buildOrderVisibleFields({
    source: order.source,
    bookingMethod: order.bookingMethod,
    createdAt: order.createdAt,
    scheduledAt: order.scheduledAt
  });

  return {
    id: order.id,
    orderNo: order.orderNo,
    customerName: order.customer.name,
    customerPhone: maskPhone(order.customer.phone),
    storeName: order.store.name,
    products: order.items.map((item) => item.name).join("、") || "预约服务",
    scheduledAt: formatDateTime(order.scheduledAt),
    scheduledAtInput: formatDateTimeInput(order.scheduledAt),
    source: order.source as OrderSource,
    sourceLabel: visibleFields.sourceLabel,
    bookingMethod: order.bookingMethod as BookingMethod,
    bookingMethodLabel: visibleFields.bookingMethodLabel,
    createdAtDate: visibleFields.createdAtDate,
    arrivalAtDate: visibleFields.arrivalAtDate,
    staffId: order.staff?.id ?? null,
    staffName: order.staff?.name ?? "未分配",
    remark: order.remark ?? "",
    status: order.status,
    statusLabel: statusLabel(order.status),
    total: formatMoney(order.totalCents),
    actions: availableOrderActions(order.status)
  };
}

function toProductManagementRow(product: {
  id: string;
  serviceGroupId: string | null;
  serviceGroup: { id: string; name: string } | null;
  name: string;
  nickname: string | null;
  externalCode: string | null;
  selectionUnitPriceCents: number | null;
  albumProductName: string | null;
  type: PrismaProductType;
  priceCents: number;
  durationMin: number;
  enabled: boolean;
}): ProductManagementRow {
  const type = product.type as ProductType;
  const plugin = channelPluginStatus(type);
  return {
    id: product.id,
    serviceGroupId: product.serviceGroupId,
    name: product.name,
    nickname: product.nickname ?? "",
    type,
    typeLabel: productTypeLabel(type),
    externalCode: product.externalCode ?? "",
    selectionUnitPriceYuan: (product.selectionUnitPriceCents ?? 0) / 100,
    selectionUnitPrice: product.selectionUnitPriceCents ? formatMoney(product.selectionUnitPriceCents) : "-",
    albumProductName: product.albumProductName ?? "",
    channelPluginEnabled: plugin.enabled,
    channelPluginMessage: plugin.message,
    serviceGroupName: product.serviceGroup?.name ?? "未分配",
    priceYuan: product.priceCents / 100,
    price: formatMoney(product.priceCents),
    durationMin: product.durationMin,
    enabled: product.enabled
  };
}

function fallbackProductRows(): ProductManagementRow[] {
  return products.map((product, index) => ({
    id: `fallback-product-${index}`,
    serviceGroupId: null,
    name: product.name,
    nickname: "",
    type: product.type === "团单产品" ? "GROUP_DEAL" : product.type === "附加产品" ? "ADDITIONAL" : "SERVICE",
    typeLabel: product.type,
    externalCode: "",
    selectionUnitPriceYuan: 0,
    selectionUnitPrice: "-",
    albumProductName: "",
    channelPluginEnabled: true,
    channelPluginMessage: "已开通",
    serviceGroupName: "默认服务组",
    priceYuan: Number(product.price.replace(/[^\d.]/g, "")) || 0,
    price: product.price,
    durationMin: 30,
    enabled: product.enabled
  }));
}

function maskPhone(phone: string) {
  if (phone.length < 7) {
    return phone;
  }

  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}
